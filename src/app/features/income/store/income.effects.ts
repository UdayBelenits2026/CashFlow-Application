import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as IncomeActions from './income.actions';
import { IncomeApiService } from '../services/income-api.service';
import { selectRecurringIncomes } from './income.selectors';
import { calculateNextRecurringDate } from '../utility/income.calculations';
import { Income } from '../models/income.model';
import { RecurringIncome } from '../models/recurring-income.model';

@Injectable()
export class IncomeEffects {
  private readonly actions$ = inject(Actions);
  private readonly incomeApi = inject(IncomeApiService);
  private readonly store = inject(Store);

  // --- Load Dashboard ---
  loadDashboard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IncomeActions.loadIncomeDashboard),
      switchMap(() =>
        this.incomeApi.getDashboardData().pipe(
          map((data) => IncomeActions.loadIncomeDashboardSuccess(data)),
          catchError((error) =>
            of(
              IncomeActions.loadIncomeDashboardFailure({
                error: error?.message || 'Failed to load income dashboard.'
              })
            )
          )
        )
      )
    )
  );

  // --- Incomes CRUD ---
  addIncome$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IncomeActions.addIncome),
      mergeMap(({ income }) => {
        const payload: Partial<Income> = {
          ...income,
          id: income.id || `inc-${Date.now()}`,
          status: 'RECORDED',
          createdAt: new Date().toISOString()
        };
        return this.incomeApi.createIncome(payload).pipe(
          map((saved) => IncomeActions.addIncomeSuccess({ income: saved })),
          catchError((error) =>
            of(
              IncomeActions.addIncomeFailure({
                error: error?.message || 'Failed to record income.'
              })
            )
          )
        );
      })
    )
  );

  updateIncome$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IncomeActions.updateIncome),
      mergeMap(({ id, income }) =>
        this.incomeApi.updateIncome(id, income).pipe(
          map((saved) => IncomeActions.updateIncomeSuccess({ income: saved })),
          catchError((error) =>
            of(
              IncomeActions.updateIncomeFailure({
                error: error?.message || 'Failed to update income.'
              })
            )
          )
        )
      )
    )
  );

  deleteIncome$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IncomeActions.deleteIncome),
      mergeMap(({ id }) =>
        this.incomeApi.deleteIncome(id).pipe(
          map(() => IncomeActions.deleteIncomeSuccess({ id })),
          catchError((error) =>
            of(
              IncomeActions.deleteIncomeFailure({
                error: error?.message || 'Failed to delete income transaction.'
              })
            )
          )
        )
      )
    )
  );

  // --- Sources CRUD ---
  addIncomeSource$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IncomeActions.addIncomeSource),
      mergeMap(({ source }) => {
        const payload = {
          ...source,
          id: source.id || `src-${Date.now()}`,
          status: source.status || 'ACTIVE',
          totalReceivedYtd: 0
        };
        return this.incomeApi.createSource(payload).pipe(
          map((saved) => IncomeActions.addIncomeSourceSuccess({ source: saved })),
          catchError((error) =>
            of(
              IncomeActions.incomeOperationFailure({
                error: error?.message || 'Failed to create income source.'
              })
            )
          )
        );
      })
    )
  );

  updateIncomeSource$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IncomeActions.updateIncomeSource),
      mergeMap(({ id, source }) =>
        this.incomeApi.updateSource(id, source).pipe(
          map((saved) => IncomeActions.updateIncomeSourceSuccess({ source: saved })),
          catchError((error) =>
            of(
              IncomeActions.incomeOperationFailure({
                error: error?.message || 'Failed to update income source.'
              })
            )
          )
        )
      )
    )
  );

  toggleIncomeSourceStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IncomeActions.toggleIncomeSourceStatus),
      mergeMap(({ id, status }) =>
        this.incomeApi.patchSourceStatus(id, status).pipe(
          map((saved) => IncomeActions.toggleIncomeSourceStatusSuccess({ source: saved })),
          catchError((error) =>
            of(
              IncomeActions.incomeOperationFailure({
                error: error?.message || 'Failed to update source status.'
              })
            )
          )
        )
      )
    )
  );

  deleteIncomeSource$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IncomeActions.deleteIncomeSource),
      mergeMap(({ id }) =>
        this.incomeApi.deleteSource(id).pipe(
          map(() => IncomeActions.deleteIncomeSourceSuccess({ id })),
          catchError((error) =>
            of(
              IncomeActions.incomeOperationFailure({
                error: error?.message || 'Failed to remove income source.'
              })
            )
          )
        )
      )
    )
  );

  // --- Recurring Schedules CRUD ---
  addRecurringIncome$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IncomeActions.addRecurringIncome),
      mergeMap(({ item }) => {
        const payload = {
          ...item,
          id: item.id || `rec-${Date.now()}`,
          status: item.status || 'ACTIVE'
        };
        return this.incomeApi.createRecurringIncome(payload).pipe(
          map((saved) => IncomeActions.addRecurringIncomeSuccess({ item: saved })),
          catchError((error) =>
            of(
              IncomeActions.incomeOperationFailure({
                error: error?.message || 'Failed to create recurring schedule.'
              })
            )
          )
        );
      })
    )
  );

  updateRecurringIncome$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IncomeActions.updateRecurringIncome),
      mergeMap(({ id, item }) =>
        this.incomeApi.updateRecurringIncome(id, item).pipe(
          map((saved) => IncomeActions.updateRecurringIncomeSuccess({ item: saved })),
          catchError((error) =>
            of(
              IncomeActions.incomeOperationFailure({
                error: error?.message || 'Failed to update recurring schedule.'
              })
            )
          )
        )
      )
    )
  );

  toggleRecurringIncomeStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IncomeActions.toggleRecurringIncomeStatus),
      mergeMap(({ id, status }) =>
        this.incomeApi.patchRecurringStatus(id, status).pipe(
          map((saved) => IncomeActions.toggleRecurringIncomeStatusSuccess({ item: saved })),
          catchError((error) =>
            of(
              IncomeActions.incomeOperationFailure({
                error: error?.message || 'Failed to update recurring status.'
              })
            )
          )
        )
      )
    )
  );

  deleteRecurringIncome$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IncomeActions.deleteRecurringIncome),
      mergeMap(({ id }) =>
        this.incomeApi.deleteRecurringIncome(id).pipe(
          map(() => IncomeActions.deleteRecurringIncomeSuccess({ id })),
          catchError((error) =>
            of(
              IncomeActions.incomeOperationFailure({
                error: error?.message || 'Failed to delete recurring schedule.'
              })
            )
          )
        )
      )
    )
  );

  // --- Record Recurring Income Occurrence ---
  recordRecurringIncome$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IncomeActions.recordRecurringIncome),
      withLatestFrom(this.store.select(selectRecurringIncomes)),
      mergeMap(([{ recurringId, date, notes }, recurringList]) => {
        const target = recurringList.find((r) => r.id === recurringId);
        if (!target) {
          return of(
            IncomeActions.incomeOperationFailure({
              error: 'Recurring schedule not found.'
            })
          );
        }

        const recordDate = date || target.nextIncomeDate || new Date().toISOString().split('T')[0];
        const newTransaction: Partial<Income> = {
          id: `inc-${Date.now()}`,
          accountId: target.accountId,
          accountName: target.accountName,
          incomeSourceId: target.incomeSourceId,
          sourceName: target.sourceName,
          sourceType: target.sourceType,
          sourceColor: target.sourceColor,
          amount: target.expectedAmount,
          date: recordDate,
          description: `${target.sourceName} (${target.frequency})`,
          notes: notes || `Recorded from recurring schedule (${target.id})`,
          taxable: true,
          isRecurring: true,
          status: 'RECORDED',
          createdAt: new Date().toISOString()
        };

        const nextDate = calculateNextRecurringDate(recordDate, target.frequency);
        const updatedRecurringPayload: RecurringIncome = {
          ...target,
          lastRecordedDate: recordDate,
          nextIncomeDate: nextDate
        };

        return this.incomeApi.createIncome(newTransaction).pipe(
          switchMap((savedIncome) =>
            this.incomeApi.updateRecurringIncome(target.id, updatedRecurringPayload).pipe(
              map((savedRecurring) =>
                IncomeActions.recordRecurringIncomeSuccess({
                  recordedIncome: savedIncome,
                  updatedRecurring: savedRecurring
                })
              )
            )
          ),
          catchError((error) =>
            of(
              IncomeActions.incomeOperationFailure({
                error: error?.message || 'Failed to record recurring income occurrence.'
              })
            )
          )
        );
      })
    )
  );
}
