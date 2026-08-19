import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AuthSidePanelComponent } from '../../components/auth-side-panel/auth-side-panel';
import { LoginRequest } from '../../models/auth.models';
import {
  DUMMY_LOGIN_DATA,
  DUMMY_LOGIN_CREDENTIALS,
  sidePanelConfig,
} from '../../data/dummy-auth.data';
@Component({
  selector: 'app-cf-sign-in',
  imports: [ReactiveFormsModule, RouterLink, AuthSidePanelComponent],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.scss',
})
export class SignInComponent {
  // DEPENDENCIES
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  // UI STATE
  showPassword = false;
  loginSuccess = '';
  loginError = '';
  isSubmitting = false;
  // SIDE PANEL
  readonly sidePanelConfig = sidePanelConfig;
  // SIGN IN FORM
  readonly SignInform = this.fb.nonNullable.group({
    email: [DUMMY_LOGIN_DATA.email, [Validators.required, Validators.email]],
    password: [DUMMY_LOGIN_DATA.password, [Validators.required, Validators.minLength(8)]],
    rememberMe: [DUMMY_LOGIN_DATA.rememberMe],
  });
  // PASSWORD VISIBILITY
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
  // SIGN IN
  async submit(): Promise<void> {
    // Clear previous messages
    this.loginError = '';
    this.loginSuccess = '';
    // Validate form
    if (this.SignInform.invalid) {
      this.SignInform.markAllAsTouched();
      return;
    }
    // Get form data
    const request: LoginRequest = this.SignInform.getRawValue();
    console.log('Sign In Request:', request);
    // Loading state
    this.isSubmitting = true;
    // Check dummy credentials
    const credentialsValid =
      request.email === DUMMY_LOGIN_CREDENTIALS.email &&
      request.password === DUMMY_LOGIN_CREDENTIALS.password;
    // Simulate asynchronous authentication
    const isValid = await firstValueFrom(of(credentialsValid).pipe(delay(2000)));
    // Invalid credentials
    if (!isValid) {
      this.loginError = 'Invalid email or password.';
      this.isSubmitting = false;
      return;
    }
    // Successful login
    console.log('Dummy login successful');
    this.loginSuccess = 'Sign in successful!';
    this.isSubmitting = false;
    // Navigate to dashboard
    await this.router.navigate(['/dashboard']);
  }
}
