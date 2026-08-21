import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { SpendingFacade } from '../../facades/spending.facade';
import { Expense } from '../../models/expense.model';
import { ExpenseDetailsDrawerComponent } from '../../components/expense-details-drawer/expense-details-drawer.component';

interface CalendarDay {
  date: Date;
  dateString: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  totalSpending: number;
  expenses: Expense[];
}

@Component({
  selector: 'app-expense-calendar',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe, ExpenseDetailsDrawerComponent],
  templateUrl: './expense-calendar.component.html',
  styleUrl: './expense-calendar.component.scss'
})
export class ExpenseCalendarComponent implements OnInit {
  private readonly spendingFacade = inject(SpendingFacade);

  currentDate = new Date(2026, 4, 29); // May 2026
  calendarDays: CalendarDay[] = [];
  selectedDay: CalendarDay | null = null;

  showDetailsDrawer = false;
  activeExpense: Expense | null = null;

  ngOnInit(): void {
    this.spendingFacade.loadDashboard();
    this.spendingFacade.allExpenses$.subscribe((expenses) => {
      this.buildCalendar(expenses);
    });
  }

  get currentYearMonthLabel(): string {
    return this.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  changeMonth(delta: number): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + delta, 1);
    this.spendingFacade.allExpenses$.subscribe((expenses) => {
      this.buildCalendar(expenses);
    });
  }

  buildCalendar(expenses: Expense[]): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

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

    // Default selection: today or 29th
    const target = days.find((d) => d.dayNumber === 29 && d.isCurrentMonth) || days[firstDayIndex];
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
      isToday: date.getDate() === 29 && date.getMonth() === 4 && date.getFullYear() === 2026,
      totalSpending: total,
      expenses: matchingExpenses
    };
  }

  selectDay(day: CalendarDay): void {
    this.selectedDay = day;
  }

  openExpenseDetails(exp: Expense): void {
    this.activeExpense = exp;
    this.showDetailsDrawer = true;
  }

  exportDayReport(): void {
    if (!this.selectedDay || this.selectedDay.expenses.length === 0) return;

    const headers = ['Transaction ID', 'Date', 'Merchant', 'Category', 'Account', 'Payment Method', 'Amount ($)', 'Status', 'Notes'];
    const rows = this.selectedDay.expenses.map((e) => [
      `"${e.id}"`,
      `"${e.date}"`,
      `"${e.merchantName.replace(/"/g, '""')}"`,
      `"${e.categoryName.replace(/"/g, '""')}"`,
      `"${e.accountName.replace(/"/g, '""')}"`,
      `"${e.paymentMethod || 'DEBIT_CARD'}"`,
      e.amount,
      `"${e.status || 'CLEARED'}"`,
      `"${(e.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `spending_day_report_${this.selectedDay.dateString}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
