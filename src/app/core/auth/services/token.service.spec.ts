import { TokenService } from './token.service';

describe('TokenService', () => {
  const storageKey = 'cf.auth.token';

  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('stores and returns the access token and type', () => {
    const service = new TokenService();
    service.setTokens({ accessToken: 'abc', tokenType: 'Bearer', refreshToken: 'ref' });

    expect(service.getAccessToken()).toBe('abc');
    expect(service.getTokenType()).toBe('Bearer');
    expect(service.hasAccessToken()).toBeTrue();
    expect(service.getAuthorizationHeader()).toBe('Bearer abc');
  });

  it('stores and returns the refresh token', () => {
    const service = new TokenService();
    service.setTokens({ accessToken: 'abc', refreshToken: 'ref' });

    expect(service.getRefreshToken()).toBe('ref');
    expect(service.hasRefreshToken()).toBeTrue();
  });

  it('persists tokens across a reload (a fresh instance reads storage)', () => {
    new TokenService().setTokens({ accessToken: 'abc', tokenType: 'Bearer', refreshToken: 'ref' });

    const reloaded = new TokenService();

    expect(reloaded.getAccessToken()).toBe('abc');
    expect(reloaded.getRefreshToken()).toBe('ref');
  });

  it('preserves the refresh token when only the access token is updated', () => {
    const service = new TokenService();
    service.setTokens({ accessToken: 'a1', tokenType: 'Bearer', refreshToken: 'ref' });

    service.setAccessToken('a2');

    expect(service.getAccessToken()).toBe('a2');
    expect(service.getRefreshToken()).toBe('ref');
  });

  it('clears all tokens', () => {
    const service = new TokenService();
    service.setTokens({ accessToken: 'abc', refreshToken: 'ref' });

    service.clearAccessToken();

    expect(service.getAccessToken()).toBeNull();
    expect(service.hasAccessToken()).toBeFalse();
    expect(service.hasRefreshToken()).toBeFalse();
    expect(localStorage.getItem(storageKey)).toBeNull();
  });

  it('returns no authorization header without a token', () => {
    const service = new TokenService();
    expect(service.getAuthorizationHeader()).toBeNull();
  });

  it('derives the numeric userId from the access token JWT', () => {
    const b64url = (o: unknown) =>
      btoa(JSON.stringify(o)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const token = `h.${b64url({ userId: 4, exp: Math.floor(Date.now() / 1000) + 3600 })}.s`;
    const service = new TokenService();
    service.setTokens({ accessToken: token });

    expect(service.getUserId()).toBe(4);
    expect(service.getSecondsUntilExpiry()).toBeGreaterThan(3500);
    expect(service.isAccessTokenExpired()).toBeFalse();
    expect(service.isAccessTokenValid()).toBeTrue();
  });

  it('flags an expired access token as invalid', () => {
    const b64url = (o: unknown) =>
      btoa(JSON.stringify(o)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const token = `h.${b64url({ userId: 4, exp: Math.floor(Date.now() / 1000) - 10 })}.s`;
    const service = new TokenService();
    service.setTokens({ accessToken: token });

    expect(service.isAccessTokenExpired()).toBeTrue();
    expect(service.isAccessTokenValid()).toBeFalse();
  });
});
