import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { permissionGuard } from './permission.guard';
import { SessionService } from '../services/session.service';

describe('permissionGuard', () => {
  let sessionSpy: jasmine.SpyObj<SessionService>;

  const run = (data: Record<string, unknown> = {}) =>
    TestBed.runInInjectionContext(() =>
      permissionGuard(
        { data } as unknown as ActivatedRouteSnapshot,
        { url: '/reports' } as never,
      ),
    );

  beforeEach(() => {
    sessionSpy = jasmine.createSpyObj<SessionService>('SessionService', [
      'isAuthenticated',
      'hasAnyPermission',
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

    const result = run({ permissions: ['report:view'] });

    expect(result instanceof UrlTree).toBeTrue();
    expect((result as UrlTree).toString()).toBe('/');
    expect(sessionSpy.hasAnyPermission).not.toHaveBeenCalled();
  });

  it('allows activation when the route requires no permissions', () => {
    sessionSpy.isAuthenticated.and.returnValue(true);

    expect(run({})).toBeTrue();
    expect(sessionSpy.hasAnyPermission).not.toHaveBeenCalled();
  });

  it('allows activation when route data is missing entirely', () => {
    sessionSpy.isAuthenticated.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      permissionGuard(
        {} as unknown as ActivatedRouteSnapshot,
        { url: '/reports' } as never,
      ),
    );

    expect(result).toBeTrue();
  });

  it('allows activation when the user has one of the required permissions', () => {
    sessionSpy.isAuthenticated.and.returnValue(true);
    sessionSpy.hasAnyPermission.and.returnValue(true);

    expect(run({ permissions: ['report:view'] })).toBeTrue();
    expect(sessionSpy.hasAnyPermission).toHaveBeenCalledWith(['report:view']);
  });

  it('redirects to the dashboard when the user lacks the required permissions', () => {
    sessionSpy.isAuthenticated.and.returnValue(true);
    sessionSpy.hasAnyPermission.and.returnValue(false);

    const result = run({ permissions: ['report:view'] });

    expect(result instanceof UrlTree).toBeTrue();
    expect((result as UrlTree).toString()).toBe('/dashboard');
  });
});
