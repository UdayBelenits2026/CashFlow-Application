import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { IncomeFacade } from '../../facades/income.facade';
import { IncomeCalendarDay, IncomeCalendarItem } from '../../models/income-calendar.model';

@Component({
  selector: 'app-income-calendar',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe],
  templateUrl: './income-calendar.component.html',
  styleUrl: './income-calendar.component.scss'
})
export class IncomeCalendarComponent implements OnInit {
  private readonly incomeFacade: IncomeFacade = inject(IncomeFacade);
  private readonly router: Router = inject(Router);

  readonly selectedMonth$: Observable<{ year: number; month: number }> = this.incomeFacade.selectedMonth$;
  readonly calendarDays$: Observable<IncomeCalendarDay[]> = this.incomeFacade.calendarDays$;
  readonly isLoading$: Observable<boolean> = this.incomeFacade.isLoading$;

  currentYear: number = new Date().getFullYear();
  currentMonth: number = new Date().getMonth() + 1; // 1-12

  readonly weekDays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  selectedDayDetails: IncomeCalendarDay | null = null;

  ngOnInit(): void {
    this.incomeFacade.loadDashboard();
    this.updateMonthState();
  }

  updateMonthState(): void {
    this.incomeFacade.setSelectedCalendarMonth(this.currentYear, this.currentMonth);
  }

  prevMonth(): void {
    if (this.currentMonth === 1) {
      this.currentMonth = 12;
      this.currentYear -= 1;
    } else {
      this.currentMonth -= 1;
    }
    this.updateMonthState();
  }

  nextMonth(): void {
    if (this.currentMonth === 12) {
      this.currentMonth = 1;
      this.currentYear += 1;
    } else {
      this.currentMonth += 1;
    }
    this.updateMonthState();
  }

  goToToday(): void {
    const now = new Date();
    this.currentYear = now.getFullYear();
    this.currentMonth = now.getMonth() + 1;
    this.updateMonthState();
  }

  getMonthName(): string {
    const d = new Date(this.currentYear, this.currentMonth - 1, 1);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  getTotalRecordedForMonth(days: IncomeCalendarDay[]): number {
    return days.filter((d) => d.isCurrentMonth).reduce((sum, d) => sum + d.recordedAmount, 0);
  }

  getTotalUpcomingForMonth(days: IncomeCalendarDay[]): number {
    return days.filter((d) => d.isCurrentMonth).reduce((sum, d) => sum + d.upcomingAmount, 0);
  }

  onSelectDay(day: IncomeCalendarDay): void {
    if (day.items.length > 0) {
      this.selectedDayDetails = day;
    }
  }

  onRecordUpcomingItem(item: IncomeCalendarItem): void {
    this.incomeFacade.recordRecurringIncome(item.id, item.date);
    if (this.selectedDayDetails) {
      this.selectedDayDetails = null;
    }
  }
}
