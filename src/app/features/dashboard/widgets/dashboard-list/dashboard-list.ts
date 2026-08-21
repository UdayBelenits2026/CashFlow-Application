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
} from '@fortawesome/free-solid-svg-icons';
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
  readonly title = input<string>('');
  readonly items = input<DashboardItem[]>([]);
  readonly showAddReminder = input<boolean>(false);
  readonly isLoading = input<boolean>(false);
  readonly hasError = input<boolean>(false);
  readonly retry = output<void>();
  readonly icons: Record<string, any> = {
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
  };
  readonly errorIcon = faCircleXmark;

  onRetry(): void {
    this.retry.emit();
  }
}
