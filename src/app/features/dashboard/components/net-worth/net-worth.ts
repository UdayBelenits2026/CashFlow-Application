import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-cf-net-worth',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FontAwesomeModule],
  templateUrl: './net-worth.html',
  styleUrl: './net-worth.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NetWorth {
  // Inputs for title, total assets, liabilities, loading and error indicators
  readonly title = input<string>('Net Worth');
  readonly totalAssets = input<number>(95400);
  readonly totalLiabilities = input<number>(32100);
  readonly isLoading = input<boolean>(false);
  readonly hasError = input<boolean>(false);
  readonly retry = output<void>();
  readonly errorIcon = faCircleXmark;
  // Computed check if net worth assets and liabilities are empty
  readonly isEmpty = computed(() => this.totalAssets() === 0 && this.totalLiabilities() === 0);
  // Emits retry event on load failure
  onRetry(): void {
    this.retry.emit();
  }
  // Calculates net worth as assets minus liabilities
  currentNetWorth(): number {
    return this.totalAssets() - this.totalLiabilities();
  }
}
