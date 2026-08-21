import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { filter, take } from 'rxjs';
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

    this.facade.dashboardState$
      .pipe(
        filter((state) => !state.loading),
        take(1),
      )
      .subscribe((state) => {
        const shouldRouteToNewUser = !state.loadError && state.isNewUser === true;

        void this.router.navigate([shouldRouteToNewUser ? '/dashboard/new' : '/dashboard/home'], {
          replaceUrl: true,
        });
      });
  }
}
