import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { AuthSidePanelComponent } from '../../components/auth-side-panel/auth-side-panel';
import { ForgotPasswordPanelConfig } from '../../data/auth-page.data';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-cf-forgot-password',
  imports: [AuthSidePanelComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword {
  readonly sidePanelConfig = ForgotPasswordPanelConfig;
  private readonly fb = inject(FormBuilder);
  showPassword = false;

  readonly ForgotPasswordForm = this.fb.nonNullable.group(
    {
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    {
      validators: this.passwordMatchValidator(),
    },
  );

  private passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const newPassword = control.get('newPassword')?.value;
      const confirmPassword = control.get('confirmPassword')?.value;

      if (!newPassword || !confirmPassword) {
        return null;
      }

      if (newPassword !== confirmPassword) {
        return { passwordMismatch: true };
      }

      return null;
    };
  }

  togglePasword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.ForgotPasswordForm.markAllAsTouched();

    if (this.ForgotPasswordForm.invalid) {
      return;
    }

    console.log('Password reset form:', this.ForgotPasswordForm.value);
  }

  isNewPasswordRequired(): boolean {
    const value = this.ForgotPasswordForm.controls.newPassword.value;
    return !value && this.ForgotPasswordForm.controls.newPassword.touched;
  }

  isNewPasswordMinLengthInvalid(): boolean {
    const control = this.ForgotPasswordForm.controls.newPassword;
    return control.touched && control.hasError('minlength');
  }

  hasMinLength(): boolean {
    return this.ForgotPasswordForm.controls.newPassword.value.length >= 8;
  }

  hasUppercase(): boolean {
    const value = this.ForgotPasswordForm.controls.newPassword.value;
    return /[A-Z]/.test(value);
  }

  hasLowercase(): boolean {
    const value = this.ForgotPasswordForm.controls.newPassword.value;
    return /[a-z]/.test(value);
  }

  hasNumber(): boolean {
    const value = this.ForgotPasswordForm.controls.newPassword.value;
    return /[0-9]/.test(value);
  }

  hasSpecialCharacter(): boolean {
    const value = this.ForgotPasswordForm.controls.newPassword.value;
    return /[^A-Za-z0-9]/.test(value);
  }

  isConfirmPasswordRequired(): boolean {
    const control = this.ForgotPasswordForm.controls.confirmPassword;
    return control.touched && control.hasError('required');
  }

  isPasswordMismatch(): boolean {
    const control = this.ForgotPasswordForm.controls.confirmPassword;
    const value = control.value;

    return (
      control.touched && value.length > 0 && this.ForgotPasswordForm.hasError('passwordMismatch')
    );
  }

  isPasswordValid(): boolean {
    const value = this.ForgotPasswordForm.controls.newPassword.value;

    return (
      value.length >= 8 &&
      /[A-Z]/.test(value) &&
      /[a-z]/.test(value) &&
      /[0-9]/.test(value) &&
      /[^A-Za-z0-9]/.test(value)
    );
  }
}
