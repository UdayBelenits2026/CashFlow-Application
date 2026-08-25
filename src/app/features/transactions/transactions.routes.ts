import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import { transactionsFeatureKey, transactionsReducer } from './store/transactions.reducers';
import { TransactionsEffects } from './store/transactions.effects';
import { TransactionsComponent } from './transactions.component';
import { unsavedChangesGuard } from './components/transaction-form/unsaved-changes.guard';

// Registers the transactions store slice + effects, then renders each page
// inside the shell's nested router-outlet.
export const TRANSACTIONS_ROUTES: Routes = [
  {
    path: '',
    component: TransactionsComponent,
    providers: [
      provideState(transactionsFeatureKey, transactionsReducer),
      provideEffects(TransactionsEffects)
    ],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/transaction-list/transaction-list').then((m) => m.TransactionList)
      },
      {
        path: 'add',
        loadComponent: () =>
          import('./components/transaction-form/transaction-form').then((m) => m.TransactionForm),
        canDeactivate: [unsavedChangesGuard]
      },
      {
        path: 'edit/:id',
        loadComponent: () =>
          import('./components/transaction-form/transaction-form').then((m) => m.TransactionForm),
        canDeactivate: [unsavedChangesGuard]
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/transaction-details/transaction-details').then((m) => m.TransactionDetails)
      }
    ]
  }
];
