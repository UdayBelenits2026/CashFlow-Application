import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/** Attaches the dev X-User-Id header to spending API calls; never runs in production. */
export const spendingDevUserInterceptor: HttpInterceptorFn = (request, next) => {
  const userId = environment.spendingDevUserId;
  if (environment.production || !userId || !request.url.startsWith(environment.spendingApiBaseUrl)) {
    return next(request);
  }

  return next(request.clone({
    setHeaders: { 'X-User-Id': userId },
  }));
};
