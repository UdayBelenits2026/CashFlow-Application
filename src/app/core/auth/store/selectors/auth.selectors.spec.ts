import {
  selectAccessToken,
  selectIsAuthenticated,
  selectPermissions,
  selectResetPasswordData,
  selectResetPasswordError,
  selectResetPasswordLoading,
  selectResetPasswordMessage,
  selectResetPasswordSuccess,
  selectRoles,
  selectUser,
} from './auth.selectors';
import { AuthState } from '../state/auth.state';

describe('auth.selectors', () => {
  const authState: AuthState = {
    user: {
      publicId: 'id-1',
      fullName: 'Test User',
      email: 'user@example.com',
      accountStatus: 'ACTIVE',
      roles: ['USER'],
      permissions: ['DASHBOARD_VIEW'],
    },
    accessToken: 'token-123',
    tokenType: 'Bearer',
    expiresIn: 900,
    isAuthenticated: true,
    loading: false,
    error: null,
    accountLock: null,
    operation: null,
    successMessage: null,
    notice: null,
    resetPasswordLoading: true,
    resetPasswordSuccess: true,
    resetPasswordMessage: 'Password reset successfully.',
    resetPasswordError: 'Email address is not registered.',
    resetPasswordData: { publicId: 'pub-1', email: 'user@example.com' },
  };

  it('should select user, token and auth flag', () => {
    expect(selectUser.projector(authState)).toEqual(authState.user);
    expect(selectAccessToken.projector(authState)).toBe('token-123');
    expect(selectIsAuthenticated.projector(authState)).toBeTrue();
  });

  it('should select roles and permissions from user', () => {
    expect(selectRoles.projector(authState.user)).toEqual(['USER']);
    expect(selectPermissions.projector(authState.user)).toEqual(['DASHBOARD_VIEW']);
  });

  it('should select reset-password state slices', () => {
    expect(selectResetPasswordLoading.projector(authState)).toBeTrue();
    expect(selectResetPasswordSuccess.projector(authState)).toBeTrue();
    expect(selectResetPasswordMessage.projector(authState)).toBe('Password reset successfully.');
    expect(selectResetPasswordError.projector(authState)).toBe('Email address is not registered.');
    expect(selectResetPasswordData.projector(authState)).toEqual({
      publicId: 'pub-1',
      email: 'user@example.com',
    });
  });
});
