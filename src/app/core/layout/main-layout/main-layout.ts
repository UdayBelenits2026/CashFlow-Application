import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Sidenavbar } from '../sidenavbar/sidenavbar';
import { Mainnavbar } from '../mainnavbar/mainnavbar';
import { LayoutService } from '../services/layout';
import { DashboardFilterComponent } from '../../../features/dashboard/components/dashboard-filter/dashboard-filter';
import { DashboardFacade } from '../../../features/dashboard/facades/dashboard.facade';
import { DashboardFilterState } from '../../../features/dashboard/models/dashboard.models';

@Component({
  selector: 'app-cf-main-layout',
  imports: [RouterOutlet, Sidenavbar, Mainnavbar, DashboardFilterComponent],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  readonly layoutService = inject(LayoutService);
  private readonly facade = inject(DashboardFacade);

  onApplyFilter(filterState: DashboardFilterState): void {
    this.facade.applyFilters(filterState);
  }
}
