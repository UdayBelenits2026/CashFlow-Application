import { ChangeDetectionStrategy, Component, OnInit, Signal, WritableSignal, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IncomeFacade } from '../../facades/income.facade';
import { IncomeCalendarDay, IncomeCalendarItem } from '../../models/income-calendar.model';

@Component({
  selector: 'app-income-day-details',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, DecimalPipe],
  templateUrl: './day-details.component.html',
  styleUrl: './day-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncomeDayDetailsComponent implements OnInit {
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);
  private readonly incomeFacade: IncomeFacade = inject(IncomeFacade);

  readonly dateParam: WritableSignal<string> = signal('');

  readonly calendarDays: Signal<IncomeCalendarDay[]> = toSignal(this.incomeFacade.calendarDays$, {
    initialValue: [] as IncomeCalendarDay[]
  });

  readonly dayData: Signal<IncomeCalendarDay | null> = computed(() => {
    const date: string = this.dateParam();
    return this.calendarDays().find((d) => d.date === date) || null;
  });

  ngOnInit(): void {
    this.incomeFacade.loadDashboard();
    this.dateParam.set(this.route.snapshot.paramMap.get('date') || '');
  }

  onRecordItem(item: IncomeCalendarItem): void {
    this.incomeFacade.recordRecurringIncome(item.id, item.date);
  }
}
