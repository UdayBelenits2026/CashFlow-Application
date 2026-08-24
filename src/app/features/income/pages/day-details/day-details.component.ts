import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IncomeFacade } from '../../facades/income.facade';
import { IncomeCalendarDay, IncomeCalendarItem } from '../../models/income-calendar.model';

@Component({
  selector: 'app-income-day-details',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, DecimalPipe],
  templateUrl: './day-details.component.html',
  styleUrl: './day-details.component.scss'
})
export class IncomeDayDetailsComponent implements OnInit {
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);
  private readonly incomeFacade: IncomeFacade = inject(IncomeFacade);

  dateParam: string = '';

  readonly calendarDays$: Observable<IncomeCalendarDay[]> = this.incomeFacade.calendarDays$;

  readonly dayData$: Observable<IncomeCalendarDay | null> = this.calendarDays$.pipe(
    map((days) => days.find((d) => d.date === this.dateParam) || null)
  );

  ngOnInit(): void {
    this.incomeFacade.loadDashboard();
    this.dateParam = this.route.snapshot.paramMap.get('date') || '';
  }

  onRecordItem(item: IncomeCalendarItem): void {
    this.incomeFacade.recordRecurringIncome(item.id, item.date);
  }
}
