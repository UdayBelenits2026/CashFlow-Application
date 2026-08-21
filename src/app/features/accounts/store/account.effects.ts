/** File purpose: Implements logic for app\features\accounts\store\account.effects.ts. */
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';

import { AccountServices } from '../../../shared/services/account.service';

import {
  loadAccounts,
  loadAccountsSuccess,
  loadAccountsFailure,
  createAccount,
  createAccountSuccess,
  createAccountFailure,
  updateAccount,
  updateAccountSuccess,
  updateAccountFailure
} from './account.actions';

@Injectable()
export class AccountEffects {
  // Streams all dispatched actions.
  private readonly actions$ = inject(Actions);
  // Encapsulates HTTP calls for account resources.
  private readonly accountService = inject(AccountServices);

  // Loads accounts when requested and maps the API result into success/failure actions.
  loadAccounts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadAccounts),

      switchMap(() =>
        this.accountService.getAccounts().pipe(

          map(accounts => {
            console.log('Accounts fetched from JSON Server:', accounts);

            return loadAccountsSuccess({
              accounts
            });
          }),

          catchError(error => {
            console.error('Failed to fetch accounts:', error);

            return of(
              loadAccountsFailure({
                error: error.message || 'Failed to load accounts'
              })
            );
          })

        )
      )
    )
  );

  // Creates a new account, then reloads accounts so UI state stays in sync.
  createAccount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createAccount),
      switchMap(({ account }) =>
        this.accountService.createAccount(account).pipe(
          switchMap(() =>
            this.accountService.getAccounts().pipe(
              map(accounts => createAccountSuccess({ accounts }))
            )
          ),
          catchError(error =>
            of(
              createAccountFailure({
                error: error.message || 'Failed to create account'
              })
            )
          )
        )
      )
    )
  );

  // Updates an existing account, then reloads accounts for a consistent state snapshot.
  updateAccount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateAccount),
      switchMap(({ account }) =>
        this.accountService.updateAccount(account).pipe(
          switchMap(() =>
            this.accountService.getAccounts().pipe(
              map(accounts => updateAccountSuccess({ accounts }))
            )
          ),
          catchError(error =>
            of(
              updateAccountFailure({
                error: error.message || 'Failed to update account'
              })
            )
          )
        )
      )
    )
  );
}
