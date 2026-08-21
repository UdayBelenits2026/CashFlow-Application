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
  selector: 'app-cf-quick-action-item',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './quick-action-item.html',
  styleUrl: './quick-action-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickActionItem {
  readonly action = input<QuickAction>({ id: '', title: '', icon: 'fa-arrow-trend-up' });
  readonly icons: Record<string, any> = {
    'fa-arrow-trend-up': faArrowTrendUp,
    'fa-arrow-trend-down': faArrowTrendDown,
    'fa-cloud-arrow-up': faCloudArrowUp,
    'fa-wallet': faWallet,
    'fa-arrow-right-arrow-left': faArrowRightArrowLeft,
    'fa-chart-column': faChartColumn,
  };
}
