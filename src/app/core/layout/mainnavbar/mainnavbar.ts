import { Component, DestroyRef, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { LayoutService } from '../services/layout';
import { DatePickerComponent, DateRange } from '../../../shared/ui/date-picker/date-picker';

@Component({
  selector: 'app-cf-mainnavbar',
  standalone: true,
  imports: [DatePickerComponent],
  templateUrl: './mainnavbar.html',
  styleUrl: './mainnavbar.scss',
})
export class Mainnavbar {
  readonly layoutService = inject(LayoutService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly pageTitle = signal('Dashboard');

  // Keep the selected range in sync with the shared date picker.
  selectedDate: DateRange = this.getCurrentMonthRange();

  constructor() {
    this.updateTitle(this.router.url);
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        this.updateTitle(event.urlAfterRedirects || event.url);
      });
  }

  private updateTitle(url: string): void {
    if (url.includes('/spending/expenses')) {
      this.pageTitle.set('Expenses');
    } else if (url.includes('/spending/trends')) {
      this.pageTitle.set('Spending Trends');
    } else if (url.includes('/spending/calendar')) {
      this.pageTitle.set('Expense Calendar');
    } else if (url.includes('/spending/day-details')) {
      this.pageTitle.set('Day Details');
    } else if (url.includes('/spending/recurring')) {
      this.pageTitle.set('Recurring & Subscriptions');
    } else if (url.includes('/spending/insights')) {
      this.pageTitle.set('Spending Insights');
    } else if (url.includes('/spending/alerts')) {
      this.pageTitle.set('Spend Alerts');
    } else if (url.includes('/spending/tags')) {
      this.pageTitle.set('Spending Tags');
    } else if (url.includes('/spending')) {
      this.pageTitle.set('Spending Dashboard');
    } else if (url.includes('/transactions')) {
      this.pageTitle.set('Transactions');
    } else if (url.includes('/income')) {
      this.pageTitle.set('Income');
    } else if (url.includes('/cash-flow')) {
      this.pageTitle.set('Cash Flow');
    } else if (url.includes('/budget')) {
      this.pageTitle.set('Budget');
    } else if (url.includes('/goals')) {
      this.pageTitle.set('Goals');
    } else if (url.includes('/accounts')) {
      this.pageTitle.set('Accounts');
    } else if (url.includes('/reports')) {
      this.pageTitle.set('Reports');
    } else if (url.includes('/settings')) {
      this.pageTitle.set('Settings');
    } else {
      this.pageTitle.set('Dashboard');
    }
  }

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
    this.layoutService.closeMobileMenu();
  }

  toggleMobileMenu(): void {
    this.layoutService.toggleMobileMenu();
  }

  refresh(): void {
    window.location.reload();
  }

  onDateChange(range: DateRange): void {
    this.selectedDate = range;

    console.log('Selected date range:', range);

    // Connect this payload to API or store filtering when wiring real data.
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    const searchValue = input.value.trim();

    console.log('Search:', searchValue);
  }

  openFilter(): void {
    console.log('Open filter');
  }

  openCustomize(): void {
    console.log('Open customize');
  }

  exportData(): void {
    console.log('Export data');
  }

  openNotifications(): void {
    console.log('Open notifications');
  }

  openProfile(): void {
    console.log('Open profile');
  }

  private getCurrentMonthRange(): DateRange {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return { start, end };
  }
}
