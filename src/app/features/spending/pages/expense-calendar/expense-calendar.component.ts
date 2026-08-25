import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed, WritableSignal, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SpendingFacade } from '../../facades/spending.facade';
import { Expense } from '../../models/expense.model';
import { CalendarDay } from '../../models/calendar-day.model';
import { exportExpensesToCsv } from '../../utility/spending.helpers';
import { buildCalendarDays } from '../../utility/spending.calculations';
import { ExpenseDetailsDrawerComponent } from '../../components/expense-details-drawer/expense-details-drawer.component';

@Component({
  selector: 'app-expense-calendar',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, DecimalPipe, ExpenseDetailsDrawerComponent],
  templateUrl: './expense-calendar.component.html',
  styleUrl: './expense-calendar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpenseCalendarComponent implements OnInit {
  private readonly spendingFacade: SpendingFacade = inject(SpendingFacade);
  private readonly today: Date = new Date();

  readonly currentDate: WritableSignal<Date> = signal(new Date());
  private readonly expenses: Signal<Expense[]> = toSignal(this.spendingFacade.allExpenses$, { initialValue: [] as Expense[] });
  private readonly selectedDateString: WritableSignal<string | null> = signal<string | null>(null);

  readonly calendarDays: Signal<CalendarDay[]> = computed(() =>
    buildCalendarDays(this.currentDate(), this.expenses(), this.today)
  );

  // Resolves the chosen day within the visible grid, falling back to today / first of month.
  readonly selectedDay: Signal<CalendarDay | null> = computed(() => {
    const days: CalendarDay[] = this.calendarDays();
    const chosen: string | null = this.selectedDateString();
    const found: CalendarDay | undefined = chosen ? days.find((d) => d.dateString === chosen) : undefined;
    if (found) {
      return found;
    }
    const firstDayIndex: number = new Date(this.currentDate().getFullYear(), this.currentDate().getMonth(), 1).getDay();
    return days.find((d) => d.isToday) || days.find((d) => d.isCurrentMonth) || days[firstDayIndex] || null;
  });

  readonly currentYearMonthLabel: Signal<string> = computed(() =>
    this.currentDate().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  );

  showDetailsDrawer: boolean = false;
  activeExpense: Expense | null = null;

  ngOnInit(): void {
    this.spendingFacade.loadDashboard();
  }

  changeMonth(delta: number): void {
    this.currentDate.set(new Date(this.currentDate().getFullYear(), this.currentDate().getMonth() + delta, 1));
  }

  selectDay(day: CalendarDay): void {
    this.selectedDateString.set(day.dateString);
  }

  severityClass(total: number): string {
    switch (true) {
      case total <= 0:
        return '';
      case total < 50:
        return 'sev-low';
      case total <= 100:
        return 'sev-medium';
      default:
        return 'sev-high';
    }
  }

  openExpenseDetails(exp: Expense): void {
    this.activeExpense = exp;
    this.showDetailsDrawer = true;
  }

  exportDayReport(): void {
    const sel: CalendarDay | null = this.selectedDay();
    if (!sel || sel.expenses.length === 0) return;
    exportExpensesToCsv(sel.expenses, `spending_day_report_${sel.dateString}`);
  }
}
