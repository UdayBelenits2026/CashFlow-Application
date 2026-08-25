import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { AuthUser, LoginRequest, RegisterRequest, ResetPasswordRequest } from '../models/auth.models';
import * as AuthActions from '../store/actions/auth.actions';
import * as AuthSelectors from '../store/selectors/auth.selectors';
import { SessionService } from '../services/session.service';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly store = inject(Store);
  private readonly sessionService = inject(SessionService);

  readonly user$ = this.store.select(AuthSelectors.selectUser);
  readonly accessToken$ = this.store.select(AuthSelectors.selectAccessToken);
  readonly isAuthenticated$ = this.store.select(AuthSelectors.selectIsAuthenticated);
  readonly loading$ = this.store.select(AuthSelectors.selectLoading);
  readonly error$ = this.store.select(AuthSelectors.selectError);
  readonly accountLock$ = this.store.select(AuthSelectors.selectAccountLock);
  readonly successMessage$ = this.store.select(AuthSelectors.selectSuccessMessage);
  readonly notice$ = this.store.select(AuthSelectors.selectNotice);

  readonly resetPasswordLoading$ = this.store.select(AuthSelectors.selectResetPasswordLoading);
  readonly resetPasswordSuccess$ = this.store.select(AuthSelectors.selectResetPasswordSuccess);
  readonly resetPasswordMessage$ = this.store.select(AuthSelectors.selectResetPasswordMessage);
  readonly resetPasswordError$ = this.store.select(AuthSelectors.selectResetPasswordError);
  readonly resetPasswordData$ = this.store.select(AuthSelectors.selectResetPasswordData);

  login(request: LoginRequest): void { this.store.dispatch(AuthActions.login({ request })); }
  register(request: RegisterRequest): void { this.store.dispatch(AuthActions.register({ request })); }
  logout(): void { this.store.dispatch(AuthActions.logout()); }
  isAuthenticated(): boolean { return this.sessionService.isAuthenticated(); }
  currentUser(): AuthUser | null { return this.sessionService.getUser(); }
  clearError(): void { this.store.dispatch(AuthActions.clearAuthError()); }
  clearAccountLock(): void { this.store.dispatch(AuthActions.clearAccountLock()); }
  resetPassword(request: ResetPasswordRequest): void { this.store.dispatch(AuthActions.resetPassword({ request })); }
  clearResetPasswordState(): void { this.store.dispatch(AuthActions.clearResetPasswordState()); }
}
  