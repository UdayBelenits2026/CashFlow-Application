import { Component, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LayoutService } from '../services/layout';
import { DatePickerComponent, DateRange } from '../../../shared/ui/date-picker/date-picker';
import { AuthFacade } from '../../auth/facades/auth.facade';
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
  private readonly authFacade = inject(AuthFacade);
  private readonly destroyRef = inject(DestroyRef);
  readonly pageTitle = signal('Dashboard');
  readonly isSearchOpen = signal(false);
  readonly isProfileMenuOpen = signal(false);
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

  private updateTitle(url: string): void {
    const path = url.split('?')[0].split('#')[0];

    switch (true) {
      case path.startsWith('/spending'):
        this.pageTitle.set('Spending');
        break;
      case path.startsWith('/transactions'):
        this.pageTitle.set('Transactions');
        break;
      case path.startsWith('/income'):
        this.pageTitle.set('Income');
        break;
      case path.startsWith('/cash-flow'):
        this.pageTitle.set('Cash Flow');
        break;
      case path.startsWith('/budget'):
        this.pageTitle.set('Budget');
        break;
      case path.startsWith('/goals'):
        this.pageTitle.set('Goals');
        break;
      case path.startsWith('/accounts'):
        this.pageTitle.set('Accounts');
        break;
      case path.startsWith('/reports'):
        this.pageTitle.set('Reports');
        break;
      case path.startsWith('/settings'):
        this.pageTitle.set('Settings');
        break;
      default:
        this.pageTitle.set('Dashboard');
        break;
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

  toggleSearch(): void {
    this.isSearchOpen.update((open) => !open);
    this.isProfileMenuOpen.set(false);
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen.update((open) => !open);
    this.isSearchOpen.set(false);
  }

  closeMenus(): void {
    this.isSearchOpen.set(false);
    this.isProfileMenuOpen.set(false);
  }

  goToProfile(): void {
    this.closeMenus();
    void this.router.navigate(['/settings']);
  }

  goToSettings(): void {
    this.closeMenus();
    void this.router.navigate(['/settings']);
  }

  logout(): void {
    this.closeMenus();
    this.authFacade.logout();
  }

  private getCurrentMonthRange(): DateRange {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start, end };
  }
}