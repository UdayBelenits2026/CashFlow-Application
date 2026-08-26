import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/dashboard-home/dashboard-home').then((m) => m.DashboardHome),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/dashboard-route-entry/dashboard-route-entry').then(
            (m) => m.DashboardRouteEntry,
          ),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./pages/dashboard-new-user/dashboard-new-user').then((m) => m.DashboardNewUser),
      },
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/dashboard-existing-user/dashboard-existing-user').then(
            (m) => m.DashboardExistingUser,
          ),
      },
      {
        path: 'customize',
        loadComponent: () =>
          import('./pages/dashboard-customize/dashboard-customize').then(
            (m) => m.DashboardCustomize,
          ),
      },
      {
        path: 'upcoming-bills',
        loadComponent: () =>
          import('./pages/dashboard-upcoming-bills/dashboard-upcoming-bills').then(
            (m) => m.DashboardUpcomingBills,
          ),
      },
    ],
  },
];
