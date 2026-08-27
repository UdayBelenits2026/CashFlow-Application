import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  inject,
  input,
  output,
  signal,
  computed,
  InputSignal,
  OutputEmitterRef,
  WritableSignal,
  Signal
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Income } from '../../models/income.model';
import { IncomeSource, IncomeSourceType } from '../../models/income-source.model';
import { AccountRef } from '../../models/account-ref.model';
import { INCOME_TYPE_OPTIONS, PAYMENT_METHOD_OPTIONS } from '../../utility/income.constants';
import { getSourceTypeColor, formatAccountLabel } from '../../utility/income.helpers';

const MAX_INCOME_AMOUNT = 10_000_000;

/** Validates amount: numeric, not negative, not zero, max 2 decimals, within limit. */
function amountValidator(control: AbstractControl): ValidationErrors | null {
  const raw = control.value;
  if (raw === null || raw === undefined || raw === '') return null;
  const num = Number(raw);
  if (Number.isNaN(num)) return { invalidNumber: true };
  if (num < 0) return { negative: true };
  if (num === 0) return { zero: true };
  if (!/^\d+(\.\d{1,2})?$/.test(String(raw))) return { decimals: true };
  if (num > MAX_INCOME_AMOUNT) return { max: true };
  return null;
}

@Component({
  selector: 'app-add-income-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DecimalPipe],
  templateUrl: './add-income-modal.component.html',
  styleUrl: './add-income-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddIncomeModalComponent implements OnInit {
  readonly income: InputSignal<Income | null> = input<Income | null>(null);
  readonly sources: InputSignal<IncomeSource[]> = input<IncomeSource[]>([]);
  readonly accounts: InputSignal<AccountRef[]> = input<AccountRef[]>([]);
  readonly close: OutputEmitterRef<void> = output<void>();
  readonly save: OutputEmitterRef<Partial<Income>> = output<Partial<Income>>();
  readonly update: OutputEmitterRef<{ id: string; income: Partial<Income> }> = output<{
    id: string;
    income: Partial<Income>;
  }>();

  private readonly fb: FormBuilder = inject(FormBuilder);
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);

  readonly currentStep: WritableSignal<number> = signal<number>(1);
  readonly selectedSourceId: WritableSignal<string> = signal<string>('');
  readonly selectedSourceName: WritableSignal<string> = signal<string>('');
  readonly selectedSourceType: WritableSignal<IncomeSourceType> = signal<IncomeSourceType>('Salary');
  readonly selectedSourceColor: WritableSignal<string> = signal<string>(getSourceTypeColor('Salary'));
  readonly isCreatingNewSource: WritableSignal<boolean> = signal<boolean>(false);
  readonly isSaving: WritableSignal<boolean> = signal<boolean>(false);

  incomeForm!: FormGroup;
  newSourceForm!: FormGroup;

  readonly isEditMode: Signal<boolean> = computed(() => !!this.income());

  /** True when the user has no accounts to receive income into. */
  readonly noAccounts: Signal<boolean> = computed(() => (this.accounts()?.length ?? 0) === 0);

  readonly availableSources: Signal<IncomeSource[]> = computed(() =>
    this.sources().filter((s) => s.status === 'ACTIVE')
  );

  readonly availableAccounts: Signal<AccountRef[]> = computed(() => this.accounts());

  readonly typeOptions = INCOME_TYPE_OPTIONS;
  readonly paymentMethodOptions = PAYMENT_METHOD_OPTIONS;

  ngOnInit(): void {
    const inc = this.income();
    if (inc) {
      this.selectedSourceId.set(inc.incomeSourceId || '');
      this.selectedSourceName.set(inc.sourceName || '');
      this.selectedSourceType.set(inc.sourceType || 'Salary');
      this.selectedSourceColor.set(inc.sourceColor || getSourceTypeColor(inc.sourceType));

      this.incomeForm = this.fb.group({
        accountId: [inc.accountId || '', Validators.required],
        amount: [inc.amount, [Validators.required, amountValidator]],
        date: [inc.date, Validators.required],
        paymentMethod: [inc.paymentMethod || 'BANK_TRANSFER', Validators.required],
        description: [inc.description, [Validators.required, Validators.maxLength(100)]],
        notes: [inc.notes || '', Validators.maxLength(500)],
        taxable: [inc.taxable ?? true],
        isRecurring: [inc.isRecurring ?? false]
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      const firstSource = this.availableSources()[0];
      if (firstSource) {
        this.selectedSourceId.set(firstSource.id);
        this.selectedSourceName.set(firstSource.name);
        this.selectedSourceType.set(firstSource.type);
        this.selectedSourceColor.set(firstSource.color || getSourceTypeColor(firstSource.type));
      }
      const defaultAcc = this.availableAccounts()[0]?.id || '';
      this.incomeForm = this.fb.group({
        accountId: [defaultAcc, Validators.required],
        amount: [null, [Validators.required, amountValidator]],
        date: [today, Validators.required],
        paymentMethod: ['BANK_TRANSFER', Validators.required],
        description: ['', [Validators.required, Validators.maxLength(100)]],
        notes: ['', Validators.maxLength(500)],
        taxable: [true],
        isRecurring: [false]
      });
    }

    this.newSourceForm = this.fb.group({
      newSourceName: ['', [Validators.required, Validators.minLength(2)]],
      newSourceType: ['Salary', Validators.required],
      newSourceDescription: [''],
      newSourceTaxable: [true],
      newSourceRecurring: [false],
      newSourceFrequency: ['MONTHLY'],
      newSourceExpectedAmount: [null],
      newSourceNextDate: ['']
    });
  }

  /** Duplicate source-name check (case-insensitive) against existing sources. */
  isDuplicateSourceName(): boolean {
    const name = String(this.newSourceForm?.get('newSourceName')?.value || '').trim().toLowerCase();
    if (!name) return false;
    return this.availableSources().some((s) => s.name.trim().toLowerCase() === name);
  }

  onSelectSource(src: IncomeSource): void {
    this.selectedSourceId.set(src.id);
    this.selectedSourceName.set(src.name);
    this.selectedSourceType.set(src.type);
    this.selectedSourceColor.set(src.color || getSourceTypeColor(src.type));
    this.isCreatingNewSource.set(false);
  }

  toggleCreateNewSource(): void {
    this.isCreatingNewSource.update((v) => !v);
  }

  goToNextStep(): void {
    switch (this.currentStep()) {
      case 1: {
        if (this.noAccounts()) return;
        if (this.incomeForm.invalid) {
          this.incomeForm.markAllAsTouched();
          this.focusFirstInvalid();
          return;
        }
        this.currentStep.set(2);
        break;
      }
      case 2: {
        if (this.isCreatingNewSource()) {
          const recurring = this.newSourceForm.get('newSourceRecurring')?.value;
          this.applyRecurringValidators(recurring);
          if (this.newSourceForm.invalid || this.isDuplicateSourceName()) {
            this.newSourceForm.markAllAsTouched();
            this.focusFirstInvalid();
            return;
          }
          const name = this.newSourceForm.get('newSourceName')?.value;
          const type = this.newSourceForm.get('newSourceType')?.value;
          this.selectedSourceId.set(`src-custom-${Date.now()}`);
          this.selectedSourceName.set(name);
          this.selectedSourceType.set(type);
          this.selectedSourceColor.set(getSourceTypeColor(type));
        }
        this.currentStep.set(3);
        break;
      }
    }
  }

  /** Toggle conditional required rules for recurring source fields. */
  private applyRecurringValidators(isRecurring: boolean): void {
    const freq = this.newSourceForm.get('newSourceFrequency');
    const amount = this.newSourceForm.get('newSourceExpectedAmount');
    const nextDate = this.newSourceForm.get('newSourceNextDate');
    if (isRecurring) {
      freq?.setValidators([Validators.required]);
      amount?.setValidators([Validators.required, amountValidator]);
      nextDate?.setValidators([Validators.required]);
    } else {
      freq?.clearValidators();
      amount?.clearValidators();
      nextDate?.clearValidators();
    }
    freq?.updateValueAndValidity();
    amount?.updateValueAndValidity();
    nextDate?.updateValueAndValidity();
  }

  goToPreviousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update((s) => s - 1);
    }
  }

  onSubmit(): void {
    if (this.isSaving()) return;
    if (this.incomeForm.invalid) {
      this.incomeForm.markAllAsTouched();
      this.currentStep.set(1);
      this.focusFirstInvalid();
      return;
    }

    this.isSaving.set(true);
    const formValues = this.incomeForm.value;
    const selectedAcc = this.availableAccounts().find((a) => a.id === formValues.accountId);
    const accountName = formatAccountLabel(selectedAcc);

    const payload: Partial<Income> = {
      accountId: formValues.accountId,
      accountName,
      incomeSourceId: this.selectedSourceId(),
      sourceName: this.selectedSourceName(),
      sourceType: this.selectedSourceType(),
      sourceColor: this.selectedSourceColor(),
      amount: Number(formValues.amount),
      date: formValues.date,
      paymentMethod: formValues.paymentMethod,
      description: formValues.description,
      notes: formValues.notes,
      taxable: formValues.taxable,
      isRecurring: formValues.isRecurring
    };

    const exp = this.income();
    if (exp) {
      this.update.emit({ id: exp.id, income: payload });
    } else {
      this.save.emit(payload);
    }
    this.close.emit();
  }

  /** Move focus and scroll to the first invalid control in the current step. */
  private focusFirstInvalid(): void {
    setTimeout(() => {
      const el = this.host.nativeElement.querySelector<HTMLElement>('.ng-invalid[formControlName]');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }

  getSelectedAccountName(): string {
    const accId = this.incomeForm?.get('accountId')?.value;
    return formatAccountLabel(this.availableAccounts().find((a) => a.id === accId));
  }
}
