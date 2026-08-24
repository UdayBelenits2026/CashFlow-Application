import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { IncomeSourceItem } from '../../models/dashboard.models';

@Component({
  selector: 'app-cf-income-by-source',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FontAwesomeModule],
  templateUrl: './income-by-source.html',
  styleUrl: './income-by-source.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncomeBySource {
  readonly title = input<string>('Income by Source');
  readonly sources = input<IncomeSourceItem[]>([]);
  readonly isLoading = input<boolean>(false);
  readonly hasError = input<boolean>(false);
  readonly retry = output<void>();
  readonly errorIcon = faCircleXmark;

  onRetry(): void {
    this.retry.emit();
  }

  totalIncome(): number {
    return this.sources().reduce((total, item) => total + item.amount, 0);
  }

  share(item: IncomeSourceItem): number {
    const total = this.totalIncome();
    if (total <= 0) {
      return 0;
    }

    return Math.round((item.amount / total) * 100);
  }
}
