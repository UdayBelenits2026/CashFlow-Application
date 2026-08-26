import { Component, OnInit, effect, inject } from '@angular/core';
import { Router } from '@angular/router';

import { LayoutService } from '../services/layout';
import { DatePickerComponent, DateRange } from '../../../shared/ui/date-picker/date-picker';
import { DashboardFacade } from '../../../features/dashboard/facades/dashboard.facade';

@Component({
  selector: 'app-cf-mainnavbar',
  standalone: true,
  imports: [DatePickerComponent],
  templateUrl: './mainnavbar.html',
  styleUrl: './mainnavbar.scss',
})
export class Mainnavbar implements OnInit {
  readonly layoutService = inject(LayoutService);
  private readonly dashboardFacade = inject(DashboardFacade);
  private readonly router = inject(Router);

  // Keep the selected range in sync with the shared date picker.
  selectedDate: DateRange = this.getCurrentMonthRange();

  constructor() {
    effect(() => {
      const filters = this.dashboardFacade.activeFilters();
      if (filters?.fromDate && filters?.toDate) {
        const [y1, m1, d1] = filters.fromDate.split('-').map(Number);
        const [y2, m2, d2] = filters.toDate.split('-').map(Number);
        if (y1 && m1 && d1 && y2 && m2 && d2) {
          const start = new Date(y1, m1 - 1, d1);
          const end = new Date(y2, m2 - 1, d2);
          if (
            !this.selectedDate?.start ||
            !this.selectedDate?.end ||
            this.selectedDate.start.getTime() !== start.getTime() ||
            this.selectedDate.end.getTime() !== end.getTime()
          ) {
            this.selectedDate = { start, end };
          }
        }
      }
    });
  }

  ngOnInit(): void {
    if (this.selectedDate.start && this.selectedDate.end) {
      this.onDateChange(this.selectedDate);
    }
  }

  get isCustomizeActive(): boolean {
    return this.router.url.includes('/dashboard/customize');
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

    if (range.start && range.end) {
      const fromDate = this.formatDate(range.start);
      const toDate = this.formatDate(range.end);
      this.dashboardFacade.updateDateRange(fromDate, toDate);
    }
  }

  private formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    const searchValue = input.value.trim();

    console.log('Search:', searchValue);
  }

  toggleFilter(): void {
    this.layoutService.toggleFilter();
  }

  openCustomize(): void {
    void this.router.navigate(['/dashboard/customize']);
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
