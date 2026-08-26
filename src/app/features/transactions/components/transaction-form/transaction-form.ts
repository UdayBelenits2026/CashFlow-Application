import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AccountApiService } from '../../../accounts/data/account-api.service';
import { DatePickerComponent } from '../../../../shared/ui/date-picker/date-picker';
import { TransactionsFacade } from '../../facades/transactions.facade';
import { AccountOption, PaymentMethod, Transaction, TransactionType } from '../../models/models.transaction';
import { UnsavedChangesAware } from './unsaved-changes.guard';
import {
  PAYMENT_METHODS,
  addTagToList,
  applyTypeValidators,
  buildEditChanges,
  buildTransactionPayload,
  categoriesFor,
  createTransactionForm,
  getToday,
  isReadOnlyField,
  lockBankControlledFields,
  mapAccountsToOptions,
  transactionToFormPatch
} from '../../utility/transaction-form-utils';

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
  readonly form: FormGroup = createTransactionForm(this.fb, getToday());

  mode: 'add' | 'edit' = 'add';
  transactionId: string | null = null;
  accountOptions: AccountOption[] = [];
  categoryOptions: string[] = categoriesFor('Expense');

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
      .subscribe((accounts) => (this.accountOptions = mapAccountsToOptions(accounts)));

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
    this.categoryOptions = categoriesFor(type);
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
    return isReadOnlyField(this.mode, this.selected?.source, field);
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
    const next = addTagToList(this.tags, this.tagInput.trim());
    this.tagInput = '';
    if (next) {
      this.form.get('tags')!.setValue(next);
      this.form.markAsDirty();
    }
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
      this.idempotencyKey ??= crypto.randomUUID();
      this.facade.createTransaction(buildTransactionPayload(value, this.accountOptions), this.idempotencyKey);
      return;
    }

    if (this.transactionId) {
      this.facade.updateTransaction(
        this.transactionId,
        buildEditChanges(value, this.accountOptions, this.selected?.source === 'Bank Sync')
      );
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
    this.form.patchValue(transactionToFormPatch(transaction));
    this.categoryOptions = categoriesFor(transaction.type);
    applyTypeValidators(this.form, transaction.type, transaction.paymentMethod ?? '');
    this.suppressTypeReset = false;

    if (transaction.source === 'Bank Sync') {
      lockBankControlledFields(this.form);
    }

    this.form.markAsPristine();
    this.form.markAsUntouched();
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
      this.form.reset({ type: keepType, date: getToday(), amount: null, paymentMethod: '', tags: [] });
      applyTypeValidators(this.form, keepType, '');
      this.form.markAsPristine();
      return;
    }

    this.saved = true;
    this.router.navigate(['/transactions']);
  }
}
