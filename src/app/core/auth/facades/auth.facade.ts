import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { LoginRequest, RegisterRequest } from '../models/auth.models';
import * as AuthActions from '../store/auth.actions';
import * as AuthSelectors from '../store/auth.selectors';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly store = inject(Store);
  readonly user$ = this.store.select(AuthSelectors.selectUser);
  readonly isAuthenticated$ = this.store.select(AuthSelectors.selectIsAuthenticated);
  readonly loading$ = this.store.select(AuthSelectors.selectLoading);
  readonly error$ = this.store.select(AuthSelectors.selectError);
  readonly successMessage$ = this.store.select(AuthSelectors.selectSuccessMessage);
  login(request: LoginRequest): void { this.store.dispatch(AuthActions.login({ request })); }
  register(request: RegisterRequest): void { this.store.dispatch(AuthActions.register({ request })); }
  clearError(): void { this.store.dispatch(AuthActions.clearAuthError()); }
}
  