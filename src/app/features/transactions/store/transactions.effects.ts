import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, concatMap, exhaustMap, map, mergeMap, switchMap } from 'rxjs/operators';

import { ApiServices } from '../data/api-services';
import * as TransactionsActions from './transactions.actions';

@Injectable()
export class TransactionsEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(ApiServices);

  // Loads transactions; switchMap cancels a stale request when a newer load starts.
  loadTransactions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TransactionsActions.loadTransactions),
      switchMap(() =>
        this.api.getTransactions().pipe(
          map((transactions) => TransactionsActions.loadTransactionsSuccess({ transactions })),
          catchError((error) =>
            of(TransactionsActions.loadTransactionsFailure({ error: error?.message || 'Failed to load transactions' }))
          )
        )
      )
    )
  );

  // Deletes a transaction; mergeMap lets independent deletes run concurrently.
  deleteTransaction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TransactionsActions.deleteTransaction),
      mergeMap(({ id }) =>
        this.api.deleteTransaction(id).pipe(
          map(() => TransactionsActions.deleteTransactionSuccess({ id })),
          catchError((error) =>
            of(TransactionsActions.deleteTransactionFailure({ error: error?.message || 'Failed to delete transaction' }))
          )
        )
      )
    )
  );

  // Duplicates a transaction (copy without id) then reloads; exhaustMap ignores rapid repeats.
  duplicateTransaction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TransactionsActions.duplicateTransaction),
      exhaustMap(({ transaction }) => {
        const { id, ...copy } = transaction;
        return this.api.createTransaction(copy).pipe(
          switchMap(() => this.api.getTransactions()),
          map((transactions) => TransactionsActions.duplicateTransactionSuccess({ transactions })),
          catchError((error) =>
            of(TransactionsActions.duplicateTransactionFailure({ error: error?.message || 'Failed to duplicate transaction' }))
          )
        );
      })
    )
  );

  // Changes a transaction's category then reloads; concatMap preserves edit order.
  changeTransactionCategory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TransactionsActions.changeTransactionCategory),
      concatMap(({ id, category }) =>
        this.api.updateTransaction(id, { category }).pipe(
          switchMap(() => this.api.getTransactions()),
          map((transactions) => TransactionsActions.changeTransactionCategorySuccess({ transactions })),
          catchError((error) =>
            of(TransactionsActions.changeTransactionCategoryFailure({ error: error?.message || 'Failed to update category' }))
          )
        )
      )
    )
  );

  // Loads a single transaction for the edit form.
  loadTransaction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TransactionsActions.loadTransaction),
      switchMap(({ id }) =>
        this.api.getTransaction(id).pipe(
          map((transaction) => TransactionsActions.loadTransactionSuccess({ transaction })),
          catchError(() =>
            of(TransactionsActions.loadTransactionFailure({ error: 'We could not find the transaction you are trying to edit.' }))
          )
        )
      )
    )
  );

  // Creates a transaction from the form then reloads; exhaustMap prevents duplicate submits.
  createTransaction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TransactionsActions.createTransaction),
      exhaustMap(({ transaction, idempotencyKey }) =>
        this.api.createTransaction(transaction, idempotencyKey).pipe(
          switchMap(() => this.api.getTransactions()),
          map((transactions) => TransactionsActions.createTransactionSuccess({ transactions })),
          catchError(() =>
            of(TransactionsActions.createTransactionFailure({ error: 'Something went wrong. Please try again.' }))
          )
        )
      )
    )
  );

  // Updates a transaction from the form then reloads; concatMap preserves order.
  updateTransaction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TransactionsActions.updateTransaction),
      concatMap(({ id, changes }) =>
        this.api.updateTransaction(id, changes).pipe(
          switchMap(() => this.api.getTransactions()),
          map((transactions) => TransactionsActions.updateTransactionSuccess({ transactions })),
          catchError(() =>
            of(TransactionsActions.updateTransactionFailure({ error: 'Something went wrong. Please try again.' }))
          )
        )
      )
    )
  );
}
