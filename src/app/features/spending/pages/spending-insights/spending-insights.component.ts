import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable, map } from 'rxjs';
import { SpendingFacade } from '../../facades/spending.facade';
import { SpendingCategoryItem, SpendingInsight } from '../../models/spending-summary.model';
import { DoughnutChart } from '../../../../shared/charts/doughnut-chart/doughnut-chart';
import { buildDoughnutDataset, DoughnutChartVm } from '../../utility/spending.charts';

@Component({
  selector: 'app-spending-insights',
  standalone: true,
  imports: [CommonModule, RouterLink, DoughnutChart],
  templateUrl: './spending-insights.component.html',
  styleUrl: './spending-insights.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpendingInsightsComponent implements OnInit {
  private readonly spendingFacade: SpendingFacade = inject(SpendingFacade);

  readonly insights$: Observable<SpendingInsight[]> = this.spendingFacade.insights$;
  readonly categories$: Observable<SpendingCategoryItem[]> = this.spendingFacade.categories$;
  readonly isLoading$: Observable<boolean> = this.spendingFacade.isLoading$;

  readonly categoryChart$: Observable<DoughnutChartVm> = this.categories$.pipe(
    map((cats) => ({
      labels: cats.map((c) => c.name),
      datasets: buildDoughnutDataset(cats.map((c) => c.amount), cats.map((c) => c.color || '')),
      total: cats.reduce((sum, c) => sum + (c.amount || 0), 0)
    }))
  );

  ngOnInit(): void {
    this.spendingFacade.loadDashboard();
  }

  accentClass(type: string): string {
    switch (type) {
      case 'positive': return 'accent-positive';
      case 'negative': return 'accent-negative';
      case 'info': return 'accent-info';
      default: return 'accent-neutral';
    }
  }

  iconFor(type: string): string {
    switch (type) {
      case 'positive': return '📈';
      case 'negative': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '💡';
    }
  }
}
