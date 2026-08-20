import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LayoutService } from '../services/layout';
import { navigationList, SideNavItem } from '../data/navigation.data';

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
  readonly navigationItems = navigationList;
  // Stores the parent menus that are currently open
  readonly expandedItems = signal<Set<string>>(new Set());
  private lastFeaturePrefix = '';
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
    return this.expandedItems().has(item.label);
  }
  onParentItemClick(item: SideNavItem): void {
    // Parent entries with children behave as accordion toggles.
    // Navigation happens on child click to avoid broken toggle state when parent route does not exist.
    this.toggleExpand(item);
  }
  toggleExpand(item: SideNavItem): void {
    this.updateExpandedItems(item, !this.isExpanded(item));
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
  private updateExpandedItems(item: SideNavItem, expanded: boolean): void {
    const current = new Set(this.expandedItems());
    if (expanded) {
      current.add(item.label);
    } else {
      current.delete(item.label);
    }
    this.expandedItems.set(current);
  }
  private handleRouteChange(url: string): void {
    const currentPrefix = url.split('/')[1] || '';
    if (currentPrefix === this.lastFeaturePrefix) {
      return;
    }
    this.lastFeaturePrefix = currentPrefix;
    const current = new Set(this.expandedItems());
    for (const item of this.navigationItems) {
      if (item.children?.length && this.isRouteInsideItem(url, item)) {
        current.add(item.label);
      }
    }
    this.expandedItems.set(current);
  }
  private isRouteInsideItem(url: string, item: SideNavItem): boolean {
    return url === item.route || url.startsWith(`${item.route}/`);
  }
}