import { Component, OnInit, inject, input, output, InputSignal, OutputEmitterRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RecurringIncome } from '../../models/recurring-income.model';
import { IncomeSource } from '../../models/income-source.model';
import { AccountRef } from '../../models/account-ref.model';
import { getSourceTypeColor } from '../../utility/income.helpers';

@Component({
  selector: 'app-recurring-income-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recurring-income-modal.component.html',
  styleUrl: './recurring-income-modal.component.scss'
})
export class RecurringIncomeModalComponent implements OnInit {
  readonly item: InputSignal<RecurringIncome | null> = input<RecurringIncome | null>(null);
  readonly sources: InputSignal<IncomeSource[]> = input<IncomeSource[]>([]);
  readonly accounts: InputSignal<AccountRef[]> = input<AccountRef[]>([]);
  readonly close: OutputEmitterRef<void> = output<void>();
  readonly save: OutputEmitterRef<Partial<RecurringIncome>> = output<Partial<RecurringIncome>>();
  readonly update: OutputEmitterRef<{ id: string; item: Partial<RecurringIncome> }> = output<{
    id: string;
    item: Partial<RecurringIncome>;
  }>();

  private readonly fb: FormBuilder = inject(FormBuilder);
  recurringForm!: FormGroup;

  ngOnInit(): void {
    const existing = this.item();
    const today = new Date().toISOString().split('T')[0];
    const defaultSrc = this.sources()[0]?.id || 'src-1';
    const defaultAcc = this.accounts()[0]?.id || 'acc-1';

    if (existing) {
      this.recurringForm = this.fb.group({
        incomeSourceId: [existing.incomeSourceId, Validators.required],
        accountId: [existing.accountId, Validators.required],
        expectedAmount: [existing.expectedAmount, [Validators.required, Validators.min(0.01)]],
        frequency: [existing.frequency || 'MONTHLY', Validators.required],
        startDate: [existing.startDate || today, Validators.required],
        nextIncomeDate: [existing.nextIncomeDate || today, Validators.required],
        notes: [existing.notes || '']
      });
    } else {
      this.recurringForm = this.fb.group({
        incomeSourceId: [defaultSrc, Validators.required],
        accountId: [defaultAcc, Validators.required],
        expectedAmount: [null, [Validators.required, Validators.min(0.01)]],
        frequency: ['MONTHLY', Validators.required],
        startDate: [today, Validators.required],
        nextIncomeDate: [today, Validators.required],
        notes: ['']
      });
    }
  }

  onSubmit(): void {
    if (this.recurringForm.invalid) {
      this.recurringForm.markAllAsTouched();
      return;
    }

    const val = this.recurringForm.value;
    const matchedSource = this.sources().find((s) => s.id === val.incomeSourceId);
    const matchedAccount = this.accounts().find((a) => a.id === val.accountId);

    const payload: Partial<RecurringIncome> = {
      incomeSourceId: val.incomeSourceId,
      sourceName: matchedSource ? matchedSource.name : 'Unknown Source',
      sourceType: matchedSource ? matchedSource.type : 'Salary',
      sourceColor: matchedSource?.color || getSourceTypeColor(matchedSource?.type),
      accountId: val.accountId,
      accountName: matchedAccount ? `${matchedAccount.name} ••••${matchedAccount.accountNumberLast4}` : 'Main Account',
      expectedAmount: Number(val.expectedAmount),
      frequency: val.frequency,
      startDate: val.startDate,
      nextIncomeDate: val.nextIncomeDate,
      notes: val.notes,
      status: 'ACTIVE'
    };

    const existing = this.item();
    if (existing) {
      this.update.emit({ id: existing.id, item: payload });
    } else {
      this.save.emit(payload);
    }
    this.close.emit();
  }

  onClose(): void {
    this.close.emit();
  }
}
