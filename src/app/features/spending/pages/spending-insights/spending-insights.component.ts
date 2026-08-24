import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ChartConfiguration } from 'chart.js';
import { Observable } from 'rxjs';
import { SpendingFacade } from '../../facades/spending.facade';
import { SpendingCategoryItem, SpendingInsight } from '../../models/spending-summary.model';
import { DoughnutChart } from '../../../../shared/charts/doughnut-chart/doughnut-chart';

@Component({
  selector: 'app-spending-insights',
  standalone: true,
  imports: [CommonModule, RouterLink, DoughnutChart],
  templateUrl: './spending-insights.component.html',
  styleUrl: './spending-insights.component.scss'
})
export class SpendingInsightsComponent implements OnInit {
  private readonly spendingFacade: SpendingFacade = inject(SpendingFacade);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  readonly insights$: Observable<SpendingInsight[]> = this.spendingFacade.insights$;
  readonly categories$: Observable<SpendingCategoryItem[]> = this.spendingFacade.categories$;
  readonly isLoading$: Observable<boolean> = this.spendingFacade.isLoading$;

  categoryLabels: string[] = [];
  categoryDatasets: ChartConfiguration<'doughnut'>['data']['datasets'] = [];
  categoryTotal: number = 0;

  ngOnInit(): void {
    this.spendingFacade.loadDashboard();
    this.categories$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((cats: SpendingCategoryItem[]) => {
      this.categoryLabels = cats.map((c) => c.name);
      this.categoryDatasets = [
        {
          data: cats.map((c) => c.amount),
          backgroundColor: cats.map((c) => c.color || '#3B82F6'),
          borderWidth: 2,
          borderColor: '#ffffff'
        }
      ];
      this.categoryTotal = cats.reduce((sum, c) => sum + (c.amount || 0), 0);
    });
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
