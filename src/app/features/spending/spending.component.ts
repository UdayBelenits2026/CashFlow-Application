import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { SpendingFacade } from './facades/spending.facade';
import { SpendingErrorStateComponent } from './components/spending-error-state/spending-error-state.component';

@Component({
  selector: 'app-spending',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SpendingErrorStateComponent],
  templateUrl: './spending.component.html',
  styleUrl: './spending.component.scss'
})
export class SpendingComponent {
  private readonly facade: SpendingFacade = inject(SpendingFacade);
  readonly error$: Observable<string | null> = this.facade.error$;
  readonly hasData$: Observable<boolean> = this.facade.hasData$;

  onRetry(): void {
    this.facade.loadDashboard();
  }

  dismissError(): void {
    this.facade.clearFeedback();
  }
}


