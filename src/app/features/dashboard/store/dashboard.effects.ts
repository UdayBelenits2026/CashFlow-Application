import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { DashboardApiService } from '../data/dashboard-api.service';
import * as DashboardActions from './dashboard.actions';

@Injectable()
export class DashboardEffects {
  private readonly actions$ = inject(Actions);
  private readonly dashboardApiService = inject(DashboardApiService);

  loadDashboard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.loadDashboard),
      switchMap(() =>
        this.dashboardApiService.getDashboard().pipe(
          map((data) => DashboardActions.loadDashboardSuccess({ data })),
          catchError((error: { message?: string }) =>
            of(
              DashboardActions.loadDashboardFailure({
                error: error?.message ?? 'Dashboard request failed',
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
