import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthTokenService } from '../auth/services/auth-token.service';
import * as AuthActions from '../auth/store/actions/auth.actions';

export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const tokenService = inject(AuthTokenService);
  const store = inject(Store);

  const skipAuth = request.context.get(SKIP_AUTH);
  const isApiRequest = request.url.startsWith(environment.apiBaseUrl);

  const authHeader = !skipAuth && isApiRequest
    ? tokenService.getAuthorizationHeader()
    : null;

  const authRequest = authHeader
    ? request.clone({ setHeaders: { Authorization: authHeader } })
    : request;

  return next(authRequest).pipe(
    catchError((error: unknown) => {
      const httpError = error as HttpErrorResponse;

      if (httpError.status === 401 && isApiRequest && !skipAuth) {
        store.dispatch(AuthActions.logout());
      }

      // 403 means authenticated but unauthorized; session should remain intact.
      return throwError(() => error);
    }),
  );
};
