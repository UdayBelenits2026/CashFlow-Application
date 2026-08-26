import { Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardFacade } from '../../facades/dashboard.facade';

@Component({
  selector: 'app-dashboard-route-entry',
  standalone: true,
  templateUrl: './dashboard-route-entry.html',
  styleUrl: './dashboard-route-entry.scss',
})
export class DashboardRouteEntry {
  private readonly router = inject(Router);
  private readonly facade = inject(DashboardFacade);

  constructor() {
    this.facade.loadDashboard();
    // Redirects user to new user onboarding or home dashboard based on state
    effect(() => {
      const state = this.facade.dashboardState();
      if (!state.loading) {
        const shouldRouteToNewUser = !state.loadError && state.isNewUser === true;
        void this.router.navigate([shouldRouteToNewUser ? '/dashboard/new' : '/dashboard/home'], {
          replaceUrl: true,
        });
      }
    });
  }
}
