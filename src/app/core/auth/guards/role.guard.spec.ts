import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { roleGuard } from './role.guard';
import { SessionService } from '../services/session.service';

describe('roleGuard', () => {
  let sessionSpy: jasmine.SpyObj<SessionService>;

  const run = (data: Record<string, unknown> = {}) =>
    TestBed.runInInjectionContext(() =>
      roleGuard(
        { data } as unknown as ActivatedRouteSnapshot,
        { url: '/admin' } as never,
      ),
    );

  beforeEach(() => {
    sessionSpy = jasmine.createSpyObj<SessionService>('SessionService', [
      'isAuthenticated',
      'hasAnyRole',
    ]);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: SessionService, useValue: sessionSpy },
      ],
    });
  });

  it('redirects unauthenticated users to the landing page', () => {
    sessionSpy.isAuthenticated.and.returnValue(false);

    const result = run({ roles: ['ADMIN'] });

    expect(result instanceof UrlTree).toBeTrue();
    expect((result as UrlTree).toString()).toBe('/');
    expect(sessionSpy.hasAnyRole).not.toHaveBeenCalled();
  });

  it('allows activation when the route requires no roles', () => {
    sessionSpy.isAuthenticated.and.returnValue(true);

    expect(run({})).toBeTrue();
    expect(sessionSpy.hasAnyRole).not.toHaveBeenCalled();
  });

  it('allows activation when route data is missing entirely', () => {
    sessionSpy.isAuthenticated.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      roleGuard(
        {} as unknown as ActivatedRouteSnapshot,
        { url: '/admin' } as never,
      ),
    );

    expect(result).toBeTrue();
  });

  it('allows activation when the user has one of the required roles', () => {
    sessionSpy.isAuthenticated.and.returnValue(true);
    sessionSpy.hasAnyRole.and.returnValue(true);

    expect(run({ roles: ['ADMIN', 'MANAGER'] })).toBeTrue();
    expect(sessionSpy.hasAnyRole).toHaveBeenCalledWith(['ADMIN', 'MANAGER']);
  });

  it('redirects to the dashboard when the user lacks the required roles', () => {
    sessionSpy.isAuthenticated.and.returnValue(true);
    sessionSpy.hasAnyRole.and.returnValue(false);

    const result = run({ roles: ['ADMIN'] });

    expect(result instanceof UrlTree).toBeTrue();
    expect((result as UrlTree).toString()).toBe('/dashboard');
  });
});
