import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthSidePanelComponent } from '../../components/auth-side-panel/auth-side-panel';
import { AuthFacade } from '../../facades/auth.facade';
import { sidePanelConfig } from '../../data/auth-page.data';
import { LoginRequest } from '../../models/auth.models';
@Component({
  selector: 'app-cf-sign-in',
  imports: [AsyncPipe, ReactiveFormsModule, RouterLink, AuthSidePanelComponent],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.scss',
})
export class SignInComponent {
  // DEPENDENCIES
  private readonly fb = inject(FormBuilder);
  private readonly authFacade = inject(AuthFacade);
  readonly loading$ = this.authFacade.loading$;
  readonly error$ = this.authFacade.error$;
  showPassword:boolean = false;
  // SIDE PANEL
  readonly sidePanelConfig = sidePanelConfig;
  // SIGN IN FORM
  readonly SignInform = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    rememberMe: [false],
  });
  // PASSWORD VISIBILITY
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
  // SIGN IN
  submit(): void {
    if (this.SignInform.invalid) {
      this.SignInform.markAllAsTouched();
      return;
    }
    const { email, password } = this.SignInform.getRawValue();
    const request: LoginRequest = { email, password };
    this.authFacade.login(request);
  }
}
