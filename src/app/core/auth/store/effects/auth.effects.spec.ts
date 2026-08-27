import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { ROOT_EFFECTS_INIT } from '@ngrx/effects';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthEffects } from './auth.effects';
import { AuthApiService } from '../../services/auth-api.service';
import { TokenService } from '../../services/token.service';
import { SessionService } from '../../services/session.service';
import { TokenRefreshService } from '../../services/token-refresh.service';
import * as AuthActions from '../actions/auth.actions';
import { AuthUser, ResetPasswordRequest, ResetPasswordResponse } from '../../models/auth.models';

describe('AuthEffects', () => {
  let actions$: Observable<Action>;
  let effects: AuthEffects;
  let authApi: jasmine.SpyObj<AuthApiService>;
  let tokenService: jasmine.SpyObj<TokenService>;
  let sessionService: jasmine.SpyObj<SessionService>;

  const user: AuthUser = {
    userId: 4,
    publicId: 'id-1',
    fullName: 'Test User',
    email: 'user@example.com',
    accountStatus: 'ACTIVE',
    role: 'USER',
    permissions: ['DASHBOARD_VIEW'],
    sessionId: 'sess-1',
    correlationId: 'corr-1',
  };

  const request: ResetPasswordRequest = {
    email: 'user@example.com',
    newPassword: 'Password@123',
    confirmPassword: 'Password@123',
  };

  const successResponse: ResetPasswordResponse = {
    success: true,
    code: 'OK',
    message: 'Password reset successfully.',
    data: { publicId: 'pub-1', email: 'user@example.com' },
    correlationId: 'corr-1',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthEffects,
        provideMockActions(() => actions$),
        {
          provide: AuthApiService,
          useValue: jasmine.createSpyObj<AuthApiService>('AuthApiService', [
            'login',
            'register',
            'logout',
            'resetPassword',
            'refreshToken',
          ]),
        },
        {
          provide: TokenService,
          useValue: jasmine.createSpyObj<TokenService>('TokenService', [
            'getAccessToken',
            'getTokenType',
            'setTokens',
            'setAccessToken',
            'clearAccessToken',
          ]),
        },
        {
          provide: SessionService,
          useValue: jasmine.createSpyObj<SessionService>('SessionService', [
            'getSession',
            'getUser',
            'setSession',
            'clearSession',
            'getCorrelationId',
          ]),
        },
        {
          provide: TokenRefreshService,
          useValue: jasmine.createSpyObj<TokenRefreshService>('TokenRefreshService', [
            'refreshAccessToken',
          ]),
        },
        {
          provide: Router,
          useValue: jasmine.createSpyObj<Router>('Router', ['navigate']),
        },
      ],
    });

    actions$ = of({ type: '[Test] Init' });
    effects = TestBed.inject(AuthEffects);
    authApi = TestBed.inject(AuthApiService) as jasmine.SpyObj<AuthApiService>;
    tokenService = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
    sessionService = TestBed.inject(SessionService) as jasmine.SpyObj<SessionService>;
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  it('should restore the session on init when a token and session exist (browser reload)', (done) => {
    tokenService.getAccessToken.and.returnValue('access-token');
    sessionService.getUser.and.returnValue(user);
    actions$ = of({ type: ROOT_EFFECTS_INIT } as Action);

    effects.restoreSession$.subscribe((result) => {
      expect(result.type).toBe('[Auth] Restore Session');
      done();
    });
  });

  it('should restore the session on reload even when expiry is unknown', (done) => {
    tokenService.getAccessToken.and.returnValue('access-token');
    sessionService.getUser.and.returnValue(user);
    actions$ = of({ type: ROOT_EFFECTS_INIT } as Action);

    effects.restoreSession$.subscribe((result) => {
      expect(result.type).toBe('[Auth] Restore Session');
      done();
    });
  });

  it('should not restore when no access token is stored', () => {
    tokenService.getAccessToken.and.returnValue(null);
    sessionService.getUser.and.returnValue(user);
    actions$ = of({ type: ROOT_EFFECTS_INIT } as Action);

    let emitted = false;
    effects.restoreSession$.subscribe(() => (emitted = true));
    expect(emitted).toBeFalse();
  });

  it('should dispatch resetPasswordSuccess when the API succeeds', (done) => {
    authApi.resetPassword.and.returnValue(of(successResponse));
    actions$ = of(AuthActions.resetPassword({ request }));

    effects.resetPassword$.subscribe((result) => {
      expect(result).toEqual(
        AuthActions.resetPasswordSuccess({
          message: 'Password reset successfully.',
          data: successResponse.data,
        }),
      );
      done();
    });
  });

  it('should dispatch resetPasswordFailure and preserve message when success is false', (done) => {
    authApi.resetPassword.and.returnValue(
      of({
        success: false,
        code: 'INVALID_EMAIL',
        message: 'Email address is not registered.',
        data: null as never,
        correlationId: 'corr-2',
      }),
    );
    actions$ = of(AuthActions.resetPassword({ request }));

    effects.resetPassword$.subscribe((result) => {
      expect(result).toEqual(
        AuthActions.resetPasswordFailure({
          error: { code: 'INVALID_EMAIL', message: 'Email address is not registered.' },
        }),
      );
      done();
    });
  });

  it('should preserve the backend message on an HTTP error', (done) => {
    authApi.resetPassword.and.returnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: { code: 'INVALID_EMAIL', message: 'Email address is not registered.' },
          }),
      ),
    );
    actions$ = of(AuthActions.resetPassword({ request }));

    effects.resetPassword$.subscribe((result) => {
      expect(result).toEqual(
        AuthActions.resetPasswordFailure({
          error: {
            code: 'INVALID_EMAIL',
            message: 'Email address is not registered.',
            correlationId: undefined,
          },
        }),
      );
      done();
    });
  });

  it('should use a fallback message on a network error without a backend message', (done) => {
    authApi.resetPassword.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 0, error: null })),
    );
    actions$ = of(AuthActions.resetPassword({ request }));

    effects.resetPassword$.subscribe((result) => {
      const failure = result as ReturnType<typeof AuthActions.resetPasswordFailure>;
      expect(failure.type).toBe('[Auth] Reset Password Failure');
      expect(failure.error.message).toBe('Unable to reset your password right now. Please try again.');
      done();
    });
  });
});
