import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { DatePickerComponent } from '../../../../shared/ui/date-picker/date-picker';
import { UserContextService } from '../../../../core/services/user-context.service';
import { LookupService } from '../../data/lookup.service';
import { TransactionsFacade } from '../../facades/transactions.facade';
import { TransactionType } from '../../models/models.transaction';
import { EditTransactionData, LookupItem } from '../../models/transaction-api.model';
import {
  PAYMENT_METHODS,
  applyReadOnlyFields,
  applyTypeValidators,
  buildCreateRequest,
  buildUpdateRequest,
  createTransactionForm,
  editDataToFormPatch,
  getToday,
  lockEditOnlyFields,
  resetFormForNew,
  toggleTagId
} from '../../utility/transaction-form-utils';
import { UnsavedChangesAware } from './unsaved-changes.guard';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePickerComponent, RouterLink],
  templateUrl: './transaction-form.html',
  styleUrl: './transaction-form.scss'
})
export class TransactionForm implements OnInit, UnsavedChangesAware {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly facade = inject(TransactionsFacade);
  private readonly lookup = inject(LookupService);
  private readonly userContext = inject(UserContextService);
  private readonly destroyRef = inject(DestroyRef);
  readonly paymentMethods = PAYMENT_METHODS;
  readonly form: FormGroup = createTransactionForm(this.fb, getToday());
  accounts: LookupItem[] = [];
  categories: LookupItem[] = [];
  merchants: LookupItem[] = [];
  incomeSources: LookupItem[] = [];
  tagOptions: LookupItem[] = [];
  mode: 'add' | 'edit' = 'add';
  transactionId: number | null = null;
  loadingTransaction = false;
  loadError: string | null = null;
  saving = false;
  submissionError: string | null = null;
  successMessage: string | null = null;
  editMerchantName = '';
  showLeaveModal = false;
  private leaveResolver: ((leave: boolean) => void) | null = null;
  private pendingSubmit = false;
  private pendingSaveNew = false;
  private saved = false;
  private idempotencyKey: string | null = null;

  ngOnInit(): void {
    this.facade.clearFeedback();
    const idParam = this.route.snapshot.paramMap.get('id');
    this.transactionId = idParam ? Number(idParam) : null;
    this.mode = this.transactionId != null ? 'edit' : 'add';
    this.loadLookups();
    applyTypeValidators(this.form, this.mode, 'Expense', '');
    this.watch(this.form.get('type')!.valueChanges, (type: TransactionType) => this.onTypeChange(type));
    this.watch(this.form.get('paymentMethod')!.valueChanges, (method: string) =>
      applyTypeValidators(this.form, this.mode, this.form.get('type')!.value, method ?? '')
    );
    if (this.mode === 'edit' && this.transactionId != null) {
      this.loadForEdit(this.transactionId);
    }
    this.watch(this.facade.saving$, (saving) => (this.saving = saving));
    this.watch(this.facade.error$, (error) => this.onFeedback(error, null));
    this.watch(this.facade.successMessage$, (message) => this.onFeedback(null, message));
  }

  selectedType(): TransactionType {
    return this.form.get('type')!.value;
  }
  control(name: string) {
    return this.form.get(name)!;
  }
  isInvalid(name: string): boolean {
    const c = this.form.get(name)!;
    return c.invalid && (c.touched || c.dirty);
  }
  isReadOnly(name: string): boolean {
    return this.form.get(name)?.disabled ?? false;
  }
  selectedTagIds(): number[] {
    return this.form.get('tagIds')!.value ?? [];
  }
  isTagSelected(id: number): boolean {
    return this.selectedTagIds().includes(id);
  }
  toggleTag(id: number): void {
    this.form.get('tagIds')!.setValue(toggleTagId(this.selectedTagIds(), id));
    this.form.markAsDirty();
  }
  onSubmit(saveNew = false): void {
    if (this.saving) return;
    if (this.mode === 'add' && this.selectedType() === 'Transfer') {
      this.submissionError = 'Transfers are not supported by the backend yet.';
      return;
    }
    if (this.form.invalid) return this.form.markAllAsTouched();
    this.submissionError = this.successMessage = null;
    this.pendingSubmit = true;
    this.pendingSaveNew = saveNew;
    const value = this.form.getRawValue();
    if (this.mode === 'add') {
      this.idempotencyKey ??= crypto.randomUUID();
      this.facade.createTransaction(buildCreateRequest(value), this.idempotencyKey);
    } else if (this.transactionId != null) {
      this.facade.updateTransaction(this.transactionId, buildUpdateRequest(value, this.userContext.getUserId()));
    }
  }
  canLeave(): boolean {
    return this.saved || !this.form.dirty;
  }
  confirmLeave(): Promise<boolean> {
    this.showLeaveModal = true;
    return new Promise<boolean>((resolve) => (this.leaveResolver = resolve));
  }
  stayOnPage(): void {
    this.resolveLeave(false);
  }
  leaveWithoutSaving(): void {
    this.resolveLeave(true);
  }
  private resolveLeave(leave: boolean): void {
    this.showLeaveModal = false;
    this.leaveResolver?.(leave);
    this.leaveResolver = null;
  }
  private onFeedback(error: string | null, message: string | null): void {
    if (!this.pendingSubmit) return;
    if (error) {
      this.submissionError = error;
      this.pendingSubmit = this.pendingSaveNew = false;
    } else if (message) {
      this.onSaveSuccess(message);
    }
  }
  private onTypeChange(type: TransactionType): void {
    applyTypeValidators(this.form, this.mode, type, this.form.get('paymentMethod')!.value ?? '');
    if (this.mode === 'add') {
      this.form.patchValue({ categoryId: null, merchantId: null, incomeSourceId: null, paymentMethod: '' }, { emitEvent: false });
    }
  }
  private loadLookups(): void {
    this.watch(this.lookup.getAccounts(), (items) => (this.accounts = items), []);
    this.watch(this.lookup.getCategories(), (items) => (this.categories = items), []);
    this.watch(this.lookup.getMerchants(), (items) => (this.merchants = items), []);
    this.watch(this.lookup.getIncomeSources(), (items) => (this.incomeSources = items), []);
    this.watch(this.lookup.getTags(), (items) => (this.tagOptions = items), []);
  }
  private loadForEdit(id: number): void {
    this.loadingTransaction = true;
    this.facade.loadForEdit(id);
    this.watch(this.facade.editLoading$, (loading) => (this.loadingTransaction = loading));
    this.watch(this.facade.editError$, (error) => (this.loadError = error));
    this.watch(this.facade.editData$, (data) => data && this.populateForm(data));
  }
  private populateForm(data: EditTransactionData): void {
    this.editMerchantName = data.merchantName ?? '';
    this.form.patchValue(editDataToFormPatch(data));
    applyTypeValidators(this.form, 'edit', data.incomeSourceId != null ? 'Income' : 'Expense', data.paymentMethod ?? '');
    lockEditOnlyFields(this.form);
    applyReadOnlyFields(this.form, data.readOnlyFieldNames, data.accountEditable);
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }
  private onSaveSuccess(message: string): void {
    this.pendingSubmit = false;
    this.idempotencyKey = null;
    if (this.pendingSaveNew) {
      this.pendingSaveNew = false;
      this.successMessage = message;
      resetFormForNew(this.form, this.form.get('type')!.value);
      return;
    }
    this.saved = true;
    this.router.navigate(['/transactions']);
  }
  private watch<T>(source: Observable<T>, next: (value: T) => void, fallback?: T): void {
    source.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next,
      error: () => fallback !== undefined && next(fallback)
    });
  }
}
