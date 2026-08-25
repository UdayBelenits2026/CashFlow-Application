import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ROOT_EFFECTS_INIT } from '@ngrx/effects';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  EMPTY,
  catchError,
  exhaustMap,
  filter,
  fromEvent,
  map,
  merge,
  mergeMap,
  of,
  startWith,
  switchMap,
  takeUntil,
  tap,
  throttleTime,
  timer,
} from 'rxjs';
import * as AuthActions from '../actions/auth.actions';
import { AuthApiService } from '../../services/auth-api.service';
import {
  AccountLockData,
  AccountLockedResponse,
  AuthError,
  AuthUser,
  LoginData,
  LoginResponse,
  RegisterResponse,
  ResetPasswordResponse,
} from '../../models/auth.models';
import {
  AUTH_MESSAGES,
  INACTIVITY_TIMEOUT_MS,
} from '../../constants/auth.constants';
import { TokenService } from '../../services/token.service';
import { SessionService } from '../../services/session.service';
import { TokenRefreshService } from '../../services/token-refresh.service';

@Injectable()
export class AuthEffects {
  // Fallback user when a token is restored but no user profile was persisted.
  private static readonly EMPTY_USER: AuthUser = {
    publicId: '',
    fullName: '',
    email: '',
    accountStatus: '',
    roles: [],
    permissions: [],
  };

  private readonly actions$ = inject(Actions);
  private readonly authApi = inject(AuthApiService);
  private readonly tokenService = inject(TokenService);
  private readonly sessionService = inject(SessionService);
  private readonly tokenRefresh = inject(TokenRefreshService);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  // Rehydrate NgRx state from the persisted token + session on app start.
  restoreSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROOT_EFFECTS_INIT),
      map(() => this.readPersistedSession()),
      filter((data): data is LoginData => Boolean(data)),
      map((data) => AuthActions.restoreSession({ data })),
    ),
  );

  // One sign-in effect: authenticate, persist token + session, navigate, then
  // update auth state. No separate navigation effect.
  signIn$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      exhaustMap(({ request }) =>
        this.authApi.login(request).pipe(
          map((response: LoginResponse) => {
            // Tolerate the standard envelope and a flat token payload.
            const data = response?.data ?? (response as unknown as LoginData);
            const succeeded = response?.success ?? Boolean(data?.accessToken);
            if (!succeeded || !data?.accessToken) {
              return AuthActions.loginFailure({
                error: {
                  code: response?.code ?? 'UNKNOWN',
                  message: response?.message || 'Unable to sign in. Please try again.',
                },
              });
            }
            this.tokenService.setTokens({
              accessToken: data.accessToken,
              tokenType: data.tokenType,
              refreshToken: data.refreshToken,
            });
            this.sessionService.setSession(data);
            void this.router.navigate(['/dashboard']);
            return AuthActions.loginSuccess({ data });
          }),
          catchError((error: unknown) => {
            const lock = this.extractAccountLock(error);
            return of(
              lock
                ? AuthActions.loginLocked({ lock })
                : AuthActions.loginFailure({ error: this.normalize(error) }),
            );
          }),
        ),
      ),
    ),
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

  resetPassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.resetPassword),
      switchMap(({ request }) =>
        this.authApi.resetPassword(request).pipe(
          map((response: ResetPasswordResponse) =>
            response.success
              ? AuthActions.resetPasswordSuccess({
                  message: response.message || 'Password reset successfully.',
                  data: response.data,
                })
              : AuthActions.resetPasswordFailure({
                  error: {
                    code: response.code ?? 'UNKNOWN',
                    message: response.message || 'Unable to reset your password right now. Please try again.',
                  },
                }),
          ),
          catchError((error: unknown) =>
            of(AuthActions.resetPasswordFailure({ error: this.normalizeReset(error) })),
          ),
        ),
      ),
    ),
  );

  // Immediate logout: clear token + session and navigate right away so the UI
  // never waits on the network. Also handles forced session end.
  clearSession$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout, AuthActions.sessionExpired),
        tap(() => {
          this.tokenService.clearAccessToken();
          this.sessionService.clearSession();
          void this.router.navigate(['/']);
        }),
      ),
    { dispatch: false },
  );

  // Best-effort backend logout; failures are ignored and never block the user.
  notifyBackendLogout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        mergeMap(() => this.authApi.logout().pipe(catchError(() => EMPTY))),
      ),
    { dispatch: false },
  );

  // Proactively refresh the access token shortly before it expires, and again
  // after each successful refresh. Falls back to session end on failure.
  proactiveRefresh$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess, AuthActions.restoreSession, AuthActions.sessionRenewed),
      switchMap((action) => {
        const expiresIn = 'data' in action ? action.data.expiresIn : action.expiresIn;
        // Without a known expiry we can't schedule; rely on the 401 refresh path.
        if (!Number.isFinite(expiresIn) || expiresIn <= 0) {
          return EMPTY;
        }
        const delayMs = Math.max(0, (expiresIn - 60) * 1000);
        return timer(delayMs).pipe(
          switchMap(() => this.tokenRefresh.refreshAccessToken()),
          map(() =>
            AuthActions.sessionRenewed({ expiresIn: this.sessionService.getTtlSeconds() || expiresIn }),
          ),
          catchError(() =>
            of(AuthActions.sessionExpired({ message: AUTH_MESSAGES.unauthorized })),
          ),
          takeUntil(this.actions$.pipe(ofType(AuthActions.logout, AuthActions.sessionExpired))),
        );
      }),
    ),
  );

  // Inactivity monitoring: one timer per authenticated session. User interaction
  // resets it; only DOM events (not background HTTP) count as activity.
  inactivity$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess, AuthActions.restoreSession),
      switchMap(() =>
        merge(
          fromEvent(this.document, 'click'),
          fromEvent(this.document, 'keydown'),
          fromEvent(this.document, 'mousemove'),
          fromEvent(this.document, 'scroll'),
          fromEvent(this.document, 'touchstart'),
        ).pipe(
          throttleTime(1000),
          startWith(null),
          switchMap(() => timer(INACTIVITY_TIMEOUT_MS)),
          map(() => AuthActions.sessionExpired({ message: AUTH_MESSAGES.inactivity })),
          takeUntil(
            this.actions$.pipe(ofType(AuthActions.logout, AuthActions.sessionExpired)),
          ),
        ),
      ),
    ),
  );

  private readPersistedSession(): LoginData | null {
    const accessToken = this.tokenService.getAccessToken();
    // The token is the credential; a reload stays authenticated as long as it exists.
    if (!accessToken) {
      return null;
    }
    const session = this.sessionService.getSession();
    const expiresIn = session?.expiresAt
      ? Math.max(1, Math.floor((session.expiresAt - Date.now()) / 1000))
      : 0;
    return {
      accessToken,
      tokenType: this.tokenService.getTokenType(),
      expiresIn,
      user: session?.user ?? AuthEffects.EMPTY_USER,
    };
  }

  // Extracts backend account-lock data from an HTTP 423 ACCOUNT_LOCKED response.
  private extractAccountLock(error: unknown): AccountLockData | null {
    const httpError = error as HttpErrorResponse;
    if (httpError?.status !== 423) {
      return null;
    }
    const body = httpError.error as AccountLockedResponse | undefined;
    if (body?.code !== 'ACCOUNT_LOCKED' || !body.data) {
      return null;
    }
    return body.data;
  }

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

  private normalizeReset(error: unknown): AuthError {
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
        message: 'Unable to reset your password right now. Please try again.',
        correlationId: backendError?.correlationId,
      };
  }
}
