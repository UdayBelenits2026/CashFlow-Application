import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleXmark, faRotateRight, faXmark } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-cf-error-banner',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './error-banner.html',
  styleUrl: './error-banner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorBannerComponent {
  readonly message = input<string>(
    "We couldn't load your dashboard data right now. Please refresh and try again.",
  );
  readonly showRetry = input<boolean>(true);
  readonly showDismiss = input<boolean>(true);

  readonly retry = output<void>();
  readonly dismiss = output<void>();

  readonly errorIcon = faCircleXmark;
  readonly retryIcon = faRotateRight;
  readonly closeIcon = faXmark;

  onRetry(): void {
    this.retry.emit();
  }

  onDismiss(): void {
    this.dismiss.emit();
  }
}
