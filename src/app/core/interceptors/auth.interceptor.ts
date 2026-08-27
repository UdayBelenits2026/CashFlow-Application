import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenService } from '../auth/services/token.service';
import { SessionService } from '../auth/services/session.service';
import { TokenRefreshService } from '../auth/services/token-refresh.service';
import { AUTH_MESSAGES } from '../auth/constants/auth.constants';
import * as AuthActions from '../auth/store/actions/auth.actions';

export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);
// Marks a request already retried after a refresh, preventing infinite loops.
const REFRESH_RETRIED = new HttpContextToken<boolean>(() => false);

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const tokenService = inject(TokenService);
  const sessionService = inject(SessionService);
  const tokenRefresh = inject(TokenRefreshService);
  const store = inject(Store);

  const skipAuth = request.context.get(SKIP_AUTH);
  const isApiRequest =
    request.url.startsWith(environment.apiBaseUrl) ||
    request.url.startsWith(environment.transactionsApiBaseUrl) ||
    request.url.startsWith(environment.accountsApiBaseUrl);

  let authRequest = request;
  if (!skipAuth && isApiRequest) {
    const setHeaders: Record<string, string> = {};

    const authHeader = tokenService.getAuthorizationHeader();
    if (authHeader && !request.headers.has('Authorization')) {
      setHeaders['Authorization'] = authHeader;
    }

    // Numeric backend user id (from the JWT) required by authenticated endpoints.
    const userId = tokenService.getUserId();
    if (userId !== null && !request.headers.has('userId')) {
      setHeaders['userId'] = String(userId);
    }

    // Correlation id captured from the login response envelope.
    const correlationId = sessionService.getCorrelationId();
    if (correlationId && !request.headers.has('correlationId')) {
      setHeaders['correlationId'] = correlationId;
    }

    if (Object.keys(setHeaders).length > 0) {
      authRequest = request.clone({ setHeaders });
    }
  }

  return next(authRequest).pipe(
    catchError((error: unknown) => {
      const httpError = error as HttpErrorResponse;
      const canHandle =
        httpError.status === 401 &&
        isApiRequest &&
        !skipAuth &&
        sessionService.isAuthenticated();

      // Try a one-time refresh + retry before ending the session.
      if (canHandle && tokenService.hasRefreshToken() && !request.context.get(REFRESH_RETRIED)) {
        return tokenRefresh.refreshAccessToken().pipe(
          switchMap((newToken) =>
            next(
              request.clone({
                setHeaders: { Authorization: `${tokenService.getTokenType()} ${newToken}` },
                context: request.context.set(REFRESH_RETRIED, true),
              }),
            ),
          ),
          catchError((refreshError: unknown) => {
            store.dispatch(AuthActions.sessionExpired({ message: AUTH_MESSAGES.unauthorized }));
            return throwError(() => refreshError);
          }),
        );
      }

      // Refresh not possible: a 401 on a protected request ends the session.
      if (canHandle) {
        const backendMessage = (httpError.error as { message?: string } | null)?.message;
        store.dispatch(
          AuthActions.sessionExpired({ message: backendMessage || AUTH_MESSAGES.unauthorized }),
        );
      }

      // 403 means authenticated but unauthorized; session should remain intact.
      return throwError(() => error);
    }),
  );
};
