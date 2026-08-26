import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, map, of, switchMap, withLatestFrom } from 'rxjs';
import { DashboardApiService } from '../services/dashboard-api.service';
import * as DashboardActions from './dashboard.actions';
import { selectActiveFilters } from './dashboard.selectors';

@Injectable()
export class DashboardEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly dashboardApiService = inject(DashboardApiService);
  // Effect to load full dashboard data from API with active filters
  loadDashboard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.loadDashboard),
      withLatestFrom(this.store.select(selectActiveFilters)),
      switchMap(([action, activeFilters]) => {
        const mergedFilters = { ...(activeFilters || {}), ...(action.filters || {}) };
        return this.dashboardApiService.getDashboard(mergedFilters).pipe(
          map((data) => DashboardActions.loadDashboardSuccess({ data })),
          catchError((error: { message?: string }) =>
            of(
              DashboardActions.loadDashboardFailure({
                error: error?.message ?? 'Dashboard request failed',
              }),
            ),
          ),
        );
      }),
    ),
  );
  // Effect to reload dashboard whenever setDashboardFilters is dispatched
  setDashboardFilters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.setDashboardFilters),
      map(({ filters }) => DashboardActions.loadDashboard({ filters })),
    ),
  );
  // Effect to save updated widget configuration to API
  saveDashboardWidgetConfig$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.saveDashboardWidgetConfig),
      switchMap(({ widgetConfig }) =>
        this.dashboardApiService.updateWidgetConfig(widgetConfig).pipe(
          map((savedWidgetConfig) =>
            DashboardActions.saveDashboardWidgetConfigSuccess({
              widgetConfig: savedWidgetConfig,
            }),
          ),
          catchError((error: { message?: string }) =>
            of(
              DashboardActions.saveDashboardWidgetConfigFailure({
                error: error?.message ?? 'Failed to save dashboard widget configuration',
              }),
            ),
          ),
        ),
      ),
    ),
  );
  // Effect to persist new upcoming bill item via API
  addUpcomingBill$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.addUpcomingBill),
      switchMap(({ item }) =>
        this.dashboardApiService.addUpcomingBill(item).pipe(
          map((savedItem) => DashboardActions.addUpcomingBillSuccess({ item: savedItem })),
          catchError((error: { message?: string }) =>
            of(
              DashboardActions.addUpcomingBillFailure({
                error: error?.message ?? 'Failed to add upcoming bill',
              }),
            ),
          ),
        ),
      ),
    ),
  );
  // Effect to persist updated upcoming bill item via API
  updateUpcomingBill$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.updateUpcomingBill),
      switchMap(({ item }) =>
        this.dashboardApiService.updateUpcomingBill(item).pipe(
          map((updatedItem) => DashboardActions.updateUpcomingBillSuccess({ item: updatedItem })),
          catchError((error: { message?: string }) =>
            of(
              DashboardActions.updateUpcomingBillFailure({
                error: error?.message ?? 'Failed to update upcoming bill',
              }),
            ),
          ),
        ),
      ),
    ),
  );
  // Effect to persist deletion of upcoming bill item via API
  deleteUpcomingBill$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.deleteUpcomingBill),
      switchMap(({ id }) =>
        this.dashboardApiService.deleteUpcomingBill(id).pipe(
          map((deletedId) => DashboardActions.deleteUpcomingBillSuccess({ id: deletedId })),
          catchError((error: { message?: string }) =>
            of(
              DashboardActions.deleteUpcomingBillFailure({
                error: error?.message ?? 'Failed to delete upcoming bill',
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
