import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowTrendUp,
  faArrowTrendDown,
  faCloudArrowUp,
  faWallet,
  faArrowRightArrowLeft,
  faChartColumn,
} from '@fortawesome/free-solid-svg-icons';
import { QuickAction } from '../../models/dashboard.models';

@Component({
  selector: 'app-cf-quick-actions',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './quick-actions.html',
  styleUrl: './quick-actions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickActions {
  // Inputs for quick actions title; default quick actions defined in UI
  readonly title = input<string>('Quick Actions');
  readonly actions = input<QuickAction[]>([
    { id: 'add-income', title: 'Add Income', icon: 'fa-arrow-trend-up' },
    { id: 'add-expense', title: 'Add Expense', icon: 'fa-arrow-trend-down' },
    { id: 'upload-statement', title: 'Upload Statement', icon: 'fa-cloud-arrow-up' },
    { id: 'create-budget', title: 'Create Budget', icon: 'fa-wallet' },
    { id: 'transfer-funds', title: 'Transfer Funds', icon: 'fa-arrow-right-arrow-left' },
    { id: 'view-reports', title: 'View Reports', icon: 'fa-chart-column' },
  ]);
  // FontAwesome icon map for quick action widget
  readonly icons: Record<string, any> = {
    'fa-arrow-trend-up': faArrowTrendUp,
    'fa-arrow-trend-down': faArrowTrendDown,
    'fa-cloud-arrow-up': faCloudArrowUp,
    'fa-wallet': faWallet,
    'fa-arrow-right-arrow-left': faArrowRightArrowLeft,
    'fa-chart-column': faChartColumn,
  };
}
