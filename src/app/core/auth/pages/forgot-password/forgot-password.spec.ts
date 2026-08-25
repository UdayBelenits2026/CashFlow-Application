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

  const validValue = {
    email: 'user@example.com',
    newPassword: 'Password@123',
    confirmPassword: 'Password@123',
  };

  const html = () => fixture.nativeElement as HTMLElement;

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

  it('clears the reset-password state on construction', () => {
    const dispatchSpy = spyOn(store, 'dispatch');

    const freshFixture = TestBed.createComponent(ForgotPassword);
    freshFixture.detectChanges();

    expect(dispatchSpy).toHaveBeenCalledWith(AuthActions.clearResetPasswordState());
  });

  // ---------------------------------------------------------------------------
  // FORM SETUP
  // ---------------------------------------------------------------------------
  describe('form', () => {
    it('starts invalid and empty', () => {
      expect(component.ForgotPasswordForm.invalid).toBeTrue();
    });

    it('validates the email control', () => {
      const email = component.ForgotPasswordForm.controls.email;
      email.setValue('');
      expect(email.hasError('required')).toBeTrue();
      email.setValue('bad');
      expect(email.hasError('email')).toBeTrue();
      email.setValue('user@example.com');
      expect(email.valid).toBeTrue();
    });

    it('validates the new password for required, minlength and pattern', () => {
      const newPassword = component.ForgotPasswordForm.controls.newPassword;
      newPassword.setValue('');
      expect(newPassword.hasError('required')).toBeTrue();
      newPassword.setValue('Ab1@');
      expect(newPassword.hasError('minlength')).toBeTrue();
      newPassword.setValue('weakpassword');
      expect(newPassword.hasError('pattern')).toBeTrue();
      newPassword.setValue('Password@123');
      expect(newPassword.valid).toBeTrue();
    });

    it('requires the confirm password control', () => {
      const confirm = component.ForgotPasswordForm.controls.confirmPassword;
      confirm.setValue('');
      expect(confirm.hasError('required')).toBeTrue();
    });

    it('flags a password mismatch at the form level', () => {
      component.ForgotPasswordForm.setValue({
        email: 'user@example.com',
        newPassword: 'Password@123',
        confirmPassword: 'Different@123',
      });
      expect(component.ForgotPasswordForm.hasError('passwordMismatch')).toBeTrue();
    });

    it('is valid with matching, strong passwords', () => {
      component.ForgotPasswordForm.setValue(validValue);
      expect(component.ForgotPasswordForm.valid).toBeTrue();
    });
  });

  // ---------------------------------------------------------------------------
  // VALIDATION HELPER METHODS
  // ---------------------------------------------------------------------------
  describe('validation helpers', () => {
    it('isEmailRequired reflects a touched empty email', () => {
      const email = component.ForgotPasswordForm.controls.email;
      expect(component.isEmailRequired()).toBeFalse();
      email.markAsTouched();
      expect(component.isEmailRequired()).toBeTrue();
    });

    it('isEmailInvalid reflects a touched malformed email', () => {
      const email = component.ForgotPasswordForm.controls.email;
      email.setValue('bad');
      email.markAsTouched();
      expect(component.isEmailInvalid()).toBeTrue();
    });

    it('isNewPasswordRequired reflects a touched empty password', () => {
      const newPassword = component.ForgotPasswordForm.controls.newPassword;
      newPassword.markAsTouched();
      expect(component.isNewPasswordRequired()).toBeTrue();
    });

    it('isNewPasswordMinLengthInvalid reflects a short touched password', () => {
      const newPassword = component.ForgotPasswordForm.controls.newPassword;
      newPassword.setValue('Ab1@');
      newPassword.markAsTouched();
      expect(component.isNewPasswordMinLengthInvalid()).toBeTrue();
    });

    it('isConfirmPasswordRequired reflects a touched empty confirmation', () => {
      const confirm = component.ForgotPasswordForm.controls.confirmPassword;
      confirm.markAsTouched();
      expect(component.isConfirmPasswordRequired()).toBeTrue();
    });

    it('isPasswordMismatch only reports after the confirmation is touched', () => {
      component.ForgotPasswordForm.setValue({
        email: 'user@example.com',
        newPassword: 'Password@123',
        confirmPassword: 'Different@123',
      });
      expect(component.isPasswordMismatch()).toBeFalse();
      component.ForgotPasswordForm.controls.confirmPassword.markAsTouched();
      expect(component.isPasswordMismatch()).toBeTrue();
    });
  });

  // ---------------------------------------------------------------------------
  // PASSWORD RULE CHECKS
  // ---------------------------------------------------------------------------
  describe('password rule checks', () => {
    const setPassword = (value: string) =>
      component.ForgotPasswordForm.controls.newPassword.setValue(value);

    it('hasMinLength is true only for 8+ characters', () => {
      setPassword('Ab1@');
      expect(component.hasMinLength()).toBeFalse();
      setPassword('Password');
      expect(component.hasMinLength()).toBeTrue();
    });

    it('detects uppercase, lowercase, number and special characters', () => {
      setPassword('password');
      expect(component.hasUppercase()).toBeFalse();
      expect(component.hasLowercase()).toBeTrue();
      expect(component.hasNumber()).toBeFalse();
      expect(component.hasSpecialCharacter()).toBeFalse();

      setPassword('Password@123');
      expect(component.hasUppercase()).toBeTrue();
      expect(component.hasLowercase()).toBeTrue();
      expect(component.hasNumber()).toBeTrue();
      expect(component.hasSpecialCharacter()).toBeTrue();
    });
  });

  // ---------------------------------------------------------------------------
  // PASSWORD VISIBILITY
  // ---------------------------------------------------------------------------
  describe('togglePassword', () => {
    it('toggles showPassword', () => {
      expect(component.showPassword).toBeFalse();
      component.togglePassword();
      expect(component.showPassword).toBeTrue();
    });

    it('switches the password input type in the template', () => {
      const input = html().querySelector('#newPassword') as HTMLInputElement;
      expect(input.type).toBe('password');
      component.togglePassword();
      fixture.detectChanges();
      expect(input.type).toBe('text');
    });
  });

  // ---------------------------------------------------------------------------
  // SUBMIT
  // ---------------------------------------------------------------------------
  describe('onSubmit', () => {
    it('marks the form touched and does not dispatch when invalid', () => {
      const dispatchSpy = spyOn(store, 'dispatch');

      component.onSubmit();

      expect(component.ForgotPasswordForm.touched).toBeTrue();
      expect(dispatchSpy).not.toHaveBeenCalledWith(
        jasmine.objectContaining({ type: '[Auth] Reset Password' }),
      );
    });

    it('dispatches resetPassword with the raw value when valid', () => {
      component.ForgotPasswordForm.setValue(validValue);
      const dispatchSpy = spyOn(store, 'dispatch');

      component.onSubmit();

      expect(dispatchSpy).toHaveBeenCalledWith(
        AuthActions.resetPassword({ request: validValue }),
      );
    });
  });

  // ---------------------------------------------------------------------------
  // SUCCESS NAVIGATION
  // ---------------------------------------------------------------------------
  it('navigates to sign in after a successful reset', () => {
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

  // ---------------------------------------------------------------------------
  // TEMPLATE
  // ---------------------------------------------------------------------------
  describe('template', () => {
    it('renders the side panel', () => {
      expect(html().querySelector('app-cf-auth-side-panel')).toBeTruthy();
    });

    it('shows the email required and invalid errors', () => {
      const email = component.ForgotPasswordForm.controls.email;
      email.markAsTouched();
      fixture.detectChanges();
      expect(html().textContent).toContain('Email is required.');

      email.setValue('bad');
      fixture.detectChanges();
      expect(html().textContent).toContain('Please enter a valid email address.');
    });

    it('shows the confirm password mismatch error', () => {
      component.ForgotPasswordForm.setValue({
        email: 'user@example.com',
        newPassword: 'Password@123',
        confirmPassword: 'Different@123',
      });
      component.ForgotPasswordForm.controls.confirmPassword.markAsTouched();
      fixture.detectChanges();

      expect(html().textContent).toContain('Passwords do not match.');
    });

    it('marks the password rules as valid for a strong password', () => {
      component.ForgotPasswordForm.controls.newPassword.setValue('Password@123');
      fixture.detectChanges();

      const validRules = html().querySelectorAll('.password-rules p.valid');
      expect(validRules.length).toBe(5);
    });

    it('renders a success notice from the store', () => {
      spyOn(TestBed.inject(Router), 'navigate');
      store.dispatch(
        AuthActions.resetPasswordSuccess({
          message: 'Password reset successfully.',
          data: { publicId: 'pub-1', email: 'user@example.com' },
        }),
      );
      fixture.detectChanges();

      expect(html().querySelector('.auth-notice')?.textContent).toContain(
        'Password reset successfully.',
      );
    });

    it('renders an error message from the store', () => {
      store.dispatch(
        AuthActions.resetPasswordFailure({
          error: { code: 'NOT_FOUND', message: 'Email address is not registered.' },
        }),
      );
      fixture.detectChanges();

      expect(html().querySelector('.auth-error')?.textContent).toContain(
        'Email address is not registered.',
      );
    });

    it('disables the submit button until the form is valid', () => {
      const button = html().querySelector('.submit-button') as HTMLButtonElement;
      expect(button.disabled).toBeTrue();

      component.ForgotPasswordForm.setValue(validValue);
      fixture.detectChanges();
      expect(button.disabled).toBeFalse();
    });

    it('shows the loading label while resetting', () => {
      component.ForgotPasswordForm.setValue(validValue);
      store.dispatch(AuthActions.resetPassword({ request: validValue }));
      fixture.detectChanges();

      const button = html().querySelector('.submit-button') as HTMLButtonElement;
      expect(button.textContent).toContain('Resetting Password...');
    });
  });
});
