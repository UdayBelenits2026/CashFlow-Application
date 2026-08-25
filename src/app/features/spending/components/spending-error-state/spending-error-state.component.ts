import { ChangeDetectionStrategy, Component, input, output, InputSignal, OutputEmitterRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spending-error-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spending-error-state.component.html',
  styleUrl: './spending-error-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpendingErrorStateComponent {
  readonly title: InputSignal<string> = input<string>('Unable to load spending data');
  readonly message: InputSignal<string> = input<string>("We couldn't reach the server. Please make sure the backend is running, then try again.");
  readonly retry: OutputEmitterRef<void> = output<void>();

  onRetry(): void {
    this.retry.emit();
  }
}
