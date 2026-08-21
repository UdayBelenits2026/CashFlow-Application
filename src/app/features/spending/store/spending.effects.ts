import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, mergeMap } from 'rxjs/operators';
import { SpendingApiService } from '../Services/spending-api.service';
import * as SpendingActions from './spending.actions';
import { Expense } from '../models/expense.model';

@Injectable()
export class SpendingEffects {
  private readonly actions$ = inject(Actions);
  private readonly apiService = inject(SpendingApiService);

  loadSpendingDashboard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SpendingActions.loadSpendingDashboard),
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
                error: err?.message || 'Unable to connect to mock backend. Please verify that JSON Server is running.'
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
        const newExpense: Expense = {
          id: `exp-${Date.now()}`,
          amount: Number(expense.amount) || 0,
          date: expense.date || new Date().toISOString().split('T')[0],
          merchantName: expense.merchantName || 'Unknown Merchant',
          categoryId: expense.categoryId || 'cat-1',
          categoryName: expense.categoryName || 'Food & Dining',
          categoryColor: expense.categoryColor || '#0F172A',
          accountId: expense.accountId || 'acc-1',
          accountName: expense.accountName || 'Main Checking',
          paymentMethod: expense.paymentMethod || 'DEBIT_CARD',
          tags: expense.tags || [],
          notes: expense.notes || '',
          receiptUrl: expense.receiptUrl,
          receiptFileName: expense.receiptFileName,
          status: expense.status || 'CLEARED',
          createdAt: new Date().toISOString()
        };

        return this.apiService.createExpense(newExpense).pipe(
          map((created) => SpendingActions.addExpenseSuccess({ expense: created || newExpense })),
          catchError(() => {
            // Optimistic fallback in case mock server offline
            return of(SpendingActions.addExpenseSuccess({ expense: newExpense }));
          })
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
          catchError(() => {
            // Optimistic fallback
            return of(SpendingActions.updateExpenseSuccess({ expense: { ...expense, id } as Expense }));
          })
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
          catchError(() => {
            // Optimistic fallback
            return of(SpendingActions.deleteExpenseSuccess({ id }));
          })
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
          catchError(() => of(SpendingActions.addTagSuccess({ tag })))
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
          catchError(() => of(SpendingActions.deleteTagSuccess({ id })))
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
          map((saved) => SpendingActions.addRecurringExpenseSuccess({ item: saved || (newItem as any) })),
          catchError(() => of(SpendingActions.addRecurringExpenseSuccess({ item: newItem as any })))
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
          catchError(() =>
            of(SpendingActions.toggleRecurringExpenseSuccess({ item: { id, isActive } as any }))
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
          catchError(() => of(SpendingActions.deleteRecurringExpenseSuccess({ id })))
        )
      )
    )
  );
}
