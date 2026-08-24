import { Component, OnInit, inject, DestroyRef, signal, computed, WritableSignal, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SpendingFacade } from '../../facades/spending.facade';
import { Expense } from '../../models/expense.model';
import { CalendarDay } from '../../models/calendar-day.model';
import { exportExpensesToCsv } from '../../utility/spending.helpers';
import { ExpenseDetailsDrawerComponent } from '../../components/expense-details-drawer/expense-details-drawer.component';

@Component({
  selector: 'app-expense-calendar',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, DecimalPipe, ExpenseDetailsDrawerComponent],
  templateUrl: './expense-calendar.component.html',
  styleUrl: './expense-calendar.component.scss'
})
export class ExpenseCalendarComponent implements OnInit {
  private readonly spendingFacade: SpendingFacade = inject(SpendingFacade);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  private latestExpenses: Expense[] = [];
  private readonly today: Date = new Date();
  readonly currentDate: WritableSignal<Date> = signal(new Date());
  calendarDays: CalendarDay[] = [];
  selectedDay: CalendarDay | null = null;

  showDetailsDrawer: boolean = false;
  activeExpense: Expense | null = null;

  ngOnInit(): void {
    this.spendingFacade.loadDashboard();
    this.spendingFacade.allExpenses$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((expenses) => {
        this.latestExpenses = expenses;
        this.buildCalendar(expenses);
      });
  }

  readonly currentYearMonthLabel: Signal<string> = computed(() =>
    this.currentDate().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  );

  changeMonth(delta: number): void {
    this.currentDate.set(new Date(this.currentDate().getFullYear(), this.currentDate().getMonth() + delta, 1));
    this.buildCalendar(this.latestExpenses);
  }

  buildCalendar(expenses: Expense[]): void {
    const year = this.currentDate().getFullYear();
    const month = this.currentDate().getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days: CalendarDay[] = [];

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthDays - i);
      days.push(this.createDayObj(d, false, expenses));
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      days.push(this.createDayObj(d, true, expenses));
    }

    // Next month padding to fill 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push(this.createDayObj(d, false, expenses));
    }

    this.calendarDays = days;

    // Default selection: today, else first day of the current month
    const target = days.find((d) => d.isToday) || days.find((d) => d.isCurrentMonth) || days[firstDayIndex];
    if (target) {
      this.selectedDay = target;
    }
  }

  createDayObj(date: Date, isCurrentMonth: boolean, expenses: Expense[]): CalendarDay {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const dateString = `${y}-${m}-${d}`;

    const matchingExpenses = expenses.filter((e) => e.date === dateString);
    const total = matchingExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    return {
      date,
      dateString,
      dayNumber: date.getDate(),
      isCurrentMonth,
      isToday:
        date.getFullYear() === this.today.getFullYear() &&
        date.getMonth() === this.today.getMonth() &&
        date.getDate() === this.today.getDate(),
      totalSpending: total,
      expenses: matchingExpenses
    };
  }

  selectDay(day: CalendarDay): void {
    this.selectedDay = day;
  }

  severityClass(total: number): string {
    if (total <= 0) return '';
    if (total < 50) return 'sev-low';
    if (total <= 100) return 'sev-medium';
    return 'sev-high';
  }

  openExpenseDetails(exp: Expense): void {
    this.activeExpense = exp;
    this.showDetailsDrawer = true;
  }

  exportDayReport(): void {
    if (!this.selectedDay || this.selectedDay.expenses.length === 0) return;
    exportExpensesToCsv(this.selectedDay.expenses, `spending_day_report_${this.selectedDay.dateString}`);
  }
}
