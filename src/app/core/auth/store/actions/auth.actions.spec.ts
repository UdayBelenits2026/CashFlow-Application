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

  it('should create resetPassword action with request', () => {
    const request = {
      email: 'test@example.com',
      newPassword: 'Password@123',
      confirmPassword: 'Password@123',
    };
    const action = AuthActions.resetPassword({ request });

    expect(action.type).toBe('[Auth] Reset Password');
    expect(action.request).toEqual(request);
  });

  it('should create resetPasswordSuccess action with message and data', () => {
    const data = { publicId: 'pub-1', email: 'test@example.com' };
    const action = AuthActions.resetPasswordSuccess({ message: 'Password reset successfully.', data });

    expect(action.type).toBe('[Auth] Reset Password Success');
    expect(action.message).toBe('Password reset successfully.');
    expect(action.data).toEqual(data);
  });

  it('should create resetPasswordFailure action with error', () => {
    const error = { code: 'INVALID_EMAIL', message: 'Email address is not registered.' };
    const action = AuthActions.resetPasswordFailure({ error });

    expect(action.type).toBe('[Auth] Reset Password Failure');
    expect(action.error).toEqual(error);
  });

  it('should create clearResetPasswordState action', () => {
    const action = AuthActions.clearResetPasswordState();

    expect(action.type).toBe('[Auth] Clear Reset Password State');
  });
});
