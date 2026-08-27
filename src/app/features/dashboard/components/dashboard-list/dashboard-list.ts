import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faMugHot,
  faA,
  faCar,
  faFilm,
  faCartShopping,
  faSackDollar,
  faLaptopCode,
  faChartColumn,
  faBuildingColumns,
  faArrowRightArrowLeft,
  faUtensils,
  faGasPump,
  faMobileScreen,
  faKitMedical,
  faBolt,
  faWifi,
  faCreditCard,
  faShieldHalved,
  faCircleXmark,
  faCircleQuestion,
} from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { TransactionItem } from '../transaction-item/transaction-item';
import { DashboardItem } from '../../models/dashboard.models';

@Component({
  selector: 'app-cf-dashboard-list',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, TransactionItem],
  templateUrl: './dashboard-list.html',
  styleUrl: './dashboard-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardList {
  // Inputs for title, item array, and UI action flags
  readonly title = input<string>('');
  readonly items = input<DashboardItem[]>([]);
  readonly showAddReminder = input<boolean>(false);
  readonly showViewAll = input<boolean>(false);
  readonly isLoading = input<boolean>(false);
  readonly hasError = input<boolean>(false);
  readonly retry = output<void>();
  readonly addReminder = output<void>();
  readonly viewAll = output<void>();
  // Icon lookup map for dashboard transaction/bill items
  readonly icons: Record<string, IconDefinition> = {
    'fa-mug-hot': faMugHot,
    'fa-a': faA,
    'fa-car': faCar,
    'fa-film': faFilm,
    'fa-cart-shopping': faCartShopping,
    'fa-sack-dollar': faSackDollar,
    'fa-laptop-code': faLaptopCode,
    'fa-chart-column': faChartColumn,
    'fa-building-columns': faBuildingColumns,
    'fa-arrow-right-arrow-left': faArrowRightArrowLeft,
    'fa-utensils': faUtensils,
    'fa-gas-pump': faGasPump,
    'fa-mobile-screen': faMobileScreen,
    'fa-kit-medical': faKitMedical,
    'fa-bolt': faBolt,
    'fa-wifi': faWifi,
    'fa-credit-card': faCreditCard,
    'fa-shield-halved': faShieldHalved,
    'fa-circle-question': faCircleQuestion,
  };
  readonly errorIcon = faCircleXmark;
  // Emits retry event on load failure
  onRetry(): void {
    this.retry.emit();
  }
}
