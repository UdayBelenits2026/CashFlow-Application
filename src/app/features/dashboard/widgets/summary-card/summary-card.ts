import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SummaryCard } from '../../models/dashboard.models';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faWallet,
  faMoneyBillTransfer,
  faChartLine,
  faPiggyBank,
  faArrowUp,
  faArrowDown,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-cf-summary-card',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './summary-card.html',
  styleUrl: './summary-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryCardComponent {
  readonly data = input<SummaryCard>({
    id: 'income',
    title: '',
    amount: 0,
    percentage: 0,
    trend: 'up',
    comparison: '',
    icon: 'fa-wallet',
  });
  readonly hasError = input<boolean>(false);
  readonly isLoading = input<boolean>(false);
  readonly icons: Record<string, any> = {
    'fa-wallet': faWallet,
    'fa-money-bill-transfer': faMoneyBillTransfer,
    'fa-chart-line': faChartLine,
    'fa-piggy-bank': faPiggyBank,
  };
  readonly trendIcons = {
    up: faArrowUp,
    down: faArrowDown,
  };
  readonly errorIcon = faTriangleExclamation;
}
