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
        data: {
          accessToken: 'token-123',
          tokenType: 'Bearer',
          expiresIn: 900,
          user: {
            publicId: 'id-1',
            fullName: 'Test User',
            email: 'user@example.com',
            accountStatus: 'ACTIVE',
            roles: ['USER'],
            permissions: ['DASHBOARD_VIEW'],
          },
        },
      }),
    );

    expect(state.isAuthenticated).toBeTrue();
    expect(state.accessToken).toBe('token-123');
    expect(state.user?.email).toBe('user@example.com');
  });

  it('should reset to initial state on logout', () => {
    const authenticatedState = authReducer(
      initialAuthState,
      AuthActions.loginSuccess({
        data: {
          accessToken: 'token-123',
          tokenType: 'Bearer',
          expiresIn: 900,
          user: {
            publicId: 'id-1',
            fullName: 'Test User',
            email: 'user@example.com',
            accountStatus: 'ACTIVE',
            roles: ['USER'],
            permissions: ['DASHBOARD_VIEW'],
          },
        },
      }),
    );

    const state = authReducer(authenticatedState, AuthActions.logout());

    expect(state).toEqual(initialAuthState);
  });
});
