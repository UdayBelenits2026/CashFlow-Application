import { Component, input, output } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Expense } from '../../models/expense.model';

@Component({
  selector: 'app-recent-expenses',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, DecimalPipe],
  templateUrl: './recent-expenses.component.html',
  styleUrl: './recent-expenses.component.scss'
})
export class RecentExpensesComponent {
  readonly expenses = input<Expense[]>([]);
  readonly expenseSelected = output<Expense>();

  onSelect(exp: Expense): void {
    this.expenseSelected.emit(exp);
  }
}
