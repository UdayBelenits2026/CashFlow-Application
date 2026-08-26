import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideStore, Store } from '@ngrx/store';
import { provideRouter } from '@angular/router';

import { SignInComponent } from './sign-in';
import { authReducer } from '../../store/reducer/auth.reducer';
import * as AuthActions from '../../store/actions/auth.actions';
import { AccountLockData, AuthError } from '../../models/auth.models';

describe('SignInComponent', () => {
  let component: SignInComponent;
  let fixture: ComponentFixture<SignInComponent>;
  let store: Store;

  const lock: AccountLockData = {
    lockedUntil: new Date(Date.now() + 60_000).toISOString(),
    retryAfterSeconds: 60,
    lockedAt: new Date().toISOString(),
    maxFailedAttempts: 5,
    failedLoginAttempts: 5,
  };

  const fillValidForm = () => {
    component.SignInform.setValue({
      email: 'user@example.com',
      password: 'Password@123',
      rememberMe: false,
    });
  };

  const html = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignInComponent],
      providers: [provideStore({ auth: authReducer }), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SignInComponent);
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
      expect(component.SignInform.invalid).toBeTrue();
      expect(component.SignInform.getRawValue()).toEqual({
        email: '',
        password: '',
        rememberMe: false,
      });
    });

    it('requires a valid email', () => {
      const email = component.SignInform.controls.email;
      email.setValue('');
      expect(email.hasError('required')).toBeTrue();
      email.setValue('not-an-email');
      expect(email.hasError('email')).toBeTrue();
      email.setValue('user@example.com');
      expect(email.valid).toBeTrue();
    });

    it('requires a password', () => {
      const password = component.SignInform.controls.password;
      password.setValue('');
      expect(password.hasError('required')).toBeTrue();
      password.setValue('anything');
      expect(password.valid).toBeTrue();
    });

    it('becomes valid with correct values', () => {
      fillValidForm();
      expect(component.SignInform.valid).toBeTrue();
    });
  });

  // ---------------------------------------------------------------------------
  // PASSWORD VISIBILITY
  // ---------------------------------------------------------------------------
  describe('togglePassword', () => {
    it('toggles the showPassword flag', () => {
      expect(component.showPassword).toBeFalse();
      component.togglePassword();
      expect(component.showPassword).toBeTrue();
      component.togglePassword();
      expect(component.showPassword).toBeFalse();
    });

    it('switches the password input type in the template', () => {
      const input = html().querySelector('#password') as HTMLInputElement;
      expect(input.getAttribute('type')).toBe('password');

      const toggle = html().querySelector('.password-toggle') as HTMLButtonElement;
      toggle.click();
      fixture.detectChanges();

      expect(input.getAttribute('type')).toBe('text');
    });
  });

  // ---------------------------------------------------------------------------
  // COUNTDOWN FORMAT
  // ---------------------------------------------------------------------------
  describe('formatCountdown', () => {
    it('formats null and zero as 00:00', () => {
      expect(component.formatCountdown(null)).toBe('00:00');
      expect(component.formatCountdown(0)).toBe('00:00');
    });

    it('clamps negative values to 00:00', () => {
      expect(component.formatCountdown(-30)).toBe('00:00');
    });

    it('formats seconds as MM:SS with zero padding', () => {
      expect(component.formatCountdown(5)).toBe('00:05');
      expect(component.formatCountdown(65)).toBe('01:05');
      expect(component.formatCountdown(600)).toBe('10:00');
    });
  });

  // ---------------------------------------------------------------------------
  // LOCK STATE
  // ---------------------------------------------------------------------------
  describe('account lock', () => {
    it('reports isLocked false when there is no lock', () => {
      expect(component.isLocked()).toBeFalse();
    });

    it('reports isLocked true once a lock is present', () => {
      store.dispatch(AuthActions.loginLocked({ lock }));
      expect(component.accountLock()).toEqual(lock);
      expect(component.isLocked()).toBeTrue();
    });
  });

  // ---------------------------------------------------------------------------
  // SUBMIT
  // ---------------------------------------------------------------------------
  describe('submit', () => {
    it('marks all controls as touched and does not dispatch login when invalid', () => {
      const dispatchSpy = spyOn(store, 'dispatch');

      component.submit();

      expect(component.SignInform.touched).toBeTrue();
      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('dispatches login with the request when the form is valid', () => {
      fillValidForm();
      const dispatchSpy = spyOn(store, 'dispatch');

      component.submit();

      expect(dispatchSpy).toHaveBeenCalledWith(
        AuthActions.login({
          request: { email: 'user@example.com', password: 'Password@123' },
        }),
      );
    });

    it('does not dispatch login while loading', () => {
      fillValidForm();
      store.dispatch(AuthActions.login({ request: { email: 'a@b.com', password: 'x' } }));
      expect(component.loading()).toBeTrue();

      const dispatchSpy = spyOn(store, 'dispatch');
      component.submit();

      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('does not dispatch login while the account is locked', () => {
      fillValidForm();
      store.dispatch(AuthActions.loginLocked({ lock }));
      expect(component.isLocked()).toBeTrue();

      const dispatchSpy = spyOn(store, 'dispatch');
      component.submit();

      expect(dispatchSpy).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // TEMPLATE
  // ---------------------------------------------------------------------------
  describe('template', () => {
    it('renders the side panel', () => {
      expect(html().querySelector('app-cf-auth-side-panel')).toBeTruthy();
    });

    it('shows the required error for a touched empty email', () => {
      const email = component.SignInform.controls.email;
      email.markAsTouched();
      fixture.detectChanges();

      expect(html().textContent).toContain('Email address is required.');
    });

    it('shows the email format error for an invalid touched email', () => {
      const email = component.SignInform.controls.email;
      email.setValue('bad');
      email.markAsTouched();
      fixture.detectChanges();

      expect(html().textContent).toContain('Please enter a valid email address.');
    });

    it('shows the required error for a touched empty password', () => {
      const password = component.SignInform.controls.password;
      password.markAsTouched();
      fixture.detectChanges();

      expect(html().textContent).toContain('Password is required.');
    });

    it('renders a session notice from the store', () => {
      store.dispatch(AuthActions.sessionExpired({ message: 'Session expired notice.' }));
      fixture.detectChanges();

      const notice = html().querySelector('.auth-notice');
      expect(notice?.textContent).toContain('Session expired notice.');
    });

    it('renders a login error when not locked', () => {
      const error: AuthError = { code: 'AUTH_401', message: 'Invalid credentials.' };
      store.dispatch(AuthActions.loginFailure({ error }));
      fixture.detectChanges();

      const errorEl = html().querySelector('.auth-error');
      expect(errorEl?.textContent).toContain('Invalid credentials.');
    });

    it('renders the locked banner and hides the login error when locked', () => {
      store.dispatch(AuthActions.loginFailure({ error: { code: 'E', message: 'nope' } }));
      store.dispatch(AuthActions.loginLocked({ lock }));
      fixture.detectChanges();

      expect(html().querySelector('.auth-lock')).toBeTruthy();
      expect(html().querySelector('.lock-timer')).toBeTruthy();
      expect(html().querySelector('.auth-error')).toBeNull();
    });

    it('disables the submit button while the form is invalid', () => {
      const button = html().querySelector('.submit-button') as HTMLButtonElement;
      expect(button.disabled).toBeTrue();
    });

    it('enables the submit button once the form is valid', () => {
      fillValidForm();
      fixture.detectChanges();

      const button = html().querySelector('.submit-button') as HTMLButtonElement;
      expect(button.disabled).toBeFalse();
    });

    it('shows the loading label while signing in', () => {
      fillValidForm();
      store.dispatch(AuthActions.login({ request: { email: 'a@b.com', password: 'x' } }));
      fixture.detectChanges();

      const button = html().querySelector('.submit-button') as HTMLButtonElement;
      expect(button.textContent).toContain('Signing In...');
      expect(button.querySelector('.spinner')).toBeTruthy();
    });
  });
});
