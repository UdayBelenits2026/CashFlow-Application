import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faA,
  faArrowRightArrowLeft,
  faBolt,
  faBuildingColumns,
  faCar,
  faCartShopping,
  faChartColumn,
  faCircleQuestion,
  faCreditCard,
  faFilm,
  faGasPump,
  faKitMedical,
  faLaptopCode,
  faMobileScreen,
  faMugHot,
  faSackDollar,
  faShieldHalved,
  faUtensils,
  faWifi,
} from '@fortawesome/free-solid-svg-icons';
import { DashboardItem } from '../../models/dashboard.models';

@Component({
  selector: 'app-cf-transaction-item',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './transaction-item.html',
  styleUrl: './transaction-item.scss',
})
export class TransactionItem {
  readonly item = input<DashboardItem>({
    id: 0,
    title: '',
    date: '',
    amount: 0,
    icon: '',
    type: 'expense',
  });
  readonly absAmount = computed(() => Math.abs(this.item().amount));
  readonly fallbackIcon = faCircleQuestion;
  readonly icons: Record<string, any> = {
    'fa-a': faA,
    'fa-arrow-right-arrow-left': faArrowRightArrowLeft,
    'fa-bolt': faBolt,
    'fa-building-columns': faBuildingColumns,
    'fa-car': faCar,
    'fa-cart-shopping': faCartShopping,
    'fa-chart-column': faChartColumn,
    'fa-credit-card': faCreditCard,
    'fa-film': faFilm,
    'fa-gas-pump': faGasPump,
    'fa-kit-medical': faKitMedical,
    'fa-laptop-code': faLaptopCode,
    'fa-mobile-screen': faMobileScreen,
    'fa-mug-hot': faMugHot,
    'fa-sack-dollar': faSackDollar,
    'fa-shield-halved': faShieldHalved,
    'fa-utensils': faUtensils,
    'fa-wifi': faWifi,
  };
}
