import { Injectable } from '@angular/core';

interface StoredToken {
  accessToken: string;
  tokenType: string;
  refreshToken?: string;
}

// Owns the access + refresh tokens only. No user/session logic lives here.
@Injectable({ providedIn: 'root' })
export class TokenService {
  private static readonly storageKey = 'cf.auth.token';
  private token: StoredToken | null = this.readFromStorage();

  setTokens(tokens: { accessToken: string; tokenType?: string; refreshToken?: string | null }): void {
    if (!tokens.accessToken) {
      this.clearAccessToken();
      return;
    }
    this.token = {
      accessToken: tokens.accessToken,
      tokenType: tokens.tokenType || 'Bearer',
      refreshToken: tokens.refreshToken ?? this.token?.refreshToken,
    };
    this.persist();
  }

  setAccessToken(accessToken: string, tokenType = 'Bearer'): void {
    this.setTokens({ accessToken, tokenType });
  }

  getAccessToken(): string | null {
    return this.token?.accessToken ?? null;
  }

  getRefreshToken(): string | null {
    return this.token?.refreshToken ?? null;
  }

  hasRefreshToken(): boolean {
    return Boolean(this.token?.refreshToken);
  }

  getTokenType(): string {
    return this.token?.tokenType || 'Bearer';
  }

  hasAccessToken(): boolean {
    return Boolean(this.token?.accessToken);
  }

  getAuthorizationHeader(): string | null {
    return this.token?.accessToken ? `${this.getTokenType()} ${this.token.accessToken}` : null;
  }

  clearAccessToken(): void {
    this.token = null;
    this.removeFromStorage();
  }

  private persist(): void {
    try {
      globalThis.localStorage?.setItem(TokenService.storageKey, JSON.stringify(this.token));
    } catch {
      // Storage can fail in private mode or restricted browser contexts.
    }
  }

  private readFromStorage(): StoredToken | null {
    try {
      const rawValue = globalThis.localStorage?.getItem(TokenService.storageKey);
      if (!rawValue) {
        return null;
      }
      const parsed = JSON.parse(rawValue) as Partial<StoredToken>;
      return parsed.accessToken
        ? {
            accessToken: parsed.accessToken,
            tokenType: parsed.tokenType || 'Bearer',
            refreshToken: parsed.refreshToken,
          }
        : null;
    } catch {
      return null;
    }
  }

  private removeFromStorage(): void {
    try {
      globalThis.localStorage?.removeItem(TokenService.storageKey);
    } catch {
      // Ignore storage clean-up failures.
    }
  }
}
