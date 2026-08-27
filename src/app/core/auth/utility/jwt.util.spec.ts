import {
  decodeJwtPayload,
  getUserIdFromToken,
  getTokenExpiryMs,
  isTokenExpired,
} from './jwt.util';

function b64url(obj: unknown): string {
  return btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function makeJwt(payload: Record<string, unknown>): string {
  return `header.${b64url(payload)}.signature`;
}

describe('jwt.util', () => {
  describe('decodeJwtPayload', () => {
    it('returns null for empty/malformed tokens', () => {
      expect(decodeJwtPayload(null)).toBeNull();
      expect(decodeJwtPayload(undefined)).toBeNull();
      expect(decodeJwtPayload('not-a-jwt')).toBeNull();
    });

    it('decodes the payload segment', () => {
      const token = makeJwt({ userId: 4, role: 'USER', sub: 'abc' });
      const payload = decodeJwtPayload(token);
      expect(payload?.userId).toBe(4);
      expect(payload?.role).toBe('USER');
      expect(payload?.sub).toBe('abc');
    });

    it('returns null when the payload is not valid JSON/base64', () => {
      expect(decodeJwtPayload('header.@@@.sig')).toBeNull();
    });
  });

  describe('getUserIdFromToken', () => {
    it('extracts the numeric userId', () => {
      expect(getUserIdFromToken(makeJwt({ userId: 4 }))).toBe(4);
    });
    it('coerces a numeric string userId', () => {
      expect(getUserIdFromToken(makeJwt({ userId: '7' }))).toBe(7);
    });
    it('returns null when absent', () => {
      expect(getUserIdFromToken(makeJwt({ role: 'USER' }))).toBeNull();
      expect(getUserIdFromToken(null)).toBeNull();
    });
  });

  describe('getTokenExpiryMs / isTokenExpired', () => {
    it('converts the exp claim to milliseconds', () => {
      const expSec = Math.floor(Date.now() / 1000) + 3600;
      expect(getTokenExpiryMs(makeJwt({ exp: expSec }))).toBe(expSec * 1000);
    });
    it('returns null when there is no exp claim', () => {
      expect(getTokenExpiryMs(makeJwt({ userId: 4 }))).toBeNull();
    });
    it('detects an expired token', () => {
      expect(isTokenExpired(makeJwt({ exp: Math.floor(Date.now() / 1000) - 5 }))).toBeTrue();
    });
    it('treats a token without exp as not expired', () => {
      expect(isTokenExpired(makeJwt({ userId: 4 }))).toBeFalse();
    });
  });
});
