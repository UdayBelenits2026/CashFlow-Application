import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import { accountsFeatureKey } from './store/state/accounts.state';
import { accountReducer } from './store/reducers/accounts.reducer';
import { AccountEffects } from './store/effects/accounts.effects';
import { AccountsComponent } from './accounts.component';

// Feature routes register the accounts store slice and effects, then render
// each page inside the shell's nested router-outlet.
export const ACCOUNTS_ROUTES: Routes = [
  {
    path: '',
    component: AccountsComponent,
    providers: [
      provideState(accountsFeatureKey, accountReducer),
      provideEffects(AccountEffects)
    ],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/account-list/account-list').then((m) => m.AccountListComponent)
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
        path: 'categories',
        loadComponent: () =>
          import('./pages/accounts-categories/accounts-categories').then(
            (m) => m.AccountsCategories
          )
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/account-detail/account-details').then((m) => m.AccountDetails)
      }
    ]
  }
];
