import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { forkJoin, of } from 'rxjs';
import { catchError, concatMap, exhaustMap, map, mergeMap, switchMap } from 'rxjs/operators';

import { AccountApiService } from '../../data/account-api.service';
import * as AccountActions from '../actions/accounts.actions';

@Injectable()
export class AccountEffects {
  // Streams all dispatched actions.
  private readonly actions$ = inject(Actions);
  // Encapsulates HTTP calls for account resources.
  private readonly api = inject(AccountApiService);

  // Loads all accounts; switchMap cancels any stale request when a newer load starts.
  loadAccounts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountActions.loadAccounts),
      switchMap(() =>
        this.api.getAccounts().pipe(
          map((accounts) => AccountActions.loadAccountsSuccess({ accounts })),
          catchError((error) =>
            of(AccountActions.loadAccountsFailure({ error: this.toMessage(error, 'Failed to load accounts') }))
          )
        )
      )
    )
  );

  // Creates an account then reloads the list; exhaustMap ignores duplicate rapid submits.
  createAccount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountActions.createAccount),
      exhaustMap(({ account }) =>
        this.api.createAccount(account).pipe(
          switchMap(() => this.api.getAccounts()),
          map((accounts) => AccountActions.createAccountSuccess({ accounts })),
          catchError((error) =>
            of(AccountActions.createAccountFailure({ error: this.toMessage(error, 'Failed to create account') }))
          )
        )
      )
    )
  );

  // Updates an account then reloads the list; concatMap preserves the order of edits.
  updateAccount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountActions.updateAccount),
      concatMap(({ account }) =>
        this.api.updateAccount(account).pipe(
          switchMap(() => this.api.getAccounts()),
          map((accounts) => AccountActions.updateAccountSuccess({ accounts })),
          catchError((error) =>
            of(AccountActions.updateAccountFailure({ error: this.toMessage(error, 'Failed to update account') }))
          )
        )
      )
    )
  );

  // Deletes an account; mergeMap lets independent deletions run concurrently.
  deleteAccount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountActions.deleteAccount),
      mergeMap(({ id }) =>
        this.api.deleteAccount(id).pipe(
          map(() => AccountActions.deleteAccountSuccess({ id })),
          catchError((error) =>
            of(AccountActions.deleteAccountFailure({ error: this.toMessage(error, 'Failed to delete account') }))
          )
        )
      )
    )
  );

  // Loads the transactions for the selected account; switchMap drops stale requests.
  loadAccountTransactions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountActions.loadAccountTransactions),
      switchMap(({ accountId }) =>
        this.api.getTransactionsByAccountId(accountId).pipe(
          map((transactions) => AccountActions.loadAccountTransactionsSuccess({ transactions })),
          catchError((error) =>
            of(AccountActions.loadAccountTransactionsFailure({ error: this.toMessage(error, 'Failed to load transactions') }))
          )
        )
      )
    )
  );

  // Loads the form dropdown option lists together; switchMap drops stale loads.
  loadAccountFormOptions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountActions.loadAccountFormOptions),
      switchMap(() =>
        forkJoin({
          accountTypes: this.api.getAccountTypes(),
          banks: this.api.getBanks(),
          currencies: this.api.getCurrencies()
        }).pipe(
          map(({ accountTypes, banks, currencies }) =>
            AccountActions.loadAccountFormOptionsSuccess({ accountTypes, banks, currencies })
          ),
          catchError((error) =>
            of(AccountActions.loadAccountFormOptionsFailure({ error: this.toMessage(error, 'Failed to load form options') }))
          )
        )
      )
    )
  );

  // Loads sub-types for the selected account type; switchMap keeps only the latest.
  loadAccountSubTypes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountActions.loadAccountSubTypes),
      switchMap(({ accountType }) =>
        accountType
          ? this.api.getAccountSubTypes(accountType).pipe(
              map((subTypes) => AccountActions.loadAccountSubTypesSuccess({ subTypes })),
              catchError((error) =>
                of(AccountActions.loadAccountSubTypesFailure({ error: this.toMessage(error, 'Failed to load sub-types') }))
              )
            )
          : of(AccountActions.loadAccountSubTypesSuccess({ subTypes: [] }))
      )
    )
  );

  // Loads all account categories; switchMap drops stale requests.
  loadAccountCategories$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountActions.loadAccountCategories),
      switchMap(() =>
        this.api.getAccountCategories().pipe(
          map((categories) => AccountActions.loadAccountCategoriesSuccess({ categories })),
          catchError((error) =>
            of(AccountActions.loadAccountCategoriesFailure({ error: this.toMessage(error, 'Failed to load categories') }))
          )
        )
      )
    )
  );

  // Creates a category then reloads the list; exhaustMap ignores duplicate rapid submits.
  createAccountCategory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountActions.createAccountCategory),
      exhaustMap(({ category }) =>
        this.api.createAccountCategory(category).pipe(
          switchMap(() => this.api.getAccountCategories()),
          map((categories) => AccountActions.createAccountCategorySuccess({ categories })),
          catchError((error) =>
            of(AccountActions.createAccountCategoryFailure({ error: this.toMessage(error, 'Failed to create category') }))
          )
        )
      )
    )
  );

  // Normalizes an unknown error into a display-friendly message.
  private toMessage(error: unknown, fallback: string): string {
    const message = (error as { message?: string })?.message;
    return message || fallback;
  }
}
