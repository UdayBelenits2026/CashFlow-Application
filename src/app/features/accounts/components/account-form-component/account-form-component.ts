import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';

import { AccountFacade } from '../../facades/account.facade';
import { Account } from '../../models/accounts.model';
import { ACCOUNT_FORM_MESSAGES, ACCOUNT_FORM_OPTIONS, ACCOUNT_FORM_STEPS, AccountFormMode } from '../../utility/account-form.config';
import { AccountFormValue, applyConditionalValidators, buildDuplicateAccountKey, buildDuplicateAccountKeyFromAccount, buildPayload, buildSubmissionMessage, createAccountFormGroup, createInitialAccountFormValue, getAccountFormFlags, getCombinedSubmissionFields, getEditLoadError, getFieldErrorMessage, getStepFields, mapAccountToFormValue, markAndValidate, tryFindEditAccount } from '../../utility/account-form.mapper';

@Component({
  selector: 'app-account-form-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account-form-component.html',
  styleUrl: './account-form-component.scss'
})
export class AccountFormComponent implements OnInit {
  readonly accountTypes = ACCOUNT_FORM_OPTIONS.accountTypes; readonly banks = ACCOUNT_FORM_OPTIONS.banks; readonly currencies = ACCOUNT_FORM_OPTIONS.currencies;
  readonly accountStatuses = ACCOUNT_FORM_OPTIONS.accountStatuses; readonly accountCategories = ACCOUNT_FORM_OPTIONS.accountCategories; readonly loanTypes = ACCOUNT_FORM_OPTIONS.loanTypes; readonly stepLabels = ACCOUNT_FORM_STEPS;
  mode: AccountFormMode = 'add'; currentStep = 1; accountId: string | null = null; accountLoading = false; storeLoading = false; isSubmitting = false; showValidationErrors = false;
  requiredDetailsError: string | null = null; loadError: string | null = null; submissionMessage: { type: 'success' | 'error'; text: string } | null = null;
  private readonly route = inject(ActivatedRoute); private readonly router = inject(Router); private readonly accountFacade = inject(AccountFacade); private readonly destroyRef = inject(DestroyRef);
  private accounts: Account[] = []; private selectedAccount: Account | null = null; private pendingSubmissionMode: AccountFormMode | null = null; private loadCycleStarted = false;
  readonly form = createAccountFormGroup(inject(FormBuilder), this.today());

