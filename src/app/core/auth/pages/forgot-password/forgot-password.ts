import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { AuthSidePanelComponent } from '../../components/auth-side-panel/auth-side-panel';
import { ForgotPasswordPanelConfig } from '../../data/auth-page.data';
import { AuthFacade } from '../../facades/auth.facade';
import { ResetPasswordRequest } from '../../models/auth.models';
import { cashflowPasswordPattern, passwordMatchValidator } from '../../utility/auth.validators';

@Component({
  selector: 'app-cf-forgot-password',
  imports: [AsyncPipe, AuthSidePanelComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword {
  // DEPENDENCIES
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authFacade = inject(AuthFacade);
  private readonly destroyRef = inject(DestroyRef);

  // SIDE PANEL
  readonly sidePanelConfig = ForgotPasswordPanelConfig;

  // FACADE STATE
  readonly loading$ = this.authFacade.resetPasswordLoading$;
  readonly successMessage$ = this.authFacade.resetPasswordMessage$;
  readonly error$ = this.authFacade.resetPasswordError$;

  showPassword = false;

  // RESET PASSWORD FORM
  readonly ForgotPasswordForm = this.fb.nonNullable.group(
    {
      email: ['', [Validators.required, Validators.email]],
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern(cashflowPasswordPattern)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator('newPassword', 'confirmPassword') },
  );

  constructor() {
    this.authFacade.clearResetPasswordState();
    this.authFacade.resetPasswordSuccess$
      .pipe(filter(Boolean), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.router.navigate(['/']));
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
  onSubmit(): void {
    this.ForgotPasswordForm.markAllAsTouched();
    if (this.ForgotPasswordForm.invalid) {
      return;
    }
    const request: ResetPasswordRequest = this.ForgotPasswordForm.getRawValue();
    this.authFacade.resetPassword(request);
  }
  isEmailRequired(): boolean {
    const control = this.ForgotPasswordForm.controls.email;
    return control.touched && control.hasError('required');
  }
  isEmailInvalid(): boolean {
    const control = this.ForgotPasswordForm.controls.email;
    return control.touched && control.hasError('email');
  }
  isNewPasswordRequired(): boolean {
    const control = this.ForgotPasswordForm.controls.newPassword;
    return control.touched && control.hasError('required');
  }
  isNewPasswordMinLengthInvalid(): boolean {
    const control = this.ForgotPasswordForm.controls.newPassword;
    return control.touched && control.hasError('minlength');
  }
  hasMinLength(): boolean {
    return this.ForgotPasswordForm.controls.newPassword.value.length >= 8;
  }
  hasUppercase(): boolean {
    return /[A-Z]/.test(this.ForgotPasswordForm.controls.newPassword.value);
  }
  hasLowercase(): boolean {
    return /[a-z]/.test(this.ForgotPasswordForm.controls.newPassword.value);
  }
  hasNumber(): boolean {
    return /[0-9]/.test(this.ForgotPasswordForm.controls.newPassword.value);
  }
  hasSpecialCharacter(): boolean {
    return /[^A-Za-z0-9]/.test(this.ForgotPasswordForm.controls.newPassword.value);
  }
  isConfirmPasswordRequired(): boolean {
    const control = this.ForgotPasswordForm.controls.confirmPassword;
    return control.touched && control.hasError('required');
  }
  isPasswordMismatch(): boolean {
    const control = this.ForgotPasswordForm.controls.confirmPassword;
    return control.touched && control.value.length > 0 && this.ForgotPasswordForm.hasError('passwordMismatch');
  }
}