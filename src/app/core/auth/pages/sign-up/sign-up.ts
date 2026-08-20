import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthSidePanelComponent } from '../../components/auth-side-panel/auth-side-panel';
import { AuthFacade } from '../../facades/auth.facade';
import { RegisterRequest } from '../../models/auth.models';
import { signUpPanelConfig } from '../../data/auth-page.data';
import { cashflowPasswordPattern, passwordMatchValidator } from '../../utility/auth.validators';
@Component({
  selector: 'app-cf-sign-up',
  imports: [AsyncPipe, ReactiveFormsModule, RouterLink, AuthSidePanelComponent],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.scss',
})
export class SignUp {
  // DEPENDENCIES
  private readonly fb = inject(FormBuilder)
  private readonly authFacade = inject(AuthFacade);
  readonly loading$ = this.authFacade.loading$;
  readonly error$ = this.authFacade.error$;
  readonly successMessage$ = this.authFacade.successMessage$;
  showPassword = false;
  showConfirmPassword = false;
  // SIDE PANEL
  readonly sidePanelConfig = signUpPanelConfig;
  // SIGN UP FORM
  readonly SignUpForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.pattern(cashflowPasswordPattern)]],
    confirmPassword: ['', [Validators.required]],
    termsAccepted: [false, Validators.requiredTrue],
  }, { validators: passwordMatchValidator('password', 'confirmPassword') });
  // PASSWORD VISIBILITY
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  // SIGN UP
  submit(): void {
    if (this.SignUpForm.invalid) {
      this.SignUpForm.markAllAsTouched();
      return;
    }
    const request: RegisterRequest = this.SignUpForm.getRawValue();
    this.authFacade.register(request);
  }
}
