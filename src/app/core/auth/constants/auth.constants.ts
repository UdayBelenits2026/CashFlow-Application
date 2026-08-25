export type AuthOperation = 'LOGIN' | 'REGISTER' | null;

// Single source of truth for the inactivity timeout (5 minutes).
export const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;

// User-facing messages generated on the frontend.
export const AUTH_MESSAGES = {
  logoutSuccess: 'Logout successful.',
  registerSuccess: 'Account created successfully.',
  inactivity: 'Your session has expired due to inactivity. Please sign in again.',
  unauthorized: 'Your session has expired. Please sign in again.',
} as const;
