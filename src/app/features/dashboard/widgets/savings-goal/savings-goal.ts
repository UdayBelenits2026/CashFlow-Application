import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPiggyBank, faCalendarDays, faCircleXmark } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-cf-savings-goal',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FontAwesomeModule],
  templateUrl: './savings-goal.html',
  styleUrl: './savings-goal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SavingsGoal {
  // Inputs for title, goal metrics, loading and error indicators
  readonly title = input<string>('Savings Goal');
  readonly goalName = input<string>('Emergency Fund');
  readonly savedAmount = input<number>(12850);
  readonly targetAmount = input<number>(20000);
  readonly dueDate = input<string>('Dec 2026');
  readonly isLoading = input<boolean>(false);
  readonly hasError = input<boolean>(false);
  readonly retry = output<void>();
  readonly errorIcon = faCircleXmark;
  readonly goalIcon = faPiggyBank;
  readonly calendarIcon = faCalendarDays;
  // Computed checks if goal name or target amount is empty
  readonly isEmpty = computed(() => !this.goalName() || this.targetAmount() <= 0);
  // Calculates remaining amount needed to reach target goal
  readonly remainingAmount = computed(() => Math.max(0, this.targetAmount() - this.savedAmount()));
  // Emits retry event on load failure
  onRetry(): void {
    this.retry.emit();
  }
  // Calculates progress percentage towards savings target
  progressPercent(): number {
    const target = this.targetAmount();
    if (target <= 0) {
      return 0;
    }
    return Math.min(100, Math.round((this.savedAmount() / target) * 100));
  }
}
