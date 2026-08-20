import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthTokenService } from '../auth/services/auth-token.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = inject(AuthTokenService).get();
  if (!token || request.url.includes('/auth/login') || request.url.includes('/auth/register')) {
    return next(request);
  }

  return next(request.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  }));
};
