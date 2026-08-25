import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed, WritableSignal, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { IncomeFacade } from '../../facades/income.facade';
import { IncomeCalendarDay, IncomeCalendarItem } from '../../models/income-calendar.model';
import { Income } from '../../models/income.model';
import { exportIncomeToCsv } from '../../utility/income.helpers';

@Component({
  selector: 'app-income-calendar',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe],
  templateUrl: './income-calendar.component.html',
  styleUrl: './income-calendar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncomeCalendarComponent implements OnInit {
  private readonly incomeFacade: IncomeFacade = inject(IncomeFacade);
  private readonly router: Router = inject(Router);

  readonly weekDays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  readonly currentYear: WritableSignal<number> = signal(new Date().getFullYear());
  readonly currentMonth: WritableSignal<number> = signal(new Date().getMonth() + 1); // 1-12

  readonly calendarDays: Signal<IncomeCalendarDay[]> = toSignal(this.incomeFacade.calendarDays$, {
    initialValue: [] as IncomeCalendarDay[]
  });
  private readonly allIncomes: Signal<Income[]> = toSignal(this.incomeFacade.allIncomes$, {
    initialValue: [] as Income[]
  });
  private readonly selectedDateString: WritableSignal<string | null> = signal<string | null>(null);

  // Resolves the chosen day within the visible grid, falling back to today / first current-month day.
  readonly selectedDay: Signal<IncomeCalendarDay | null> = computed(() => {
    const days: IncomeCalendarDay[] = this.calendarDays();
    const chosen: string | null = this.selectedDateString();
    const found: IncomeCalendarDay | undefined = chosen ? days.find((d) => d.date === chosen) : undefined;
    if (found) {
      return found;
    }
    return days.find((d) => d.isToday) || days.find((d) => d.isCurrentMonth) || null;
  });

  readonly totalRecorded: Signal<number> = computed(() =>
    this.calendarDays().filter((d) => d.isCurrentMonth).reduce((sum, d) => sum + d.recordedAmount, 0)
  );
  readonly totalUpcoming: Signal<number> = computed(() =>
    this.calendarDays().filter((d) => d.isCurrentMonth).reduce((sum, d) => sum + d.upcomingAmount, 0)
  );

  readonly monthName: Signal<string> = computed(() => {
    const d = new Date(this.currentYear(), this.currentMonth() - 1, 1);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });

  ngOnInit(): void {
    this.incomeFacade.loadDashboard();
    this.updateMonthState();
  }

  updateMonthState(): void {
    this.incomeFacade.setSelectedCalendarMonth(this.currentYear(), this.currentMonth());
  }

  prevMonth(): void {
    if (this.currentMonth() === 1) {
      this.currentMonth.set(12);
      this.currentYear.update((y) => y - 1);
    } else {
      this.currentMonth.update((m) => m - 1);
    }
    this.updateMonthState();
  }

  nextMonth(): void {
    if (this.currentMonth() === 12) {
      this.currentMonth.set(1);
      this.currentYear.update((y) => y + 1);
    } else {
      this.currentMonth.update((m) => m + 1);
    }
    this.updateMonthState();
  }

  goToToday(): void {
    const now = new Date();
    this.currentYear.set(now.getFullYear());
    this.currentMonth.set(now.getMonth() + 1);
    this.selectedDateString.set(null);
    this.updateMonthState();
  }

  selectDay(day: IncomeCalendarDay): void {
    this.selectedDateString.set(day.date);
  }

  onRecordUpcomingItem(item: IncomeCalendarItem): void {
    this.incomeFacade.recordRecurringIncome(item.id, item.date);
  }

  viewFullDay(date: string): void {
    this.router.navigate(['/income/day-details', date]);
  }

  exportDayReport(): void {
    const sel: IncomeCalendarDay | null = this.selectedDay();
    if (!sel) return;
    const dayIncomes: Income[] = this.allIncomes().filter((i) => i.status === 'RECORDED' && i.date === sel.date);
    if (dayIncomes.length === 0) return;
    exportIncomeToCsv(dayIncomes, `income_day_report_${sel.date}`);
  }
}
