import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthTokenService } from '../services/auth-token.service';
import { RoleGuardData } from '../models/auth.models';


export const roleGuard: CanActivateFn = (route): boolean | UrlTree => {
  const authTokenService = inject(AuthTokenService);
  const router = inject(Router);

  if (!authTokenService.isAuthenticated()) {
    return router.createUrlTree(['/']);
  }

  const { roles = [] } = (route.data ?? {}) as RoleGuardData;
  if (!roles.length || authTokenService.hasAnyRole(roles)) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
