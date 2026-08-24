import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { IncomeFacade } from '../../facades/income.facade';
import { IncomeInsight, IncomeOverviewData } from '../../models/income-summary.model';

@Component({
  selector: 'app-income-insights',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './income-insights.component.html',
  styleUrl: './income-insights.component.scss'
})
export class IncomeInsightsComponent implements OnInit {
  private readonly incomeFacade: IncomeFacade = inject(IncomeFacade);

  readonly insights$: Observable<IncomeInsight[]> = this.incomeFacade.insights$;
  readonly overview$: Observable<IncomeOverviewData | null> = this.incomeFacade.overview$;
  readonly isLoading$: Observable<boolean> = this.incomeFacade.isLoading$;

  ngOnInit(): void {
    this.incomeFacade.loadDashboard();
  }

  insightAccentClass(type: string): string {
    switch (type) {
      case 'positive': return 'accent-positive';
      case 'negative': return 'accent-negative';
      case 'info': return 'accent-info';
      default: return 'accent-neutral';
    }
  }
}
