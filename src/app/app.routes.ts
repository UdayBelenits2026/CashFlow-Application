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
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard-home/dashboard-home').then(
            (m) => m.DashboardHome,
          ),
        children: [
          {
            path: '',
            pathMatch: 'full',
            loadComponent: () =>
              import('./features/dashboard/pages/dashboard-route-entry/dashboard-route-entry').then(
                (m) => m.DashboardRouteEntry,
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/dashboard/pages/dashboard-new-user/dashboard-new-user').then(
                (m) => m.DashboardNewUser,
              ),
          },
          {
            path: 'home',
            loadComponent: () =>
              import('./features/dashboard/pages/dashboard-existing-user/dashboard-existing-user').then(
                (m) => m.DashboardExistingUser,
              ),
          },
          {
            path: 'customize',
            loadComponent: () =>
              import('./features/dashboard/pages/dashboard-customize/dashboard-customize').then(
                (m) => m.DashboardCustomize,
              ),
          },
          {
            path: 'filter',
            loadComponent: () =>
              import('./features/dashboard/pages/dashboard-filter/dashboard-filter').then(
                (m) => m.DashboardFilter,
              ),
          },
        ],
      },
    ],
  },
  // {
  //   path: '**',
  //   redirectTo: '',
  // },
];
