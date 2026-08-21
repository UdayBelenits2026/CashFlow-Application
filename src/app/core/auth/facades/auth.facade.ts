import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { AuthUser, LoginRequest, RegisterRequest } from '../models/auth.models';
import * as AuthActions from '../store/actions/auth.actions';
import * as AuthSelectors from '../store/selectors/auth.selectors';
import { AuthTokenService } from '../services/auth-token.service';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly store = inject(Store);
  private readonly tokenService = inject(AuthTokenService);

  readonly user$ = this.store.select(AuthSelectors.selectUser);
  readonly accessToken$ = this.store.select(AuthSelectors.selectAccessToken);
  readonly isAuthenticated$ = this.store.select(AuthSelectors.selectIsAuthenticated);
  readonly loading$ = this.store.select(AuthSelectors.selectLoading);
  readonly error$ = this.store.select(AuthSelectors.selectError);
  readonly successMessage$ = this.store.select(AuthSelectors.selectSuccessMessage);

  login(request: LoginRequest): void { this.store.dispatch(AuthActions.login({ request })); }
  register(request: RegisterRequest): void { this.store.dispatch(AuthActions.register({ request })); }
  logout(): void { this.store.dispatch(AuthActions.logout()); }
  isAuthenticated(): boolean { return this.tokenService.isAuthenticated(); }
  currentUser(): AuthUser | null { return this.tokenService.getUser(); }
  clearError(): void { this.store.dispatch(AuthActions.clearAuthError()); }
}
  