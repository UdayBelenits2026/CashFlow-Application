import {
  AccountLockedResponse,
  ApiResponse,
  AuthError,
  AuthSidePanelConfig,
  AuthUser,
  ForgotPassword,
  LoginData,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  RefreshTokenResponse,
  RegisterRequest,
  RegisteredUser,
  ResetPasswordRequest,
  ResetPasswordResponse,
  RoleGuardData,
  StoredSession,
} from './auth.models';

// These tests exercise the shape of the auth model contracts. Interfaces are
// erased at runtime, so the value here is compile-time safety plus a guard
// against accidental structural changes to the public auth data contracts.
describe('auth.models', () => {
  const user: AuthUser = {
    userId: 4,
    publicId: 'usr-1',
    fullName: 'Ada Lovelace',
    email: 'ada@example.com',
    accountStatus: 'ACTIVE',
    role: 'ADMIN',
    permissions: ['report:view'],
    sessionId: 'sess-1',
    correlationId: 'corr-0',
  };

  it('builds a valid AuthUser', () => {
    expect(user.role).toBe('ADMIN');
    expect(user.userId).toBe(4);
    expect(user.permissions).toContain('report:view');
  });

  it('builds a valid LoginData matching the API data object', () => {
    const loginData: LoginData = {
      publicId: 'usr-1',
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      accountStatus: 'ACTIVE',
      role: 'USER',
      permissions: ['DASHBOARD_VIEW'],
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      sessionId: 'sess-1',
    };

    expect(loginData.accessToken).toBe('access-token');
    expect(loginData.refreshToken).toBe('refresh-token');
    expect(loginData.sessionId).toBe('sess-1');
    expect(loginData.role).toBe('USER');
  });

  it('wraps payloads in a generic ApiResponse', () => {
    const response: ApiResponse<{ ok: boolean }> = {
      success: true,
      code: 'OK',
      message: 'done',
      data: { ok: true },
      correlationId: 'corr-1',
    };

    expect(response.success).toBeTrue();
    expect(response.data.ok).toBeTrue();
  });

  it('builds a LoginResponse alias over ApiResponse<LoginData>', () => {
    const loginResponse: LoginResponse = {
      success: true,
      code: 'AUTH_OK',
      message: 'logged in',
      correlationId: 'corr-2',
      data: {
        publicId: 'usr-1',
        fullName: 'Ada Lovelace',
        email: 'ada@example.com',
        accountStatus: 'ACTIVE',
        role: 'USER',
        permissions: ['DASHBOARD_VIEW'],
        accessToken: 'a',
        refreshToken: 'r',
        sessionId: 's',
      },
    };

    expect(loginResponse.data.accessToken).toBe('a');
    expect(loginResponse.correlationId).toBe('corr-2');
  });

  it('builds request payloads for login and register', () => {
    const loginRequest: LoginRequest = {
      email: 'ada@example.com',
      password: 'secret',
    };
    const registerRequest: RegisterRequest = {
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secret',
      confirmPassword: 'secret',
      termsAccepted: true,
    };

    expect(loginRequest.email).toBe(registerRequest.email);
    expect(registerRequest.termsAccepted).toBeTrue();
  });

  it('builds a StoredSession with a nullable expiry', () => {
    const withExpiry: StoredSession = {
      user,
      expiresAt: Date.now() + 1000,
    };
    const withoutExpiry: StoredSession = {
      user,
      expiresAt: null,
    };

    expect(withExpiry.expiresAt).not.toBeNull();
    expect(withoutExpiry.expiresAt).toBeNull();
  });

  it('builds a RegisteredUser and its response alias', () => {
    const registered: RegisteredUser = {
      publicId: 'usr-2',
      fullName: 'Grace Hopper',
      email: 'grace@example.com',
      accountStatus: 'PENDING',
      role: 'USER',
    };
    const registerResponse: LogoutResponse = {
      success: true,
      code: 'OK',
      message: 'ok',
      correlationId: 'corr-3',
      data: { publicId: registered.publicId, fullName: registered.fullName },
    };

    expect(registerResponse.data.publicId).toBe('usr-2');
  });

  it('builds reset-password request and response shapes', () => {
    const resetRequest: ResetPasswordRequest = {
      email: 'ada@example.com',
      newPassword: 'new-secret',
      confirmPassword: 'new-secret',
    };
    const resetResponse: ResetPasswordResponse = {
      success: true,
      code: 'OK',
      message: 'reset',
      correlationId: 'corr-4',
      data: { publicId: 'usr-1', email: 'ada@example.com' },
    };
    const forgot: ForgotPassword = {
      newPassword: 'new-secret',
      confirmPassword: 'new-secret',
    };

    expect(resetRequest.newPassword).toBe(forgot.newPassword);
    expect(resetResponse.data.email).toBe('ada@example.com');
  });

  it('builds a RefreshTokenResponse', () => {
    const refreshResponse: RefreshTokenResponse = {
      success: true,
      code: 'OK',
      message: 'refreshed',
      correlationId: 'corr-5',
      data: {
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
        tokenType: 'Bearer',
      },
    };

    expect(refreshResponse.data.accessToken).toBe('new-access');
  });

  it('builds an AccountLockedResponse', () => {
    const lockedResponse: AccountLockedResponse = {
      success: false,
      code: 'ACCOUNT_LOCKED',
      message: 'locked',
      correlationId: 'corr-6',
      data: {
        lockedUntil: '2026-01-01T00:00:00Z',
        retryAfterSeconds: 60,
        lockedAt: '2026-01-01T00:00:00Z',
        maxFailedAttempts: 5,
        failedLoginAttempts: 5,
      },
    };

    expect(lockedResponse.data.failedLoginAttempts).toBe(
      lockedResponse.data.maxFailedAttempts,
    );
  });

  it('builds AuthError and RoleGuardData shapes', () => {
    const error: AuthError = { code: 'ERR', message: 'boom', correlationId: 'c' };
    const guardData: RoleGuardData = { roles: ['ADMIN'] };
    const emptyGuardData: RoleGuardData = {};

    expect(error.code).toBe('ERR');
    expect(guardData.roles).toEqual(['ADMIN']);
    expect(emptyGuardData.roles).toBeUndefined();
  });

  it('builds an AuthSidePanelConfig with optional flags', () => {
    const config: AuthSidePanelConfig = {
      image: '/assets/images/sign-in.png',
      title: 'Title',
      description: 'Description',
    };

    expect(config.showCashFlowStats).toBeUndefined();
    expect(config.showSecurityPoints).toBeUndefined();
  });
});
