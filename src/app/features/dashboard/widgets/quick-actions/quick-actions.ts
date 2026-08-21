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
  readonly title = input<string>('Quick Actions');
  readonly actions = input<QuickAction[]>([]);
  readonly icons: Record<string, any> = {
    'fa-arrow-trend-up': faArrowTrendUp,
    'fa-arrow-trend-down': faArrowTrendDown,
    'fa-cloud-arrow-up': faCloudArrowUp,
    'fa-wallet': faWallet,
    'fa-arrow-right-arrow-left': faArrowRightArrowLeft,
    'fa-chart-column': faChartColumn,
  };
}
