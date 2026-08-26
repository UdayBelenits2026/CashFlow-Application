import { ChangeDetectionStrategy, Component, OnInit, inject, input, output, InputSignal, OutputEmitterRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IncomeSource } from '../../models/income-source.model';
import { AccountRef } from '../../models/account-ref.model';
import { INCOME_TYPE_OPTIONS } from '../../utility/income.constants';
import { getSourceTypeColor, formatAccountLabel } from '../../utility/income.helpers';

@Component({
  selector: 'app-income-source-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './income-source-modal.component.html',
  styleUrl: './income-source-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncomeSourceModalComponent implements OnInit {
  readonly source: InputSignal<IncomeSource | null> = input<IncomeSource | null>(null);
  readonly accounts: InputSignal<AccountRef[]> = input<AccountRef[]>([]);
  readonly close: OutputEmitterRef<void> = output<void>();
  readonly save: OutputEmitterRef<Partial<IncomeSource>> = output<Partial<IncomeSource>>();
  readonly update: OutputEmitterRef<{ id: string; source: Partial<IncomeSource> }> = output<{
    id: string;
    source: Partial<IncomeSource>;
  }>();

  private readonly fb: FormBuilder = inject(FormBuilder);
  sourceForm!: FormGroup;
  readonly typeOptions = INCOME_TYPE_OPTIONS;

  ngOnInit(): void {
    const src = this.source();
    if (src) {
      this.sourceForm = this.fb.group({
        name: [src.name, [Validators.required, Validators.minLength(2)]],
        type: [src.type || 'Salary', Validators.required],
        description: [src.description || ''],
        expectedAmount: [src.expectedAmount || null],
        frequency: [src.frequency || 'MONTHLY'],
        taxable: [src.taxable ?? true],
        isRecurring: [src.isRecurring ?? false],
        accountId: [src.accountId || 'acc-1']
      });
    } else {
      this.sourceForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        type: ['Salary', Validators.required],
        description: [''],
        expectedAmount: [null],
        frequency: ['MONTHLY'],
        taxable: [true],
        isRecurring: [true],
        accountId: ['acc-1']
      });
    }
  }

  onSubmit(): void {
    if (this.sourceForm.invalid) {
      this.sourceForm.markAllAsTouched();
      return;
    }

    const formVal = this.sourceForm.value;
    const selectedAcc = this.accounts().find((a) => a.id === formVal.accountId);
    const accountName = formatAccountLabel(selectedAcc);

    const payload: Partial<IncomeSource> = {
      name: formVal.name,
      type: formVal.type,
      description: formVal.description,
      expectedAmount: formVal.expectedAmount ? Number(formVal.expectedAmount) : undefined,
      frequency: formVal.frequency,
      taxable: formVal.taxable,
      isRecurring: formVal.isRecurring,
      accountId: formVal.accountId,
      accountName,
      color: getSourceTypeColor(formVal.type),
      status: 'ACTIVE'
    };

    const currentSrc = this.source();
    if (currentSrc) {
      this.update.emit({ id: currentSrc.id, source: payload });
    } else {
      this.save.emit(payload);
    }
    this.close.emit();
  }

  onClose(): void {
    this.close.emit();
  }
}
