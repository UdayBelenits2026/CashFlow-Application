import { Injectable, inject } from '@angular/core';
import { AuthUser, LoginData, StoredSession } from '../models/auth.models';
import { getTokenExpiryMs, getUserIdFromToken } from '../utility/jwt.util';
import { TokenService } from './token.service';

// Owns the user session / authentication profile. Tokens live in TokenService; this
// service delegates token reads so the app has a single auth query surface.
@Injectable({ providedIn: 'root' })
export class SessionService {
  private static readonly storageKey = 'cf.auth.session';
  private readonly tokenService = inject(TokenService);
  private session: StoredSession | null = this.readFromStorage();

  // Builds and persists the session from the login response `data` plus the
  // envelope `correlationId`. `userId` and expiry are derived from the JWT.
  setSession(data: LoginData, correlationId: string): void {
    const user: AuthUser = {
      userId: getUserIdFromToken(data.accessToken),
      publicId: data.publicId,
      fullName: data.fullName,
      email: data.email,
      accountStatus: data.accountStatus,
      role: data.role,
      permissions: data.permissions ?? [],
      sessionId: data.sessionId,
      correlationId,
    };
    this.session = { user, expiresAt: getTokenExpiryMs(data.accessToken) };
    this.persist();
  }

  // Realigns local expiry with the freshly refreshed access token.
  renew(): void {
    if (!this.session) {
      return;
    }
    this.session = {
      ...this.session,
      expiresAt: getTokenExpiryMs(this.tokenService.getAccessToken()),
    };
    this.persist();
  }

  getSession(): StoredSession | null {
    return this.getValidSession();
  }

  isAuthenticated(): boolean {
    return Boolean(this.getValidSession());
  }

  getUser(): AuthUser | null {
    return this.getValidSession()?.user ?? null;
  }

  // --- Individual field accessors (single source for the whole app) ---
  getAccessToken(): string | null {
    return this.tokenService.getAccessToken();
  }

  getRefreshToken(): string | null {
    return this.tokenService.getRefreshToken();
  }

  getUserId(): number | null {
    return this.getUser()?.userId ?? this.tokenService.getUserId();
  }

  getPublicId(): string | null {
    return this.getUser()?.publicId ?? null;
  }

  getFullName(): string | null {
    return this.getUser()?.fullName ?? null;
  }

  getEmail(): string | null {
    return this.getUser()?.email ?? null;
  }

  getAccountStatus(): string | null {
    return this.getUser()?.accountStatus ?? null;
  }

  getRole(): string | null {
    return this.getUser()?.role ?? null;
  }

  getPermissions(): string[] {
    return this.getUser()?.permissions ?? [];
  }

  getSessionId(): string | null {
    return this.getUser()?.sessionId ?? null;
  }

  getCorrelationId(): string | null {
    return this.getUser()?.correlationId ?? null;
  }

  hasAnyRole(requiredRoles: readonly string[]): boolean {
    if (!requiredRoles.length) {
      return true;
    }
    const currentRole = this.getRole();
    return currentRole ? requiredRoles.includes(currentRole) : false;
  }

  hasAnyPermission(requiredPermissions: readonly string[]): boolean {
    if (!requiredPermissions.length) {
      return true;
    }
    const currentPermissions = this.getPermissions();
    return requiredPermissions.some((permission) => currentPermissions.includes(permission));
  }

  clearSession(): void {
    this.session = null;
    this.removeFromStorage();
  }

  private getValidSession(): StoredSession | null {
    const session = this.session ?? this.readFromStorage();
    if (!session) {
      return null;
    }

    // Only enforce local expiry when the backend actually provided one.
    if (session.expiresAt !== null && Date.now() >= session.expiresAt) {
      this.clearSession();
      return null;
    }
    this.session = session;
    return session;
  }

  private persist(): void {
    try {
      globalThis.localStorage?.setItem(SessionService.storageKey, JSON.stringify(this.session));
    } catch {
      // Storage can fail in private mode or restricted browser contexts.
    }
  }

  private readFromStorage(): StoredSession | null {
    try {
      const rawValue = globalThis.localStorage?.getItem(SessionService.storageKey);
      if (!rawValue) {
        return null;
      }
      const parsed = JSON.parse(rawValue) as Partial<StoredSession>;
      // A session is valid as long as we know who the user is; expiry is optional.
      if (!parsed.user) {
        return null;
      }
      const expiresAt = typeof parsed.expiresAt === 'number' ? parsed.expiresAt : null;
      return { user: parsed.user, expiresAt };
    } catch {
      return null;
    }
  }

  private removeFromStorage(): void {
    try {
      globalThis.localStorage?.removeItem(SessionService.storageKey);
    } catch {
      // Ignore storage clean-up failures.
    }
  }
}
