import { ChangeDetectionStrategy, Component, input, output, InputSignal, OutputEmitterRef } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { IncomeSource } from '../../models/income-source.model';
import { Income } from '../../models/income.model';

@Component({
  selector: 'app-income-source-details-drawer',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe],
  templateUrl: './income-source-details-drawer.component.html',
  styleUrl: './income-source-details-drawer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncomeSourceDetailsDrawerComponent {
  readonly source: InputSignal<IncomeSource | null> = input<IncomeSource | null>(null);
  readonly sourceIncomes: InputSignal<Income[]> = input<Income[]>([]);
  readonly close: OutputEmitterRef<void> = output<void>();
  readonly editSource: OutputEmitterRef<IncomeSource> = output<IncomeSource>();
  readonly toggleStatus: OutputEmitterRef<{ id: string; status: 'ACTIVE' | 'INACTIVE' }> = output<{
    id: string;
    status: 'ACTIVE' | 'INACTIVE';
  }>();
  readonly recordIncomeNow: OutputEmitterRef<IncomeSource> = output<IncomeSource>();

  onClose(): void {
    this.close.emit();
  }

  onEdit(): void {
    const src = this.source();
    if (src) this.editSource.emit(src);
  }

  onToggle(): void {
    const src = this.source();
    if (src) {
      const nextStatus = src.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      this.toggleStatus.emit({ id: src.id, status: nextStatus });
    }
  }

  onRecord(): void {
    const src = this.source();
    if (src) this.recordIncomeNow.emit(src);
  }
}
