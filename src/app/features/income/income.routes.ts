import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { incomeFeatureKey, incomeReducer } from './store/income.reducer';
import { IncomeEffects } from './store/income.effects';
import { IncomeComponent } from './income.component';

export const INCOME_ROUTES: Routes = [
  {
    path: '',
    component: IncomeComponent,
    providers: [
      provideState(incomeFeatureKey, incomeReducer),
      provideEffects(IncomeEffects)
    ],
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
      },
      {
        path: 'overview',
        loadComponent: () =>
          import('./pages/income-overview/income-overview.component').then(
            (m) => m.IncomeOverviewComponent
          )
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/full-income-dashboard/full-income-dashboard.component').then(
            (m) => m.FullIncomeDashboardComponent
          )
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./pages/income-history/income-history.component').then(
            (m) => m.IncomeHistoryComponent
          )
      },
      {
        path: 'sources',
        loadComponent: () =>
          import('./pages/income-sources/income-sources.component').then(
            (m) => m.IncomeSourcesComponent
          )
      },
      {
        path: 'recurring',
        loadComponent: () =>
          import('./pages/recurring-income/recurring-income.component').then(
            (m) => m.RecurringIncomeComponent
          )
      },
      {
        path: 'calendar',
        loadComponent: () =>
          import('./pages/income-calendar/income-calendar.component').then(
            (m) => m.IncomeCalendarComponent
          )
      },
      {
        path: 'day-details/:date',
        loadComponent: () =>
          import('./pages/day-details/day-details.component').then(
            (m) => m.IncomeDayDetailsComponent
          )
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./pages/income-reports/income-reports.component').then(
            (m) => m.IncomeReportsComponent
          )
      },
      {
        path: 'trends',
        loadComponent: () =>
          import('./pages/income-trends/income-trends.component').then(
            (m) => m.IncomeTrendsComponent
          )
      },
      {
        path: 'insights',
        loadComponent: () =>
          import('./pages/income-insights/income-insights.component').then(
            (m) => m.IncomeInsightsComponent
          )
      }
    ]
  }
];
