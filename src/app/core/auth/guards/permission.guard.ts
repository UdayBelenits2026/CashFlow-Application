import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthTokenService } from '../services/auth-token.service';

interface PermissionGuardData {
  permissions?: string[];
}

export const permissionGuard: CanActivateFn = (route): boolean | UrlTree => {
  const authTokenService = inject(AuthTokenService);
  const router = inject(Router);

  if (!authTokenService.isAuthenticated()) {
    return router.createUrlTree(['/']);
  }

  const { permissions = [] } = (route.data ?? {}) as PermissionGuardData;
  if (!permissions.length || authTokenService.hasAnyPermission(permissions)) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
