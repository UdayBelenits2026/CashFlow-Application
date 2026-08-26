import { Component, inject, Signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { timer } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { IncomeFacade } from '../../../facades/income.facade';
import { IncomeErrorStateComponent } from '../../../components/income-error-state/income-error-state.component';

@Component({
  selector: 'app-income',
  standalone: true,
  imports: [CommonModule, RouterOutlet, IncomeErrorStateComponent],
  templateUrl: './income-shell.html',
  styleUrl: './income-shell.scss'
})
export class IncomeShell {
  private readonly facade: IncomeFacade = inject(IncomeFacade);
  readonly error: Signal<string | null> = toSignal(this.facade.error$, { initialValue: null });
  readonly successMessage: Signal<string | null> = toSignal(this.facade.successMessage$, { initialValue: null });
  readonly hasData: Signal<boolean> = toSignal(this.facade.hasData$, { initialValue: false });

  constructor() {
    // Auto-dismiss success toasts after a short delay.
    this.facade.successMessage$
      .pipe(
        filter((msg): msg is string => !!msg),
        switchMap(() => timer(4000)),
        takeUntilDestroyed()
      )
      .subscribe(() => this.facade.clearFeedback());
  }

  onRetry(): void {
    this.facade.loadDashboard();
  }

  dismissError(): void {
    this.facade.clearFeedback();
  }

  dismissSuccess(): void {
    this.facade.clearFeedback();
  }
}
