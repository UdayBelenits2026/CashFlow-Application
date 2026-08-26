import { SessionService } from './session.service';
import { AuthUser, LoginData } from '../models/auth.models';

describe('SessionService', () => {
  const storageKey = 'cf.auth.session';
  const user: AuthUser = {
    publicId: 'id-1',
    fullName: 'Test User',
    email: 'user@example.com',
    accountStatus: 'ACTIVE',
    roles: ['USER'],
    permissions: ['DASHBOARD_VIEW'],
  };
  const loginData = (expiresIn: number): LoginData => ({
    accessToken: 'access-token',
    tokenType: 'Bearer',
    expiresIn,
    refreshToken: 'refresh-token',
    user,
  });

  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('stores a session and reports it as authenticated', () => {
    const service = new SessionService();
    service.setSession(loginData(3600));

    expect(service.isAuthenticated()).toBeTrue();
    expect(service.getUser()?.email).toBe('user@example.com');
    expect(service.getTtlSeconds()).toBe(3600);
  });

  it('restores the session after a reload (a fresh instance reads storage)', () => {
    new SessionService().setSession(loginData(3600));

    const reloaded = new SessionService();

    expect(reloaded.isAuthenticated()).toBeTrue();
    expect(reloaded.getUser()?.publicId).toBe('id-1');
  });

  it('keeps the session on reload even when the backend omitted expiresIn', () => {
    new SessionService().setSession(loginData(undefined as unknown as number));

    const reloaded = new SessionService();

    expect(reloaded.isAuthenticated()).toBeTrue();
    expect(reloaded.getSession()?.expiresAt).toBeNull();
  });

  it('treats a past-expiry session as unauthenticated on reload', () => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ user, expiresAt: Date.now() - 1000, expiresInSeconds: 3600 }),
    );

    const reloaded = new SessionService();

    expect(reloaded.isAuthenticated()).toBeFalse();
    expect(localStorage.getItem(storageKey)).toBeNull();
  });

  it('renews the expiry using the stored TTL', () => {
    const service = new SessionService();
    service.setSession(loginData(3600));

    service.renew();

    const expiresAt = service.getSession()?.expiresAt ?? 0;
    expect(expiresAt).toBeGreaterThan(Date.now() + 3500 * 1000);
  });

  it('does not create an expiry on renew when none exists', () => {
    const service = new SessionService();
    service.setSession(loginData(undefined as unknown as number));

    service.renew();

    expect(service.getSession()?.expiresAt).toBeNull();
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('clears the session', () => {
    const service = new SessionService();
    service.setSession(loginData(3600));

    service.clearSession();

    expect(service.isAuthenticated()).toBeFalse();
    expect(localStorage.getItem(storageKey)).toBeNull();
  });

  it('checks roles and permissions', () => {
    const service = new SessionService();
    service.setSession(loginData(3600));

    expect(service.hasAnyRole([])).toBeTrue();
    expect(service.hasAnyRole(['USER'])).toBeTrue();
    expect(service.hasAnyRole(['ADMIN'])).toBeFalse();
    expect(service.hasAnyPermission(['DASHBOARD_VIEW'])).toBeTrue();
    expect(service.hasAnyPermission(['ADMIN_VIEW'])).toBeFalse();
  });
});
