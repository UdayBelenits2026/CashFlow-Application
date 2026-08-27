import * as AuthActions from '../actions/auth.actions';
import { authReducer } from './auth.reducer';
import { initialAuthState } from '../state/auth.state';

describe('authReducer', () => {
  it('should set loading true on login action', () => {
    const state = authReducer(
      initialAuthState,
      AuthActions.login({ request: { email: 'user@example.com', password: 'Password@123' } }),
    );

    expect(state.loading).toBeTrue();
    expect(state.operation).toBe('LOGIN');
    expect(state.error).toBeNull();
  });

  it('should set authenticated state on loginSuccess', () => {
    const state = authReducer(
      initialAuthState,
      AuthActions.loginSuccess({
        session: {
          accessToken: 'token-123',
          correlationId: 'corr-1',
          user: {
            userId: 4,
            publicId: 'id-1',
            fullName: 'Test User',
            email: 'user@example.com',
            accountStatus: 'ACTIVE',
            role: 'USER',
            permissions: ['DASHBOARD_VIEW'],
            sessionId: 'sess-1',
            correlationId: 'corr-1',
          },
        },
      }),
    );

    expect(state.isAuthenticated).toBeTrue();
    expect(state.accessToken).toBe('token-123');
    expect(state.correlationId).toBe('corr-1');
    expect(state.user?.email).toBe('user@example.com');
  });

  it('should reset to initial state with a notice on logout', () => {
    const authenticatedState = authReducer(
      initialAuthState,
      AuthActions.loginSuccess({
        session: {
          accessToken: 'token-123',
          correlationId: 'corr-1',
          user: {
            userId: 4,
            publicId: 'id-1',
            fullName: 'Test User',
            email: 'user@example.com',
            accountStatus: 'ACTIVE',
            role: 'USER',
            permissions: ['DASHBOARD_VIEW'],
            sessionId: 'sess-1',
            correlationId: 'corr-1',
          },
        },
      }),
    );

    const state = authReducer(authenticatedState, AuthActions.logout());

    expect(state).toEqual({ ...initialAuthState, notice: 'Logout successful.' });
    expect(state.isAuthenticated).toBeFalse();
    expect(state.accessToken).toBeNull();
  });

  it('should set a notice on registerSuccess so it survives navigation', () => {
    const state = authReducer(
      initialAuthState,
      AuthActions.registerSuccess({
        response: {
          success: true,
          code: 'OK',
          message: '',
          data: {
            publicId: 'id-1',
            fullName: 'Test User',
            email: 'user@example.com',
            accountStatus: 'ACTIVE',
            role: 'USER',
          },
          correlationId: 'corr-1',
        },
      }),
    );

    expect(state.notice).toBe('Account created successfully.');
    expect(state.loading).toBeFalse();
  });

  it('should set resetPasswordLoading true on resetPassword', () => {
    const state = authReducer(
      initialAuthState,
      AuthActions.resetPassword({
        request: {
          email: 'user@example.com',
          newPassword: 'Password@123',
          confirmPassword: 'Password@123',
        },
      }),
    );

    expect(state.resetPasswordLoading).toBeTrue();
    expect(state.resetPasswordSuccess).toBeFalse();
    expect(state.resetPasswordMessage).toBeNull();
    expect(state.resetPasswordError).toBeNull();
    expect(state.resetPasswordData).toBeNull();
  });

  it('should store message and data on resetPasswordSuccess', () => {
    const data = { publicId: 'pub-1', email: 'user@example.com' };
    const state = authReducer(
      initialAuthState,
      AuthActions.resetPasswordSuccess({ message: 'Password reset successfully.', data }),
    );

    expect(state.resetPasswordLoading).toBeFalse();
    expect(state.resetPasswordSuccess).toBeTrue();
    expect(state.resetPasswordMessage).toBe('Password reset successfully.');
    expect(state.resetPasswordData).toEqual(data);
    expect(state.resetPasswordError).toBeNull();
  });

  it('should store readable error on resetPasswordFailure', () => {
    const state = authReducer(
      initialAuthState,
      AuthActions.resetPasswordFailure({
        error: { code: 'INVALID_EMAIL', message: 'Email address is not registered.' },
      }),
    );

    expect(state.resetPasswordLoading).toBeFalse();
    expect(state.resetPasswordSuccess).toBeFalse();
    expect(state.resetPasswordError).toBe('Email address is not registered.');
    expect(state.resetPasswordData).toBeNull();
  });

  it('should reset reset-password slice on clearResetPasswordState', () => {
    const populated = authReducer(
      initialAuthState,
      AuthActions.resetPasswordSuccess({
        message: 'Password reset successfully.',
        data: { publicId: 'pub-1', email: 'user@example.com' },
      }),
    );

    const state = authReducer(populated, AuthActions.clearResetPasswordState());

    expect(state.resetPasswordLoading).toBeFalse();
    expect(state.resetPasswordSuccess).toBeFalse();
    expect(state.resetPasswordMessage).toBeNull();
    expect(state.resetPasswordError).toBeNull();
    expect(state.resetPasswordData).toBeNull();
  });
});
