import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { IncomeFacade } from './facades/income.facade';
import { IncomeErrorStateComponent } from './components/income-error-state/income-error-state.component';

@Component({
  selector: 'app-income',
  standalone: true,
  imports: [CommonModule, RouterOutlet, IncomeErrorStateComponent],
  templateUrl: './income.component.html',
  styleUrl: './income.component.scss'
})
export class IncomeComponent {
  private readonly facade: IncomeFacade = inject(IncomeFacade);
  readonly error$: Observable<string | null> = this.facade.error$;
  readonly hasData$: Observable<boolean> = this.facade.hasData$;

  onRetry(): void {
    this.facade.loadDashboard();
  }

  dismissError(): void {
    this.facade.clearFeedback();
  }
}
