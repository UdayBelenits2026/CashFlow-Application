import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { TokenService } from '../services/token.service';

export const authGuard: CanActivateFn = (_route, state): boolean | UrlTree => {
  const tokenService = inject(TokenService);
  const router = inject(Router);
  if (tokenService.hasAccessToken()) {
    return true;
  }

  return router.createUrlTree(['/'], {
    queryParams: {
      redirectUrl: state.url,
    },
  });
};
