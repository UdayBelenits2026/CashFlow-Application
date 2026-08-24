import {
  Component,
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
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Income } from '../../models/income.model';
import { IncomeSource } from '../../models/income-source.model';
import { AccountRef } from '../../models/account-ref.model';
import { DEFAULT_INCOME_SOURCES, INCOME_TYPE_OPTIONS } from '../../utility/income.constants';
import { getSourceTypeColor } from '../../utility/income.helpers';

@Component({
  selector: 'app-add-income-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DecimalPipe],
  templateUrl: './add-income-modal.component.html',
  styleUrl: './add-income-modal.component.scss'
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

  readonly currentStep: WritableSignal<number> = signal<number>(1);
  readonly selectedSourceId: WritableSignal<string> = signal<string>('src-1');
  readonly selectedSourceName: WritableSignal<string> = signal<string>('Tech Corp Salary');
  readonly selectedSourceType: WritableSignal<any> = signal<any>('Salary');
  readonly selectedSourceColor: WritableSignal<string> = signal<string>('#10B981');
  readonly isCreatingNewSource: WritableSignal<boolean> = signal<boolean>(false);

  incomeForm!: FormGroup;
  newSourceForm!: FormGroup;

  readonly isEditMode: Signal<boolean> = computed(() => !!this.income());
  readonly availableSources: Signal<IncomeSource[]> = computed(() => {
    const srcList = this.sources();
    return srcList && srcList.length > 0
      ? srcList.filter((s) => s.status === 'ACTIVE')
      : DEFAULT_INCOME_SOURCES;
  });

  readonly availableAccounts: Signal<AccountRef[]> = computed(() => {
    const accList = this.accounts();
    if (accList && accList.length > 0) return accList;
    return [
      { id: 'acc-1', name: 'Chase Checking', type: 'CHECKING', accountNumberLast4: '1234', balance: 14250, isActive: true },
      { id: 'acc-2', name: 'BoA Savings', type: 'SAVINGS', accountNumberLast4: '5678', balance: 32800, isActive: true },
      { id: 'acc-3', name: 'Fidelity Investment', type: 'INVESTMENT', accountNumberLast4: '9012', balance: 58940, isActive: true }
    ];
  });

  readonly typeOptions = INCOME_TYPE_OPTIONS;

  ngOnInit(): void {
    const inc = this.income();
    if (inc) {
      this.selectedSourceId.set(inc.incomeSourceId || 'src-1');
      this.selectedSourceName.set(inc.sourceName || 'Tech Corp Salary');
      this.selectedSourceType.set(inc.sourceType || 'Salary');
      this.selectedSourceColor.set(inc.sourceColor || '#10B981');

      this.incomeForm = this.fb.group({
        accountId: [inc.accountId || 'acc-1', Validators.required],
        amount: [inc.amount, [Validators.required, Validators.min(0.01)]],
        date: [inc.date, Validators.required],
        description: [inc.description, Validators.required],
        notes: [inc.notes || ''],
        taxable: [inc.taxable ?? true],
        isRecurring: [inc.isRecurring ?? false]
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      const defaultAcc = this.availableAccounts()[0]?.id || 'acc-1';
      this.incomeForm = this.fb.group({
        accountId: [defaultAcc, Validators.required],
        amount: [null, [Validators.required, Validators.min(0.01)]],
        date: [today, Validators.required],
        description: ['', Validators.required],
        notes: [''],
        taxable: [true],
        isRecurring: [false]
      });
    }

    this.newSourceForm = this.fb.group({
      newSourceName: ['', Validators.required],
      newSourceType: ['Salary', Validators.required],
      newSourceDescription: [''],
      newSourceTaxable: [true]
    });
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
    if (this.currentStep() === 1) {
      if (this.incomeForm.invalid) {
        this.incomeForm.markAllAsTouched();
        return;
      }
      this.currentStep.set(2);
    } else if (this.currentStep() === 2) {
      if (this.isCreatingNewSource()) {
        if (this.newSourceForm.invalid) {
          this.newSourceForm.markAllAsTouched();
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
    }
  }

  goToPreviousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update((s) => s - 1);
    }
  }

  onSubmit(): void {
    if (this.incomeForm.invalid) {
      this.incomeForm.markAllAsTouched();
      return;
    }

    const formValues = this.incomeForm.value;
    const selectedAcc = this.availableAccounts().find((a) => a.id === formValues.accountId);
    const accountName = selectedAcc ? `${selectedAcc.name} ••••${selectedAcc.accountNumberLast4}` : 'Main Account';

    const payload: Partial<Income> = {
      accountId: formValues.accountId,
      accountName,
      incomeSourceId: this.selectedSourceId(),
      sourceName: this.selectedSourceName(),
      sourceType: this.selectedSourceType(),
      sourceColor: this.selectedSourceColor(),
      amount: Number(formValues.amount),
      date: formValues.date,
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

  onClose(): void {
    this.close.emit();
  }

  getSelectedAccountName(): string {
    const accId = this.incomeForm?.get('accountId')?.value;
    const acc = this.availableAccounts().find((a) => a.id === accId);
    return acc ? `${acc.name} (••••${acc.accountNumberLast4})` : 'Main Account';
  }
}
