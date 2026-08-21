import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ROOT_EFFECTS_INIT } from '@ngrx/effects';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, filter, map, of, tap } from 'rxjs';
import * as AuthActions from '../actions/auth.actions';
import { AuthApiService } from '../../services/auth-api.service';
import { AuthError, LoginData, LoginResponse, RegisterResponse } from '../../models/auth.models';
import { AuthTokenService } from '../../services/auth-token.service';

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly authApi = inject(AuthApiService);
  private readonly tokenService = inject(AuthTokenService);
  private readonly router = inject(Router);

  restoreSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROOT_EFFECTS_INIT),
      map(() => this.tokenService.hydrateSession()),
      filter((session): session is LoginData => Boolean(session)),
      map((session) => AuthActions.restoreSession({ data: session })),
    ),
  );

  signIn$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      exhaustMap(({ request }) =>
        this.authApi.login(request).pipe(
          map((response: LoginResponse) => AuthActions.loginSuccess({ data: response.data })),
          catchError((error: AuthError) =>
            of(AuthActions.loginFailure({ error: this.normalize(error) })),
          ),
        ),
      ),
    ),
  );
  navigateAfterSignIn$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ data }) => {
          this.tokenService.setSession(data);
          this.router.navigate(['/dashboard']);
        }),
      ),
    { dispatch: false },
  );
  signUp$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      exhaustMap(({ request }) =>
        this.authApi.register(request).pipe(
          map((response: RegisterResponse) => AuthActions.registerSuccess({ response })),
          catchError((error: AuthError) =>
            of(AuthActions.registerFailure({ error: this.normalize(error) })),
          ),
        ),
      ),
    ),
  );
  navigateAfterRegister$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.registerSuccess),
        tap(() => void this.router.navigate(['/'])),
      ),
    { dispatch: false },
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          this.tokenService.clear();
          this.router.navigate(['/']);
        }),
      ),
    { dispatch: false },
  );

  private normalize(error: unknown): AuthError {
    const httpError = error as HttpErrorResponse;
    const backendError = httpError?.error as Partial<AuthError> | undefined;

    return backendError?.message
      ? {
        code: backendError.code ?? 'UNKNOWN',
        message: backendError.message,
        correlationId: backendError.correlationId,
      }
      : {
        code: backendError?.code ?? 'UNKNOWN',
        message: 'Something went wrong. Please try again.',
        correlationId: backendError?.correlationId,
      };
  }
}
