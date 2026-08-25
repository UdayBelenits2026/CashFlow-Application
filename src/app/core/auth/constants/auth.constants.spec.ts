import { AUTH_MESSAGES, INACTIVITY_TIMEOUT_MS } from './auth.constants';

describe('auth.constants', () => {
  describe('INACTIVITY_TIMEOUT_MS', () => {
    it('equals five minutes expressed in milliseconds', () => {
      expect(INACTIVITY_TIMEOUT_MS).toBe(5 * 60 * 1000);
      expect(INACTIVITY_TIMEOUT_MS).toBe(300000);
    });
  });

  describe('AUTH_MESSAGES', () => {
    it('exposes all user-facing auth messages', () => {
      expect(AUTH_MESSAGES.logoutSuccess).toBe('Logout successful.');
      expect(AUTH_MESSAGES.registerSuccess).toBe('Account created successfully.');
      expect(AUTH_MESSAGES.inactivity).toBe(
        'Your session has expired due to inactivity. Please sign in again.',
      );
      expect(AUTH_MESSAGES.unauthorized).toBe(
        'Your session has expired. Please sign in again.',
      );
    });

    it('defines exactly the expected message keys', () => {
      expect(Object.keys(AUTH_MESSAGES).sort()).toEqual(
        ['inactivity', 'logoutSuccess', 'registerSuccess', 'unauthorized'].sort(),
      );
    });

    it('provides non-empty strings for every message', () => {
      for (const message of Object.values(AUTH_MESSAGES)) {
        expect(typeof message).toBe('string');
        expect(message.length).toBeGreaterThan(0);
      }
    });
  });
});
