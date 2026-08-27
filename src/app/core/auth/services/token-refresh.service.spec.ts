import { TestBed } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
import { TokenRefreshService } from './token-refresh.service';
import { AuthApiService } from './auth-api.service';
import { TokenService } from './token.service';
import { SessionService } from './session.service';
import { AuthUser, LoginData, RefreshTokenResponse } from '../models/auth.models';

describe('TokenRefreshService', () => {
  let service: TokenRefreshService;
  let authApi: jasmine.SpyObj<AuthApiService>;
  let tokenService: TokenService;
  let sessionService: SessionService;

  const user: AuthUser = {
    userId: 4,
    publicId: 'id-1',
    fullName: 'Test User',
    email: 'user@example.com',
    accountStatus: 'ACTIVE',
    role: 'USER',
    permissions: ['DASHBOARD_VIEW'],
    sessionId: 'sess-1',
    correlationId: 'corr-1',
  };
  const loginData: LoginData = {
    publicId: 'id-1',
    fullName: 'Test User',
    email: 'user@example.com',
    accountStatus: 'ACTIVE',
    role: 'USER',
    permissions: ['DASHBOARD_VIEW'],
    accessToken: 'old-access',
    refreshToken: 'r1',
    sessionId: 'sess-1',
  };
  const refreshResponse: RefreshTokenResponse = {
    success: true,
    code: 'OK',
    message: '',
    data: { accessToken: 'new-access', refreshToken: 'r2', tokenType: 'Bearer' },
    correlationId: 'corr-1',
  };

  beforeEach(() => {
    localStorage.clear();
    authApi = jasmine.createSpyObj<AuthApiService>('AuthApiService', ['refreshToken']);
    TestBed.configureTestingModule({
      providers: [
        TokenRefreshService,
        { provide: AuthApiService, useValue: authApi },
        TokenService,
        SessionService,
      ],
    });
    tokenService = TestBed.inject(TokenService);
    sessionService = TestBed.inject(SessionService);
    service = TestBed.inject(TokenRefreshService);
  });

  afterEach(() => localStorage.clear());

  it('errors when there is no refresh token', (done) => {
    service.refreshAccessToken().subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
        done();
      },
    });
  });

  it('refreshes tokens, renews the session and returns the new access token', (done) => {
    tokenService.setTokens({ accessToken: 'old-access', tokenType: 'Bearer', refreshToken: 'r1' });
    sessionService.setSession(loginData, 'corr-1');
    authApi.refreshToken.and.returnValue(of(refreshResponse));

    service.refreshAccessToken().subscribe((token) => {
      expect(token).toBe('new-access');
      expect(tokenService.getAccessToken()).toBe('new-access');
      expect(tokenService.getRefreshToken()).toBe('r2');
      expect(sessionService.isAuthenticated()).toBeTrue();
      done();
    });
  });

  it('shares a single in-flight refresh for concurrent callers', () => {
    tokenService.setTokens({ accessToken: 'old-access', refreshToken: 'r1' });
    authApi.refreshToken.and.returnValue(new Subject<RefreshTokenResponse>().asObservable());

    service.refreshAccessToken().subscribe();
    service.refreshAccessToken().subscribe();

    expect(authApi.refreshToken).toHaveBeenCalledTimes(1);
  });
});
