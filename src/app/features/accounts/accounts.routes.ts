import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { accountReducer } from './store/account.reducer';
import { AccountEffects } from './store/account.effects';

export const ACCOUNTS_ROUTES: Routes = [
  {
    path: '',
    providers: [
      provideState('accounts', accountReducer),
      provideEffects(AccountEffects)
    ],
    children: [
  {
    path: '',
    loadComponent: () =>
      import('./pages/account-list/account-list').then(
        (m) => m.AccountListComponent
      )
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/account-list/account-list').then(
        (m) => m.AccountListComponent
      )
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./components/account-form-component/account-form-component').then(
        (m) => m.AccountFormComponent
      )
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./components/account-form-component/account-form-component').then(
        (m) => m.AccountFormComponent
      )
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/account-details/account-details').then(
        (m) => m.AccountDetails
      )
  }
    ]
  }
];
