import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { map, of, switchMap, takeWhile, tap, timer } from 'rxjs';
import { AuthSidePanelComponent } from '../../components/auth-side-panel/auth-side-panel';
import { AuthFacade } from '../../facades/auth.facade';
import { sidePanelConfig } from '../../data/auth-page.data';
import { AccountLockData, LoginRequest } from '../../models/auth.models';
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
  readonly notice$ = this.authFacade.notice$;
  // ACCOUNT LOCK
  readonly accountLock$ = this.authFacade.accountLock$;
  // Server-driven countdown (seconds). Emits 0 when unlocked, then clears state.
  readonly remainingLockSeconds$ = this.accountLock$.pipe(
    switchMap((lock) => {
      if (!lock) {
        return of(0);
      }
      const lockEnd = this.resolveLockEnd(lock);
      return timer(0, 1000).pipe(
        map(() => Math.max(0, Math.ceil((lockEnd - Date.now()) / 1000))),
        takeWhile((seconds) => seconds > 0, true),
        tap((seconds) => {
          if (seconds <= 0) {
            this.authFacade.clearAccountLock();
          }
        }),
      );
    }),
    takeUntilDestroyed(),
  );
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
  // COUNTDOWN FORMAT (MM:SS)
  formatCountdown(totalSeconds: number | null): string {
    const seconds = Math.max(0, totalSeconds ?? 0);
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;
    return `${this.pad(minutes)}:${this.pad(rest)}`;
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

  private pad(value: number): string {
    return value.toString().padStart(2, '0');
  }

  // Resolve the absolute lock-end timestamp, preferring the backend lockedUntil
  // and falling back to retryAfterSeconds when the timestamp is unusable.
  private resolveLockEnd(lock: AccountLockData): number {
    const now = Date.now();
    const fallbackEnd = now + Math.max(0, lock.retryAfterSeconds) * 1000;
    const parsed = lock.lockedUntil ? Date.parse(lock.lockedUntil) : NaN;
    if (!Number.isNaN(parsed)) {
      const remainingMs = parsed - now;
      if (remainingMs > 0 && remainingMs <= (lock.retryAfterSeconds + 60) * 1000) {
        return parsed;
      }
    }
    return fallbackEnd;
  }
}
