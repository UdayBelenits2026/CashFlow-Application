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
          import('./pages/spending-dashboard/spending-dashboard.component').then(
            (m) => m.SpendingDashboardComponent
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
        path: 'calendar',
        loadComponent: () =>
          import('./pages/expense-calendar/expense-calendar.component').then(
            (m) => m.ExpenseCalendarComponent
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
        path: 'tags',
        loadComponent: () =>
          import('./pages/spending-tags/spending-tags.component').then(
            (m) => m.SpendingTagsComponent
          )
      }
    ]
  }
];
