import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, catchError, switchMap, mergeMap, withLatestFrom, filter } from 'rxjs/operators';
import { SpendingApiService } from '../services/spending-api.service';
import * as SpendingActions from './spending.actions';
import * as SpendingSelectors from './spending.selectors';
import { buildExpenseEntity } from '../utility/spending.calculations';

@Injectable()
export class SpendingEffects {
  private readonly actions$: Actions = inject(Actions);
  private readonly apiService: SpendingApiService = inject(SpendingApiService);
  private readonly store: Store = inject(Store);

  loadSpendingDashboard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SpendingActions.loadSpendingDashboard),
      withLatestFrom(this.store.select(SpendingSelectors.selectHasLoadedData)),
      filter(([, hasLoaded]) => !hasLoaded),
      switchMap(() =>
        this.apiService.getDashboardData().pipe(
          map((data) =>
            SpendingActions.loadSpendingDashboardSuccess({
              overview: data.overview,
              categories: data.categories,
              trendPoints: data.trendPoints,
              expenses: data.expenses || [],
              tags: data.tags || [],
              recurringExpenses: data.recurringExpenses || [],
              alerts: data.alerts || []
            })
          ),
          catchError((err) =>
            of(
              SpendingActions.loadSpendingDashboardFailure({
                error: err?.message || 'Unable to load spending data. Please try again later.'
              })
            )
          )
        )
      )
    )
  );

  addExpense$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SpendingActions.addExpense),
      mergeMap(({ expense }) => {
        const newExpense = buildExpenseEntity(expense);

        return this.apiService.createExpense(newExpense).pipe(
          map((created) => SpendingActions.addExpenseSuccess({ expense: created || newExpense })),
          catchError((err) =>
            of(SpendingActions.addExpenseFailure({
              error: err?.message || 'Unable to save the expense. Please try again.'
            }))
          )
        );
      })
    )
  );

  updateExpense$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SpendingActions.updateExpense),
      mergeMap(({ id, expense }) =>
        this.apiService.updateExpense(id, expense).pipe(
          map((updated) => SpendingActions.updateExpenseSuccess({ expense: updated })),
          catchError((err) =>
            of(SpendingActions.updateExpenseFailure({
              error: err?.message || 'Unable to update the expense. Please try again.'
            }))
          )
        )
      )
    )
  );

  deleteExpense$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SpendingActions.deleteExpense),
      mergeMap(({ id }) =>
        this.apiService.deleteExpense(id).pipe(
          map(() => SpendingActions.deleteExpenseSuccess({ id })),
          catchError((err) =>
            of(SpendingActions.deleteExpenseFailure({
              error: err?.message || 'Unable to delete the expense. Please try again.'
            }))
          )
        )
      )
    )
  );

  addTag$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SpendingActions.addTag),
      mergeMap(({ tag }) =>
        this.apiService.createTag(tag).pipe(
          map((saved) => SpendingActions.addTagSuccess({ tag: saved || tag })),
          catchError((err) => of(SpendingActions.spendingOperationFailure({
            error: err?.message || 'Unable to create the tag. Please try again.'
          })))
        )
      )
    )
  );

  deleteTag$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SpendingActions.deleteTag),
      mergeMap(({ id }) =>
        this.apiService.deleteTag(id).pipe(
          map(() => SpendingActions.deleteTagSuccess({ id })),
          catchError((err) => of(SpendingActions.spendingOperationFailure({
            error: err?.message || 'Unable to delete the tag. Please try again.'
          })))
        )
      )
    )
  );

  addRecurringExpense$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SpendingActions.addRecurringExpense),
      mergeMap(({ item }) => {
        const newItem = {
          ...item,
          id: `rec-${Date.now()}`
        };
        return this.apiService.createRecurringExpense(newItem).pipe(
          map((saved) => SpendingActions.addRecurringExpenseSuccess({ item: saved })),
          catchError((err) => of(SpendingActions.spendingOperationFailure({
            error: err?.message || 'Unable to add the recurring expense. Please try again.'
          })))
        );
      })
    )
  );

  toggleRecurringExpense$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SpendingActions.toggleRecurringExpense),
      mergeMap(({ id, isActive }) =>
        this.apiService.updateRecurringExpense(id, { isActive }).pipe(
          map((saved) => SpendingActions.toggleRecurringExpenseSuccess({ item: saved })),
          catchError((err) =>
            of(SpendingActions.spendingOperationFailure({
              error: err?.message || 'Unable to update the recurring expense. Please try again.'
            }))
          )
        )
      )
    )
  );

  deleteRecurringExpense$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SpendingActions.deleteRecurringExpense),
      mergeMap(({ id }) =>
        this.apiService.deleteRecurringExpense(id).pipe(
          map(() => SpendingActions.deleteRecurringExpenseSuccess({ id })),
          catchError((err) => of(SpendingActions.spendingOperationFailure({
            error: err?.message || 'Unable to delete the recurring expense. Please try again.'
          })))
        )
      )
    )
  );
}
