import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  readonly isSidebarCollapsed = signal(false);
  readonly isMobileMenuOpen = signal(false);
  readonly isFilterOpen = signal(false);
  toggleSidebar(): void {
    this.isSidebarCollapsed.update((isCollapsed) => !isCollapsed);
  }
  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((isOpen) => !isOpen);
  }
  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }
  openMobileMenu(): void {
    this.isMobileMenuOpen.set(true);
  }
  openFilter(): void {
    this.isFilterOpen.set(true);
  }
  closeFilter(): void {
    this.isFilterOpen.set(false);
  }
  toggleFilter(): void {
    this.isFilterOpen.update((isOpen) => !isOpen);
  }
}
