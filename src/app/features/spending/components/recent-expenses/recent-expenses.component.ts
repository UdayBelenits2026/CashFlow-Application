import { ChangeDetectionStrategy, Component, input, output, InputSignal, OutputEmitterRef } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Expense } from '../../models/expense.model';

@Component({
  selector: 'app-recent-expenses',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, DecimalPipe],
  templateUrl: './recent-expenses.component.html',
  styleUrl: './recent-expenses.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecentExpensesComponent {
  readonly expenses: InputSignal<Expense[]> = input<Expense[]>([]);
  readonly expenseSelected: OutputEmitterRef<Expense> = output<Expense>();

  onSelect(exp: Expense): void {
    this.expenseSelected.emit(exp);
  }
}
