import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./core/auth/pages/sign-in/sign-in').then((m) => m.SignInComponent),
  },
  {
    path: 'sign-up',
    loadComponent: () => import('./core/auth/pages/sign-up/sign-up').then((m) => m.SignUp),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./core/layout/main-layout/main-layout').then((m) => m.MainLayout),
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
  },
  // {
  //   path: '**',
  //   redirectTo: '',
  // },
];
