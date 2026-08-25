import { ChangeDetectionStrategy, Component, input, output, InputSignal, OutputEmitterRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-income-error-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './income-error-state.component.html',
  styleUrl: './income-error-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncomeErrorStateComponent {
  readonly title: InputSignal<string> = input<string>('Unable to load income data');
  readonly message: InputSignal<string> = input<string>(
    "We couldn't reach the server. Please make sure the backend is running, then try again."
  );
  readonly retry: OutputEmitterRef<void> = output<void>();

  onRetry(): void {
    this.retry.emit();
  }
}
