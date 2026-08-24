import { Expense } from './expense.model';

/** A single cell in the expense calendar grid. */
export interface CalendarDay {
  date: Date;
  dateString: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  totalSpending: number;
  expenses: Expense[];
}
