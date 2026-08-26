import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { BudgetCategoryProgress } from '../../models/dashboard.models';

@Component({
  selector: 'app-cf-budget-overview',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './budget-overview.html',
  styleUrl: './budget-overview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetOverview {
  // Input properties for title, categories, loading and error states
  readonly title = input<string>('Budget Overview');
  readonly categories = input<BudgetCategoryProgress[]>([]);
  readonly isLoading = input<boolean>(false);
  readonly hasError = input<boolean>(false);
  readonly retry = output<void>();
  readonly errorIcon = faCircleXmark;
  // Emits retry event on load failure
  onRetry(): void {
    this.retry.emit();
  }
  // Calculates percentage progress spent against category limit
  progressPercent(item: BudgetCategoryProgress): number {
    if (item.limit <= 0) {
      return 0;
    }
    return Math.min(100, Math.round((item.spent / item.limit) * 100));
  }
}
