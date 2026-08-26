import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AccountApiService } from '../../../accounts/data/account-api.service';
import { DatePickerComponent } from '../../../../shared/ui/date-picker/date-picker';
import { TransactionsFacade } from '../../facades/transactions.facade';
import { PaymentMethod, Transaction, TransactionType } from '../../models/models.transaction';
import { UnsavedChangesAware } from './unsaved-changes.guard';
import {
  AccountOption,
  BANK_CONTROLLED_FIELDS,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
  applyTypeValidators,
  buildTransactionPayload,
  createTransactionForm,
  maskAccountNumber
} from './transaction-form.util';

// One reusable form for both Add (/transactions/add) and Edit (/transactions/edit/:id).
@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DatePickerComponent],
  templateUrl: './transaction-form.html',
  styleUrl: './transaction-form.scss'
})
export class TransactionForm implements OnInit, UnsavedChangesAware {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly facade = inject(TransactionsFacade);
  private readonly accountApi = inject(AccountApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly paymentMethods = PAYMENT_METHODS;
  readonly bankTooltip = 'This value was provided by your financial institution and cannot be changed.';
  readonly form: FormGroup = createTransactionForm(this.fb, this.today());

  mode: 'add' | 'edit' = 'add';
  transactionId: string | null = null;
  accountOptions: AccountOption[] = [];
  categoryOptions: string[] = EXPENSE_CATEGORIES;

  loadingTransaction = false;
  loadError: string | null = null;
  saving = false;
  submissionError: string | null = null;
  successMessage: string | null = null;
  tagInput = '';

  showLeaveModal = false;
  private leaveResolver: ((leave: boolean) => void) | null = null;

  private selected: Transaction | null = null;
  private pendingSubmit = false;
  private pendingSaveNew = false;
  private saved = false;
  // One idempotency key per create attempt; reused on retry, cleared after success.
  private idempotencyKey: string | null = null;
  private suppressTypeReset = false;

  ngOnInit(): void {
    this.transactionId = this.route.snapshot.paramMap.get('id');
    this.mode = this.transactionId ? 'edit' : 'add';

    this.accountApi
      .getAccounts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((accounts) => {
        this.accountOptions = accounts
          .filter((account) => (account.status || '').toLowerCase() === 'active')
          .map((account) => ({
            id: account.id,
            name: account.accountName,
            status: account.status,
            label: `${account.accountName} (${maskAccountNumber(account.accountNumber)})`
          }));
      });

    applyTypeValidators(this.form, 'Expense', '');

    this.form
      .get('type')!
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((type: TransactionType) => this.onTypeChange(type));

    this.form
      .get('paymentMethod')!
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((method: PaymentMethod | '') =>
        applyTypeValidators(this.form, this.form.get('type')!.value, method ?? '')
      );

    if (this.mode === 'edit' && this.transactionId) {
      this.loadForEdit(this.transactionId);
    }

    // React to save results (only after the user submits).
    this.facade.error$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((error) => {
      if (this.pendingSubmit && error) {
        this.submissionError = 'Something went wrong. Please try again.';
        this.pendingSubmit = false;
        this.pendingSaveNew = false;
        this.saving = false;
      }
    });

    this.facade.successMessage$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((message) => {
      if (this.pendingSubmit && message) {
        this.onSaveSuccess(message);
      }
    });
  }

  // --- Titles / labels ---
  get pageTitle(): string {
    return this.mode === 'edit' ? 'Edit Transaction' : 'Add Transaction';
  }

  get primaryLabel(): string {
    return this.mode === 'edit' ? 'Save Changes' : 'Add Transaction';
  }

  // --- Type-driven UI ---
  get selectedType(): TransactionType {
    return this.form.get('type')!.value;
  }

  private onTypeChange(type: TransactionType): void {
    this.categoryOptions = type === 'Income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    applyTypeValidators(this.form, type, this.form.get('paymentMethod')!.value ?? '');

    if (this.suppressTypeReset) {
      return;
    }
    if (type === 'Transfer') {
      this.form.patchValue({ category: '', accountId: '', paymentMethod: '' }, { emitEvent: false });
    } else {
      this.form.patchValue({ fromAccountId: '', toAccountId: '' }, { emitEvent: false });
    }
  }

  // --- Bank-synced read-only handling ---
  isFieldReadOnly(field: string): boolean {
    return (
      this.mode === 'edit' &&
      this.selected?.source === 'Bank Sync' &&
      (BANK_CONTROLLED_FIELDS as readonly string[]).includes(field)
    );
  }

  control(name: string) {
    return this.form.get(name)!;
  }

  isInvalid(name: string): boolean {
    const control = this.form.get(name)!;
    return control.invalid && (control.touched || control.dirty);
  }

  // --- Tags ---
  get tags(): string[] {
    return this.form.get('tags')!.value ?? [];
  }

  addTag(): void {
    const value = this.tagInput.trim();
    this.tagInput = '';
    if (!value) {
      return;
    }
    const tags = this.tags;
    if (value.length > 30 || tags.length >= 10 || tags.some((tag) => tag.toLowerCase() === value.toLowerCase())) {
      return;
    }
    this.form.get('tags')!.setValue([...tags, value]);
    this.form.markAsDirty();
  }

  removeTag(tag: string): void {
    this.form.get('tags')!.setValue(this.tags.filter((item) => item !== tag));
    this.form.markAsDirty();
  }

  // --- Submit ---
  onSubmit(saveNew = false): void {
    if (this.saving) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submissionError = null;
    this.successMessage = null;
    this.pendingSubmit = true;
    this.pendingSaveNew = saveNew;
    this.saving = true;

    const value = this.form.getRawValue();

    if (this.mode === 'add') {
      if (!this.idempotencyKey) {
        this.idempotencyKey = crypto.randomUUID();
      }
      this.facade.createTransaction(buildTransactionPayload(value, this.accountOptions), this.idempotencyKey);
      return;
    }

    if (this.transactionId) {
      this.facade.updateTransaction(this.transactionId, this.buildEditChanges(value));
    }
  }

  onSaveAndNew(): void {
    this.onSubmit(true);
  }

  onCancel(): void {
    this.router.navigate(['/transactions']);
  }

  goToList(): void {
    this.saved = true;
    this.router.navigate(['/transactions']);
  }

  // --- Unsaved-changes guard hooks ---
  canLeave(): boolean {
    return this.saved || !this.form.dirty;
  }

  confirmLeave(): Promise<boolean> {
    this.showLeaveModal = true;
    return new Promise<boolean>((resolve) => (this.leaveResolver = resolve));
  }

  stayOnPage(): void {
    this.showLeaveModal = false;
    this.leaveResolver?.(false);
    this.leaveResolver = null;
  }

  leaveWithoutSaving(): void {
    this.showLeaveModal = false;
    this.leaveResolver?.(true);
    this.leaveResolver = null;
  }

  private loadForEdit(id: string): void {
    this.loadingTransaction = true;
    this.facade.loadTransaction(id);

    this.facade.selectedLoading$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((loading) => {
      this.loadingTransaction = loading;
    });

    this.facade.selectedError$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((error) => {
      this.loadError = error;
    });

    this.facade.selectedTransaction$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((transaction) => {
      if (transaction) {
        this.populateForm(transaction);
      }
    });
  }

  private populateForm(transaction: Transaction): void {
    this.selected = transaction;
    this.suppressTypeReset = true;
    this.form.patchValue({
      type: transaction.type,
      date: transaction.date,
      amount: transaction.amount,
      description: transaction.description,
      category: transaction.category ?? '',
      accountId: transaction.accountId ?? '',
      fromAccountId: transaction.fromAccountId ?? '',
      toAccountId: transaction.toAccountId ?? '',
      paymentMethod: transaction.paymentMethod ?? '',
      referenceNumber: transaction.referenceNumber ?? '',
      notes: transaction.notes ?? '',
      tags: transaction.tags ?? []
    });
    this.categoryOptions = transaction.type === 'Income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    applyTypeValidators(this.form, transaction.type, transaction.paymentMethod ?? '');
    this.suppressTypeReset = false;

    // Lock institution-controlled fields for bank-synced records.
    if (transaction.source === 'Bank Sync') {
      BANK_CONTROLLED_FIELDS.forEach((field) => this.form.get(field)?.disable({ emitEvent: false }));
    }

    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  // Builds the edit payload, omitting read-only (institution-controlled) fields.
  private buildEditChanges(value: ReturnType<FormGroup['getRawValue']>): Partial<Transaction> {
    const changes: Partial<Transaction> = buildTransactionPayload(value, this.accountOptions);
    if (this.selected?.source === 'Bank Sync') {
      delete changes.amount;
      delete changes.description;
      delete changes.merchant;
      delete changes.date;
      delete changes.accountId;
      delete changes.accountName;
      delete changes.referenceNumber;
    }
    return changes;
  }

  private onSaveSuccess(message: string): void {
    this.pendingSubmit = false;
    this.saving = false;
    // Success: drop the key so the next new transaction gets a fresh one.
    this.idempotencyKey = null;

    if (this.pendingSaveNew) {
      this.pendingSaveNew = false;
      this.successMessage = message;
      const keepType = this.form.get('type')!.value;
      this.form.reset({ type: keepType, date: this.today(), amount: null, paymentMethod: '', tags: [] });
      applyTypeValidators(this.form, keepType, '');
      this.form.markAsPristine();
      return;
    }

    this.saved = true;
    this.router.navigate(['/transactions']);
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
