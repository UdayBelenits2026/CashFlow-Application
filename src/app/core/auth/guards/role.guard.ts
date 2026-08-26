import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { SessionService } from '../services/session.service';
import { RoleGuardData } from '../models/auth.models';


export const roleGuard: CanActivateFn = (route): boolean | UrlTree => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  if (!sessionService.isAuthenticated()) {
    return router.createUrlTree(['/']);
  }

  const { roles = [] } = (route.data ?? {}) as RoleGuardData;
  if (!roles.length || sessionService.hasAnyRole(roles)) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
