import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { spendingFeatureKey, spendingReducer } from './store/spending.reducer';
import { SpendingEffects } from './store/spending.effects';
import { SpendingComponent } from './spending.component';

export const SPENDING_ROUTES: Routes = [
  {
    path: '',
    component: SpendingComponent,
    providers: [
      provideState(spendingFeatureKey, spendingReducer),
      provideEffects(SpendingEffects)
    ],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/full-spending-dashboard/full-spending-dashboard.component').then(
            (m) => m.FullSpendingDashboardComponent
          )
      },
      {
        path: 'expenses',
        loadComponent: () =>
          import('./pages/all-expenses/all-expenses.component').then(
            (m) => m.AllExpensesComponent
          )
      },
      {
        path: 'trends',
        loadComponent: () =>
          import('./pages/spending-trends/spending-trends.component').then(
            (m) => m.SpendingTrendsComponent
          )
      },
      {
        path: 'calendar',
        loadComponent: () =>
          import('./pages/expense-calendar/expense-calendar.component').then(
            (m) => m.ExpenseCalendarComponent
          )
      },
      {
        path: 'day-details/:date',
        loadComponent: () =>
          import('./pages/day-details/day-details.component').then(
            (m) => m.DayDetailsComponent
          )
      },
      {
        path: 'recurring',
        loadComponent: () =>
          import('./pages/recurring-expenses/recurring-expenses.component').then(
            (m) => m.RecurringExpensesComponent
          )
      },
      {
        path: 'insights',
        loadComponent: () =>
          import('./pages/spending-insights/spending-insights.component').then(
            (m) => m.SpendingInsightsComponent
          )
      },
      {
        path: 'alerts',
        loadComponent: () =>
          import('./pages/spending-alerts/spending-alerts.component').then(
            (m) => m.SpendingAlertsComponent
          )
      },
      {
        path: 'tags',
        loadComponent: () =>
          import('./pages/spending-tags/spending-tags.component').then(
            (m) => m.SpendingTagsComponent
          )
      }
    ]
  }
];
