import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./core/auth/pages/sign-in/sign-in').then((m) => m.SignInComponent),
  },
  {
    path: 'sign-up',
    loadComponent: () => import('./core/auth/pages/sign-up/sign-up').then((m) => m.SignUp),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./core/auth/pages/forgot-password/forgot-password').then((m) => m.ForgotPassword),
  },
  {
    path: '',
    loadComponent: () => import('./core/layout/main-layout/main-layout').then((m) => m.MainLayout),
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'transactions',
        loadChildren: () =>
          import('./features/transactions/transactions.routes').then((m) => m.TRANSACTIONS_ROUTES),
      },
      {
        path: 'income',
        loadChildren: () => import('./features/income/income.routes').then((m) => m.INCOME_ROUTES),
      },
      {
        path: 'spending',
        loadChildren: () =>
          import('./features/spending/spending.routes').then((m) => m.SPENDING_ROUTES),
      },
      {
        path: 'cash-flow',
        loadComponent: () =>
          import('./features/cash-flow/cash-flow.component').then((m) => m.CashFlowComponent),
      },
      {
        path: 'budget',
        loadComponent: () =>
          import('./features/budgets/budgets.component').then((m) => m.BudgetsComponent),
      },
      {
        path: 'goals',
        loadComponent: () =>
          import('./features/goals/goals.component').then((m) => m.GoalsComponent),
      },
      {
        path: 'accounts',
        loadChildren: () =>
          import('./features/accounts/accounts.route').then((m) => m.ACCOUNTS_ROUTES),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/reports.component').then((m) => m.ReportsComponent),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings.component').then((m) => m.SettingsComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
