import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  readonly isSidebarCollapsed = signal(false);
  readonly isMobileMenuOpen = signal(false);
  toggleSidebar(): void {
    this.isSidebarCollapsed.update(isCollapsed => !isCollapsed);
  }
  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(isOpen => !isOpen);
  }
  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }
  openMobileMenu(): void {
    this.isMobileMenuOpen.set(true);
  }
}