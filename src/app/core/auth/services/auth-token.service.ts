import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthTokenService {
  private accessToken: string | null = null;

  set(token: string): void {
    this.accessToken = token;
  }

  get(): string | null {
    return this.accessToken;
  }

  clear(): void {
    this.accessToken = null;
  }
}
