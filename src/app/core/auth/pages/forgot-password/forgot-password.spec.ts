import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideStore, Store } from '@ngrx/store';
import { provideRouter, Router } from '@angular/router';

import { ForgotPassword } from './forgot-password';
import { authReducer } from '../../store/reducer/auth.reducer';
import * as AuthActions from '../../store/actions/auth.actions';

describe('ForgotPassword', () => {
  let component: ForgotPassword;
  let fixture: ComponentFixture<ForgotPassword>;
  let store: Store;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgotPassword],
      providers: [provideStore({ auth: authReducer }), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPassword);
    component = fixture.componentInstance;
    store = TestBed.inject(Store);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with an invalid empty form', () => {
    expect(component.ForgotPasswordForm.invalid).toBeTrue();
  });

  it('should be invalid when passwords do not match', () => {
    component.ForgotPasswordForm.setValue({
      email: 'user@example.com',
      newPassword: 'Password@123',
      confirmPassword: 'Different@123',
    });

    expect(component.ForgotPasswordForm.hasError('passwordMismatch')).toBeTrue();
    expect(component.isPasswordMismatch()).toBeFalse();
    component.ForgotPasswordForm.controls.confirmPassword.markAsTouched();
    expect(component.isPasswordMismatch()).toBeTrue();
  });

  it('should not dispatch resetPassword when the form is invalid', () => {
    const dispatchSpy = spyOn(store, 'dispatch');

    component.onSubmit();

    expect(component.ForgotPasswordForm.touched).toBeTrue();
    expect(dispatchSpy).not.toHaveBeenCalledWith(
      jasmine.objectContaining({ type: '[Auth] Reset Password' }),
    );
  });

  it('should dispatch resetPassword with the raw form value when valid', () => {
    const dispatchSpy = spyOn(store, 'dispatch');
    const value = {
      email: 'user@example.com',
      newPassword: 'Password@123',
      confirmPassword: 'Password@123',
    };
    component.ForgotPasswordForm.setValue(value);

    component.onSubmit();

    expect(dispatchSpy).toHaveBeenCalledWith(AuthActions.resetPassword({ request: value }));
  });

  it('should navigate to sign in after a successful reset', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate');

    store.dispatch(
      AuthActions.resetPasswordSuccess({
        message: 'Password reset successfully.',
        data: { publicId: 'pub-1', email: 'user@example.com' },
      }),
    );

    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('should toggle password visibility', () => {
    expect(component.showPassword).toBeFalse();
    component.togglePassword();
    expect(component.showPassword).toBeTrue();
  });
});
