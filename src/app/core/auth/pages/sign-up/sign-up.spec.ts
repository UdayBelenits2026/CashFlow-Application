import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideStore, Store } from '@ngrx/store';
import { provideRouter } from '@angular/router';

import { SignUp } from './sign-up';
import { authReducer } from '../../store/reducer/auth.reducer';
import * as AuthActions from '../../store/actions/auth.actions';
import { AuthError, RegisterRequest } from '../../models/auth.models';

describe('SignUp', () => {
  let component: SignUp;
  let fixture: ComponentFixture<SignUp>;
  let store: Store;

  const validValue: RegisterRequest = {
    fullName: 'John Doe',
    email: 'john@example.com',
    password: 'Password@123',
    confirmPassword: 'Password@123',
    termsAccepted: true,
  };

  const fillValidForm = () => component.SignUpForm.setValue(validValue);
  const html = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignUp],
      providers: [provideStore({ auth: authReducer }), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SignUp);
    component = fixture.componentInstance;
    store = TestBed.inject(Store);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // FORM SETUP
  // ---------------------------------------------------------------------------
  describe('form', () => {
    it('starts invalid and empty', () => {
      expect(component.SignUpForm.invalid).toBeTrue();
      expect(component.SignUpForm.getRawValue()).toEqual({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        termsAccepted: false,
      });
    });

    it('validates fullName as required with a 2 char minimum', () => {
      const fullName = component.SignUpForm.controls.fullName;
      fullName.setValue('');
      expect(fullName.hasError('required')).toBeTrue();
      fullName.setValue('A');
      expect(fullName.hasError('minlength')).toBeTrue();
      fullName.setValue('Al');
      expect(fullName.valid).toBeTrue();
    });

    it('validates email as required and well-formed', () => {
      const email = component.SignUpForm.controls.email;
      email.setValue('');
      expect(email.hasError('required')).toBeTrue();
      email.setValue('bad');
      expect(email.hasError('email')).toBeTrue();
      email.setValue('john@example.com');
      expect(email.valid).toBeTrue();
    });

    it('validates password against the cashflow pattern', () => {
      const password = component.SignUpForm.controls.password;
      password.setValue('');
      expect(password.hasError('required')).toBeTrue();
      password.setValue('weakpass');
      expect(password.hasError('pattern')).toBeTrue();
      password.setValue('Password@123');
      expect(password.valid).toBeTrue();
    });

    it('requires the confirm password field', () => {
      const confirm = component.SignUpForm.controls.confirmPassword;
      confirm.setValue('');
      expect(confirm.hasError('required')).toBeTrue();
    });

    it('requires the terms to be accepted', () => {
      const terms = component.SignUpForm.controls.termsAccepted;
      expect(terms.hasError('required')).toBeTrue();
      terms.setValue(true);
      expect(terms.valid).toBeTrue();
    });

    it('flags a password mismatch at the form level', () => {
      component.SignUpForm.patchValue({
        password: 'Password@123',
        confirmPassword: 'Different@123',
      });
      expect(component.SignUpForm.hasError('passwordMismatch')).toBeTrue();
    });

    it('is valid with matching passwords and accepted terms', () => {
      fillValidForm();
      expect(component.SignUpForm.valid).toBeTrue();
    });
  });

  // ---------------------------------------------------------------------------
  // PASSWORD VISIBILITY
  // ---------------------------------------------------------------------------
  describe('password visibility', () => {
    it('toggles the password field', () => {
      expect(component.showPassword).toBeFalse();
      component.togglePassword();
      expect(component.showPassword).toBeTrue();
    });

    it('toggles the confirm password field', () => {
      expect(component.showConfirmPassword).toBeFalse();
      component.toggleConfirmPassword();
      expect(component.showConfirmPassword).toBeTrue();
    });

    it('reflects the toggle on the password input type', () => {
      const input = html().querySelector('#password') as HTMLInputElement;
      expect(input.type).toBe('password');
      component.togglePassword();
      fixture.detectChanges();
      expect(input.type).toBe('text');
    });
  });

  // ---------------------------------------------------------------------------
  // SUBMIT
  // ---------------------------------------------------------------------------
  describe('submit', () => {
    it('marks the form touched and does not register when invalid', () => {
      const dispatchSpy = spyOn(store, 'dispatch');

      component.submit();

      expect(component.SignUpForm.touched).toBeTrue();
      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('dispatches register with the raw value when valid', () => {
      fillValidForm();
      const dispatchSpy = spyOn(store, 'dispatch');

      component.submit();

      expect(dispatchSpy).toHaveBeenCalledWith(
        AuthActions.register({ request: validValue }),
      );
    });
  });

  // ---------------------------------------------------------------------------
  // TEMPLATE
  // ---------------------------------------------------------------------------
  describe('template', () => {
    it('renders the side panel', () => {
      expect(html().querySelector('app-cf-auth-side-panel')).toBeTruthy();
    });

    it('shows full name validation errors', () => {
      const fullName = component.SignUpForm.controls.fullName;
      fullName.markAsTouched();
      fixture.detectChanges();
      expect(html().textContent).toContain('Full name is required.');

      fullName.setValue('A');
      fixture.detectChanges();
      expect(html().textContent).toContain('Full name must be at least 2 characters.');
    });

    it('shows email validation errors', () => {
      const email = component.SignUpForm.controls.email;
      email.markAsTouched();
      fixture.detectChanges();
      expect(html().textContent).toContain('Email address is required.');

      email.setValue('bad');
      fixture.detectChanges();
      expect(html().textContent).toContain('Please enter a valid email address.');
    });

    it('shows the password required error', () => {
      const password = component.SignUpForm.controls.password;
      password.markAsTouched();
      fixture.detectChanges();
      expect(html().textContent).toContain('Password is required.');
    });

    it('shows the confirm password required error', () => {
      const confirm = component.SignUpForm.controls.confirmPassword;
      confirm.markAsTouched();
      fixture.detectChanges();
      expect(html().textContent).toContain('Please confirm your password.');
    });

    it('shows the terms validation error', () => {
      const terms = component.SignUpForm.controls.termsAccepted;
      terms.markAsTouched();
      fixture.detectChanges();
      expect(html().textContent).toContain('You must accept the Terms & Conditions.');
    });

    it('renders a registration error from the store', () => {
      const error: AuthError = { code: 'DUP', message: 'Email already in use.' };
      store.dispatch(AuthActions.registerFailure({ error }));
      fixture.detectChanges();

      const errorEl = html().querySelector('.auth-error');
      expect(errorEl?.textContent).toContain('Email already in use.');
    });

    it('disables the submit button until the form is valid', () => {
      const button = html().querySelector('.submit-button') as HTMLButtonElement;
      expect(button.disabled).toBeTrue();

      fillValidForm();
      fixture.detectChanges();
      expect(button.disabled).toBeFalse();
    });

    it('shows the loading label while creating the account', () => {
      fillValidForm();
      store.dispatch(AuthActions.register({ request: validValue }));
      fixture.detectChanges();

      const button = html().querySelector('.submit-button') as HTMLButtonElement;
      expect(button.textContent).toContain('Creating Account...');
    });
  });
});
