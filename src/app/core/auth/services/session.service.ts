import { Injectable } from '@angular/core';
import { AuthUser, LoginData, StoredSession } from '../models/auth.models';

// Owns the user session / authentication information only. No token storage here.
@Injectable({ providedIn: 'root' })
export class SessionService {
  private static readonly storageKey = 'cf.auth.session';
  private session: StoredSession | null = this.readFromStorage();

  setSession(data: LoginData): void {
    const hasExpiry = Number.isFinite(data.expiresIn) && data.expiresIn > 0;
    this.session = {
      user: data.user,
      expiresAt: hasExpiry ? Date.now() + data.expiresIn * 1000 : null,
      expiresInSeconds: hasExpiry ? data.expiresIn : 0,
    };
    this.persist();
  }

  // Extend the session using the original login TTL (refresh responses omit it).
  renew(): void {
    if (!this.session || this.session.expiresInSeconds <= 0) {
      return;
    }
    this.session = {
      ...this.session,
      expiresAt: Date.now() + this.session.expiresInSeconds * 1000,
    };
    this.persist();
  }

  getTtlSeconds(): number {
    return this.session?.expiresInSeconds ?? 0;
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

  hasAnyRole(requiredRoles: readonly string[]): boolean {
    if (!requiredRoles.length) {
      return true;
    }
    const currentRoles = this.getUser()?.roles ?? [];
    return requiredRoles.some((role) => currentRoles.includes(role));
  }

  hasAnyPermission(requiredPermissions: readonly string[]): boolean {
    if (!requiredPermissions.length) {
      return true;
    }
    const currentPermissions = this.getUser()?.permissions ?? [];
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
      const expiresInSeconds =
        parsed.expiresInSeconds ??
        (expiresAt ? Math.max(1, Math.floor((expiresAt - Date.now()) / 1000)) : 0);
      return { user: parsed.user, expiresAt, expiresInSeconds };
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
