import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, tap } from 'rxjs';
import * as AuthActions from './auth.actions';
import { AuthApiService } from '../services/auth-api.service';
import { AuthError, LoginResponse, RegisterResponse } from '../models/auth.models';
import { AuthTokenService } from '../services/auth-token.service';

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly authApi = inject(AuthApiService);
  private readonly tokenService = inject(AuthTokenService);
  private readonly router = inject(Router);

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
          this.tokenService.set(data.accessToken);
          void this.router.navigate(['/dashboard']);
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
  private normalize(error: unknown): AuthError {
    const response = error as { error?: AuthError; message?: string };
    const backendError = response?.error;
    return backendError?.message
      ? backendError
      : { code: backendError?.code ?? 'UNKNOWN', message: 'Something went wrong. Please try again.' };
  }
}
