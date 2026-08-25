import { ChangeDetectionStrategy, Component, input, output, InputSignal, OutputEmitterRef } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Income } from '../../models/income.model';

@Component({
  selector: 'app-recent-income',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe],
  templateUrl: './recent-income.component.html',
  styleUrl: './recent-income.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecentIncomeComponent {
  readonly incomes: InputSignal<Income[]> = input<Income[]>([]);
  readonly selectIncome: OutputEmitterRef<Income> = output<Income>();
  readonly editIncome: OutputEmitterRef<Income> = output<Income>();
  readonly deleteIncome: OutputEmitterRef<Income> = output<Income>();

  onSelect(inc: Income): void {
    this.selectIncome.emit(inc);
  }

  onEdit(event: Event, inc: Income): void {
    event.stopPropagation();
    this.editIncome.emit(inc);
  }

  onDelete(event: Event, inc: Income): void {
    event.stopPropagation();
    this.deleteIncome.emit(inc);
  }
}
