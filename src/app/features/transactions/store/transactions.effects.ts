import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, concatMap, exhaustMap, map, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';

import { ApiServices } from '../data/api-services';
import * as TransactionsActions from './transactions.actions';
import { selectTransactionQuery } from './transactions.select';

@Injectable()
export class TransactionsEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly api = inject(ApiServices);

  // Reloads the current page when the query changes or a delete completes;
  // switchMap cancels a stale request when a newer load starts.
  loadTransactions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        TransactionsActions.loadTransactions,
        TransactionsActions.setTransactionPage,
        TransactionsActions.setTransactionPageSize,
        TransactionsActions.setTransactionSort,
        TransactionsActions.setTransactionAccountFilter,
        TransactionsActions.clearTransactionFilters,
        TransactionsActions.deleteTransactionSuccess
      ),
      withLatestFrom(this.store.select(selectTransactionQuery)),
      switchMap(([, query]) =>
        this.api
          .getTransactions({
            page: query.page,
            size: query.size,
            sort: query.sort,
            accountId: query.accountId ?? undefined
          })
          .pipe(
            map((result) => TransactionsActions.loadTransactionsSuccess({ result })),
            catchError((error) =>
              of(
                TransactionsActions.loadTransactionsFailure({
                  error: this.toMessage(error, 'Failed to load transactions.')
                })
              )
            )
          )
      )
    )
  );

  // Loads a single transaction for the read-only details view.
  loadDetail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TransactionsActions.loadTransactionDetail),
      switchMap(({ id }) =>
        this.api.getTransactionById(id).pipe(
          map((detail) => TransactionsActions.loadTransactionDetailSuccess({ detail })),
          catchError((error) =>
            of(
              TransactionsActions.loadTransactionDetailFailure({
                error: this.toMessage(error, 'We could not load this transaction.')
              })
            )
          )
        )
      )
    )
  );

  // Loads edit-form data (includes readOnlyFieldNames + accountEditable).
  loadForEdit$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TransactionsActions.loadTransactionForEdit),
      switchMap(({ id }) =>
        this.api.getTransactionForEdit(id).pipe(
          map((editData) => TransactionsActions.loadTransactionForEditSuccess({ editData })),
          catchError((error) =>
            of(
              TransactionsActions.loadTransactionForEditFailure({
                error: this.toMessage(error, 'We could not load the transaction to edit.')
              })
            )
          )
        )
      )
    )
  );

  // Creates a transaction; exhaustMap prevents duplicate submits.
  createTransaction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TransactionsActions.createTransaction),
      exhaustMap(({ request, idempotencyKey }) =>
        this.api.createTransaction(request, idempotencyKey).pipe(
          map((response) => TransactionsActions.createTransactionSuccess({ response })),
          catchError((error) =>
            of(
              TransactionsActions.createTransactionFailure({
                error: this.toMessage(error, 'Something went wrong. Please try again.')
              })
            )
          )
        )
      )
    )
  );

  // Updates a transaction; concatMap preserves edit order.
  updateTransaction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TransactionsActions.updateTransaction),
      concatMap(({ id, request }) =>
        this.api.updateTransaction(id, request).pipe(
          map((response) => TransactionsActions.updateTransactionSuccess({ response })),
          catchError((error) =>
            of(
              TransactionsActions.updateTransactionFailure({
                error: this.toMessage(error, 'Something went wrong. Please try again.')
              })
            )
          )
        )
      )
    )
  );

  // Deletes (soft-cancels) a transaction; mergeMap lets independent deletes run concurrently.
  deleteTransaction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TransactionsActions.deleteTransaction),
      mergeMap(({ id }) =>
        this.api.deleteTransaction(id).pipe(
          map((data) => TransactionsActions.deleteTransactionSuccess({ data })),
          catchError((error) =>
            of(
              TransactionsActions.deleteTransactionFailure({
                error: this.toMessage(error, 'We could not delete the transaction.')
              })
            )
          )
        )
      )
    )
  );

  // Builds a user-facing message, preserving the backend correlationId when present.
  private toMessage(error: unknown, fallback: string): string {
    const httpError = error as HttpErrorResponse;
    const body = httpError?.error as { message?: string; correlationId?: string } | null;
    const base = body?.message || httpError?.message || fallback;
    return body?.correlationId ? `${base} (ref: ${body.correlationId})` : base;
  }
}
