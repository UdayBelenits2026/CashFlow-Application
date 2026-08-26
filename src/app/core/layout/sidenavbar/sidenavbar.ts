import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LayoutService } from '../services/layout';
import { navigationList, SideNavItem } from '../data/navigation.data';
import { AuthFacade } from '../../auth/facades/auth.facade';

@Component({
  selector: 'app-cf-sidenavbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidenavbar.html',
  styleUrl: './sidenavbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidenavbar {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly layoutService = inject(LayoutService);
  private readonly authFacade = inject(AuthFacade);
  readonly navigationItems = navigationList;
  // Only one parent menu can be open at a time; null means all collapsed.
  readonly expandedItem = signal<string | null>(null);
  constructor() {
    this.handleRouteChange(this.router.url);
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        this.handleRouteChange(event.urlAfterRedirects || event.url);
      });
  }
  isExpanded(item: SideNavItem): boolean {
    return this.expandedItem() === item.label;
  }
  onParentItemClick(item: SideNavItem): void {
    if (item.children?.length) {
      this.toggleExpand(item);
      return;
    }
    if (item.route) {
      void this.router.navigateByUrl(item.route);
    }
  }
  // Opening a parent replaces any other open parent so only one stays expanded.
  toggleExpand(item: SideNavItem): void {
    this.expandedItem.set(this.isExpanded(item) ? null : item.label);
  }
  isParentRouteActive(item: SideNavItem): boolean {
    const currentUrl = this.router.url;
    if (item.route === '/' || item.route === '/dashboard') {
      return currentUrl === '/' || currentUrl === '/dashboard';
    }
    return currentUrl === item.route || currentUrl.startsWith(`${item.route}/`);
  }
  closeMobileMenu(): void {
    this.layoutService.closeMobileMenu();
  }
  onLogout(): void {
    this.layoutService.closeMobileMenu();
    this.authFacade.logout();
  }
  // Keep the open parent in sync with the active route: refresh, direct nav and
  // sub-item clicks expand the matching parent; leaf navigation collapses all.
  private handleRouteChange(url: string): void {
    const activeParent = this.navigationItems.find(
      (item) => !!item.children?.length && this.isRouteInsideItem(url, item),
    );
    this.expandedItem.set(activeParent ? activeParent.label : null);
  }
  private isRouteInsideItem(url: string, item: SideNavItem): boolean {
    return url === item.route || url.startsWith(`${item.route}/`);
  }
}
