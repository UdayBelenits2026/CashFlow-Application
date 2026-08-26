import { Injectable, inject } from '@angular/core';
import { Observable, finalize, map, shareReplay, throwError } from 'rxjs';
import { AuthApiService } from './auth-api.service';
import { TokenService } from './token.service';
import { SessionService } from './session.service';
import { RefreshTokenData, RefreshTokenResponse } from '../models/auth.models';

// Coordinates a single in-flight token refresh so concurrent 401s share one call.
@Injectable({ providedIn: 'root' })
export class TokenRefreshService {
  private readonly authApi = inject(AuthApiService);
  private readonly tokenService = inject(TokenService);
  private readonly sessionService = inject(SessionService);

  private inFlight$: Observable<string> | null = null;

  refreshAccessToken(): Observable<string> {
    if (this.inFlight$) {
      return this.inFlight$;
    }

    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('Missing refresh token.'));
    }

    this.inFlight$ = this.authApi.refreshToken({ refreshToken }).pipe(
      map((response: RefreshTokenResponse) => {
        // Tolerate both the standard envelope and a flat payload.
        const data = response?.data ?? (response as unknown as RefreshTokenData);
        if (!data?.accessToken) {
          throw new Error(response?.message || 'Unable to refresh your session.');
        }
        this.tokenService.setTokens({
          accessToken: data.accessToken,
          tokenType: data.tokenType,
          refreshToken: data.refreshToken,
        });
        this.sessionService.renew();
        return data.accessToken;
      }),
      finalize(() => {
        this.inFlight$ = null;
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    return this.inFlight$;
  }
}
