import * as AuthActions from './auth.actions';

describe('AuthActions', () => {
  it('should create login action with payload', () => {
    const request = { email: 'test@example.com', password: 'Password@123' };
    const action = AuthActions.login({ request });

    expect(action.type).toBe('[Auth] Login');
    expect(action.request).toEqual(request);
  });

  it('should create logout action', () => {
    const action = AuthActions.logout();

    expect(action.type).toBe('[Auth] Logout');
  });
});
