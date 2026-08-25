import { Component, DestroyRef, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LayoutService } from '../services/layout';
import { DatePickerComponent, DateRange } from '../../../shared/ui/date-picker/date-picker';
import { AuthFacade } from '../../auth/facades/auth.facade';

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
    console.log('Selected date range:', range);
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    const searchValue = input.value.trim();
    console.log('Search:', searchValue);
  }

  openFilter(): void {
    void this.router.navigate(['/dashboard/filter']);
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
