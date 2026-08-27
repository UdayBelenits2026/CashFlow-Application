import { JwtPayload } from '../models/auth.models';

// Decodes the payload segment of a JWT without verifying its signature. Signature
// verification is the backend's responsibility; the client only reads claims.
export function decodeJwtPayload(token: string | null | undefined): JwtPayload | null {
  if (!token) {
    return null;
  }
  const segments = token.split('.');
  if (segments.length < 2) {
    return null;
  }
  try {
    const base64 = segments[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const decoded = atob(padded);
    const json = decodeURIComponent(
      Array.from(decoded)
        .map((char) => '%' + char.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

// Extracts the numeric backend `userId` claim (distinct from the login `publicId`).
export function getUserIdFromToken(token: string | null | undefined): number | null {
  const value = decodeJwtPayload(token)?.userId;
  if (value === null || value === undefined) {
    return null;
  }
  const numeric = Number(value);
  return Number.isNaN(numeric) ? null : numeric;
}

// Returns the token expiry as epoch milliseconds, or null when no `exp` claim exists.
export function getTokenExpiryMs(token: string | null | undefined): number | null {
  const exp = decodeJwtPayload(token)?.exp;
  return typeof exp === 'number' ? exp * 1000 : null;
}

// True only when the token carries an `exp` claim that is in the past.
export function isTokenExpired(token: string | null | undefined): boolean {
  const expiryMs = getTokenExpiryMs(token);
  return expiryMs !== null ? Date.now() >= expiryMs : false;
}
