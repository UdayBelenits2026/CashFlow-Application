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
});
