import { TestBed } from '@angular/core/testing';
import { SessionService } from './session.service';
import { TokenService } from './token.service';
import { LoginData } from '../models/auth.models';

// Builds an unsigned JWT with the given payload for expiry/userId derivation.
function b64url(obj: unknown): string {
  return btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function makeJwt(payload: Record<string, unknown>): string {
  return `header.${b64url(payload)}.sig`;
}

const nowSec = () => Math.floor(Date.now() / 1000);

function loginData(overrides: Partial<LoginData> = {}, expInSec = nowSec() + 3600): LoginData {
  return {
    publicId: 'pub-1',
    fullName: 'Test User',
    email: 'user@example.com',
    accountStatus: 'ACTIVE',
    role: 'USER',
    permissions: ['DASHBOARD_VIEW'],
    accessToken: makeJwt({ userId: 4, exp: expInSec }),
    refreshToken: 'refresh-token',
    sessionId: 'sess-1',
    ...overrides,
  };
}

function freshService(): SessionService {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({});
  return TestBed.inject(SessionService);
}

describe('SessionService', () => {
  const storageKey = 'cf.auth.session';

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });
  afterEach(() => localStorage.clear());

  it('stores a session and reports it as authenticated', () => {
    const service = TestBed.inject(SessionService);
    service.setSession(loginData(), 'corr-1');

    expect(service.isAuthenticated()).toBeTrue();
    expect(service.getEmail()).toBe('user@example.com');
    expect(service.getPublicId()).toBe('pub-1');
    expect(service.getRole()).toBe('USER');
    expect(service.getSessionId()).toBe('sess-1');
    expect(service.getCorrelationId()).toBe('corr-1');
  });

  it('derives the numeric userId from the JWT (not the publicId)', () => {
    const service = TestBed.inject(SessionService);
    service.setSession(loginData(), 'corr-1');

    expect(service.getUserId()).toBe(4);
  });

  it('delegates token reads to TokenService', () => {
    const tokenService = TestBed.inject(TokenService);
    tokenService.setTokens({ accessToken: makeJwt({ userId: 4, exp: nowSec() + 60 }), refreshToken: 'r1' });
    const service = TestBed.inject(SessionService);
    service.setSession(loginData(), 'corr-1');

    expect(service.getAccessToken()).toBe(tokenService.getAccessToken());
    expect(service.getRefreshToken()).toBe('r1');
  });

  it('restores the session after a reload', () => {
    TestBed.inject(SessionService).setSession(loginData(), 'corr-1');

    const reloaded = freshService();

    expect(reloaded.isAuthenticated()).toBeTrue();
    expect(reloaded.getPublicId()).toBe('pub-1');
    expect(reloaded.getCorrelationId()).toBe('corr-1');
  });

  it('keeps the session on reload when the token carries no expiry', () => {
    TestBed.inject(SessionService).setSession(
      loginData({ accessToken: makeJwt({ userId: 4 }) }),
      'corr-1',
    );

    const reloaded = freshService();

    expect(reloaded.isAuthenticated()).toBeTrue();
    expect(reloaded.getSession()?.expiresAt).toBeNull();
  });

  it('treats a past-expiry session as unauthenticated on reload', () => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ user: { publicId: 'pub-1' }, expiresAt: Date.now() - 1000 }),
    );

    const reloaded = freshService();

    expect(reloaded.isAuthenticated()).toBeFalse();
    expect(localStorage.getItem(storageKey)).toBeNull();
  });

  it('renews the expiry from the refreshed access token', () => {
    const tokenService = TestBed.inject(TokenService);
    const service = TestBed.inject(SessionService);
    service.setSession(loginData({}, nowSec() + 60), 'corr-1');

    // Backend issued a new token with a later expiry.
    tokenService.setTokens({ accessToken: makeJwt({ userId: 4, exp: nowSec() + 7200 }) });
    service.renew();

    expect(service.getSession()?.expiresAt).toBeGreaterThan(Date.now() + 7000 * 1000);
  });

  it('clears the session', () => {
    const service = TestBed.inject(SessionService);
    service.setSession(loginData(), 'corr-1');

    service.clearSession();

    expect(service.isAuthenticated()).toBeFalse();
    expect(localStorage.getItem(storageKey)).toBeNull();
  });

  it('checks the single role and permissions', () => {
    const service = TestBed.inject(SessionService);
    service.setSession(loginData(), 'corr-1');

    expect(service.hasAnyRole([])).toBeTrue();
    expect(service.hasAnyRole(['USER'])).toBeTrue();
    expect(service.hasAnyRole(['ADMIN'])).toBeFalse();
    expect(service.hasAnyPermission(['DASHBOARD_VIEW'])).toBeTrue();
    expect(service.hasAnyPermission(['ADMIN_VIEW'])).toBeFalse();
  });
});
