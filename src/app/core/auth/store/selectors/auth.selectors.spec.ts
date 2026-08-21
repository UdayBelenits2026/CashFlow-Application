import {
  selectAccessToken,
  selectIsAuthenticated,
  selectPermissions,
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
    operation: null,
    successMessage: null,
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
});
