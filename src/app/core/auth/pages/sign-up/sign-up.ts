import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthSidePanelComponent } from '../../components/auth-side-panel/auth-side-panel';
import { SignUpRequest } from '../../models/auth.models';
import { SignUppanel } from '../../data/dummy-auth.data';
@Component({
  selector: 'app-cf-sign-up',
  imports: [ReactiveFormsModule, RouterLink, AuthSidePanelComponent],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.scss',
})
export class SignUp {
  // DEPENDENCIES
  private readonly fb = inject(FormBuilder)
  // UI STATE
  showPassword = false;
  showConfirmPassword = false;
  signUpSuccess = '';
  signUpError = '';
  isSubmitting = false;
  // SIDE PANEL
  readonly sidePanelConfig = SignUppanel;
  // SIGN UP FORM
  readonly SignUpForm = this.fb.nonNullable.group({
    fullname: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
    terms: [false, Validators.requiredTrue],
  });
  // PASSWORD VISIBILITY
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  // SIGN UP
  submit(): void {
    // Clear previous messages
    this.signUpError = '';
    this.signUpSuccess = '';
    // Validate form
    if (this.SignUpForm.invalid) {
      this.SignUpForm.markAllAsTouched();
      return;
    }
    // Get form data
    const request: SignUpRequest = this.SignUpForm.getRawValue();
    console.log('Sign Up Request:', request);
    // Check passwords
    if (request.password !== request.confirmPassword) {
      this.signUpError = 'Passwords do not match.';

      return;
    }
    // Loading state
    this.isSubmitting = true;
    // Dummy Sign Up
    setTimeout(() => {
      console.log('Dummy sign up successful');
      this.signUpSuccess = 'Account created successfully!';
      this.isSubmitting = false;
    }, 2000);
  }
}
