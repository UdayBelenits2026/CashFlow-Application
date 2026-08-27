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
        name: [src.name, [Validators.required, Validators.minLength(3)]],
        type: [src.type || 'Salary', Validators.required],
        description: [src.description || ''],
        taxable: [src.taxable ?? true],
        isRecurring: [src.isRecurring ?? false],
        frequency: [src.frequency || 'MONTHLY'],
        expectedAmount: [src.expectedAmount || null],
        accountId: [src.accountId || 'acc-1']
      });
    } else {
      this.sourceForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        type: ['Salary', Validators.required],
        description: [''],
        taxable: [true],
        isRecurring: [false],
        frequency: ['MONTHLY'],
        expectedAmount: [null],
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

    const payload: Partial<IncomeSource> = {
      name: formVal.name,
      type: formVal.type,
      description: formVal.description,
      taxable: formVal.taxable,
      isRecurring: formVal.isRecurring,
      color: getSourceTypeColor(formVal.type),
      status: 'ACTIVE'
    };

    // Only attach schedule/amount details when the source is marked recurring.
    if (formVal.isRecurring) {
      const selectedAcc = this.accounts().find((a) => a.id === formVal.accountId);
      payload.frequency = formVal.frequency;
      payload.expectedAmount = formVal.expectedAmount ? Number(formVal.expectedAmount) : undefined;
      payload.accountId = formVal.accountId;
      payload.accountName = formatAccountLabel(selectedAcc);
    }

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
