import { Injectable } from '@angular/core';
import { AuthUser, LoginData, StoredAuthSession } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthTokenService {
  private static readonly storageKey = 'cf.auth.session';
  private session: StoredAuthSession | null = this.readFromStorage();

  set(token: string): void {
    if (!token) {
      this.clear();
      return;
    }
    const fallbackSession: StoredAuthSession = {
      accessToken: token,
      tokenType: 'Bearer',
      expiresAt: Number.MAX_SAFE_INTEGER,
      user: {
        publicId: '',
        fullName: '',
        email: '',
        accountStatus: '',
        roles: [],
        permissions: [],
      },
    };

    this.persistSession(fallbackSession);
  }
  get(): string | null {
    return this.getAccessToken();
  }
  setSession(data: LoginData): void {
    const expiresAt = Date.now() + data.expiresIn * 1000;
    this.persistSession({
      accessToken: data.accessToken,
      tokenType: data.tokenType || 'Bearer',
      expiresAt,
      user: data.user,
    });
  }
  hydrateSession(): LoginData | null {
    const session = this.getValidSession();
    if (!session) {
      return null;
    }
    const expiresIn = Math.max(1, Math.floor((session.expiresAt - Date.now()) / 1000));
    return {
      accessToken: session.accessToken,
      tokenType: session.tokenType,
      expiresIn,
      user: session.user,
    };
  }

  getAccessToken(): string | null {
    return this.getValidSession()?.accessToken ?? null;
  }
  getTokenType(): string {
    return this.getValidSession()?.tokenType || 'Bearer';
  }
  getAuthorizationHeader(): string | null {
    const session = this.getValidSession();
    if (!session) {
      return null;
    }
    return `${session.tokenType || 'Bearer'} ${session.accessToken}`;
  }
  getUser(): AuthUser | null {
    return this.getValidSession()?.user ?? null;
  }
  isAuthenticated(): boolean {
    return Boolean(this.getValidSession());
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
  clear(): void {
    this.session = null;
    this.removeFromStorage();
  }
  private getValidSession(): StoredAuthSession | null {
    const session = this.session ?? this.readFromStorage();
    if (!session) {
      return null;
    }

    if (Date.now() >= session.expiresAt) {
      this.clear();
      return null;
    }
    this.session = session;
    return session;
  }
  private persistSession(session: StoredAuthSession): void {
    this.session = session;

    try {
      globalThis.localStorage?.setItem(AuthTokenService.storageKey, JSON.stringify(session));
    } catch {
      // Storage can fail in private mode or restricted browser contexts.
    }
  }
  private readFromStorage(): StoredAuthSession | null {
    try {
      const rawValue = globalThis.localStorage?.getItem(AuthTokenService.storageKey);
      if (!rawValue) {
        return null;
      }
      const parsed = JSON.parse(rawValue) as Partial<StoredAuthSession>;
      if (!parsed.accessToken || !parsed.tokenType || !parsed.expiresAt || !parsed.user) {
        return null;
      }

      return {
        accessToken: parsed.accessToken,
        tokenType: parsed.tokenType,
        expiresAt: parsed.expiresAt,
        user: parsed.user,
      };
    } catch {
      return null;
    }
  }
  private removeFromStorage(): void {
    try {
      globalThis.localStorage?.removeItem(AuthTokenService.storageKey);
    } catch {
      // Ignore storage clean-up failures.
    }
  }
}
