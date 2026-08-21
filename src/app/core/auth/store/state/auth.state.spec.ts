import { initialAuthState } from './auth.state';

describe('auth.state', () => {
  it('should define the expected initial auth state', () => {
    expect(initialAuthState).toEqual({
      user: null,
      accessToken: null,
      tokenType: null,
      expiresIn: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      operation: null,
      successMessage: null,
    });
  });
});
