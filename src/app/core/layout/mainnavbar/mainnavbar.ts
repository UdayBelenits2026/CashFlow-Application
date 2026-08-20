import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

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

  // Keep the selected range in sync with the shared date picker.
  selectedDate: DateRange = this.getCurrentMonthRange();

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