  ngOnInit(): void {
    this.mode = (this.route.snapshot.routeConfig?.path ?? '').includes('edit') ? 'edit' : 'add';
    this.accountId = this.route.snapshot.paramMap.get('id'); this.accountLoading = this.isEditMode; this.applyValidators();
    this.control('accountType').valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.applyValidators());
    this.control('currency').valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.applyValidators());
    this.accountFacade.loadAccounts();
    combineLatest([this.accountFacade.accounts$, this.accountFacade.loading$, this.accountFacade.error$]).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(([accounts, loading, error]) => {
      this.accounts = accounts; this.storeLoading = loading; this.loadCycleStarted = this.loadCycleStarted || loading; this.syncEditAccount();
      if (this.pendingSubmissionMode && !loading) this.finishSubmission(error);
    });
  }

  get isAddMode(): boolean { return this.mode === 'add'; }
  get isEditMode(): boolean { return this.mode === 'edit'; }
  get selectedAccountType(): string { return String(this.control('accountType').value ?? ''); }
  get isLoanType(): boolean { return getAccountFormFlags(this.selectedAccountType).isLoanType; }
  get isCreditCardType(): boolean { return getAccountFormFlags(this.selectedAccountType).isCreditCardType; }
  get showBankFields(): boolean { return getAccountFormFlags(this.selectedAccountType).showBankFields; }
  get showInstitutionName(): boolean { return getAccountFormFlags(this.selectedAccountType).showInstitutionName; }

  control(name: string): AbstractControl { const field = this.form.get(name); if (!field) throw new Error(`Form control "${name}" was not found.`); return field; }
  isInvalid(name: string): boolean { const field = this.control(name); return field.invalid && (field.touched || field.dirty || this.showValidationErrors); }
  fieldError(name: string): string { return getFieldErrorMessage(name, this.control(name).errors); }

  nextStep(): void {
    const fields = getStepFields(this.currentStep, getAccountFormFlags(this.selectedAccountType), String(this.control('currency').value ?? ''));
    if (!this.validateFields(fields)) return; this.currentStep = Math.min(3, this.currentStep + 1);
  }

  previousStep(): void { this.requiredDetailsError = null; this.showValidationErrors = false; this.currentStep = Math.max(1, this.currentStep - 1); }
  goToStep(step: number): void {
    if (!this.isAddMode) return;
    const nextAllowed = step === this.currentStep + 1 && this.validateFields(getStepFields(this.currentStep, getAccountFormFlags(this.selectedAccountType), String(this.control('currency').value ?? '')));
    if (step < this.currentStep || nextAllowed) { this.currentStep = step; this.requiredDetailsError = null; this.showValidationErrors = false; }
  }

  submit(): void {
    if (this.isSubmitting || this.storeLoading || this.accountLoading) return;
    const flags = getAccountFormFlags(this.selectedAccountType); const currency = String(this.control('currency').value ?? '');
    const fields = this.isEditMode ? getCombinedSubmissionFields(flags, currency) : getStepFields(1, flags, currency).concat(getStepFields(2, flags, currency));
    if (!this.validateFields(fields)) { if (this.isAddMode) this.currentStep = getStepFields(1, flags, currency).every(field => this.control(field).valid) ? 2 : 1; return; }
    if (this.duplicateExists()) { this.submissionMessage = { type: 'error', text: ACCOUNT_FORM_MESSAGES.duplicate }; return; }
    this.isSubmitting = true; this.pendingSubmissionMode = this.mode; this.submissionMessage = null; this.requiredDetailsError = null; this.showValidationErrors = false;
    const payload = buildPayload({ value: this.form.getRawValue() as AccountFormValue, mode: this.mode, accountId: this.accountId, selectedAccount: this.selectedAccount, today: this.today() });
    this.mode === 'add' ? this.accountFacade.createAccount(payload) : this.accountFacade.updateAccount(payload);
  }

  cancel(): void { this.router.navigate(this.isEditMode && this.accountId ? ['/accounts', this.accountId] : ['/accounts']); }

  private applyValidators(): void { applyConditionalValidators(this.form, this.selectedAccountType, String(this.control('currency').value ?? '')); }
  private validateFields(fields: string[]): boolean {
    this.showValidationErrors = true; const valid = markAndValidate(this.form, fields); this.requiredDetailsError = valid ? null : ACCOUNT_FORM_MESSAGES.requiredDetails;
    if (valid) this.showValidationErrors = false; return valid;
  }

  private syncEditAccount(): void {
    if (!this.isEditMode) return;
    const account = tryFindEditAccount(this.accounts, this.accountId);
    if (account) {
      this.loadError = null; this.accountLoading = false;
      if (this.selectedAccount?.id !== account.id) { this.selectedAccount = account; this.form.reset(mapAccountToFormValue(account, this.today())); this.applyValidators(); this.form.markAsPristine(); this.form.markAsUntouched(); }
      return;
    }
    if (!this.accountId || (!this.storeLoading && (this.loadCycleStarted || this.accounts.length > 0))) { this.accountLoading = false; this.loadError = getEditLoadError(); }
  }

  private duplicateExists(): boolean {
    const currentKey = buildDuplicateAccountKey(String(this.control('accountType').value ?? ''), String(this.control('accountNumber').value ?? ''), String(this.control('bankName').value ?? ''));
    return this.accounts.some(account => !(this.isEditMode && this.accountId && account.id === this.accountId) && buildDuplicateAccountKeyFromAccount(account) === currentKey);
  }

  private finishSubmission(error: string | null): void {
    const mode = this.pendingSubmissionMode; if (!mode) return;
    this.pendingSubmissionMode = null; this.isSubmitting = false; this.submissionMessage = { type: error ? 'error' : 'success', text: buildSubmissionMessage(mode, error) };
    if (mode === 'add' && !error) { this.currentStep = 1; this.form.reset(createInitialAccountFormValue(this.today())); this.applyValidators(); this.form.markAsPristine(); this.form.markAsUntouched(); }
  }

  private today(): string { return new Date().toISOString().slice(0, 10); }
}
