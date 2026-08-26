import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { SessionService } from '../services/session.service';

interface PermissionGuardData {
  permissions?: string[];
}

export const permissionGuard: CanActivateFn = (route): boolean | UrlTree => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  if (!sessionService.isAuthenticated()) {
    return router.createUrlTree(['/']);
  }

  const { permissions = [] } = (route.data ?? {}) as PermissionGuardData;
  if (!permissions.length || sessionService.hasAnyPermission(permissions)) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
