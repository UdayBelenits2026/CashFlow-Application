import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Sidenavbar } from '../sidenavbar/sidenavbar';
import { Mainnavbar } from '../mainnavbar/mainnavbar';
import { LayoutService } from '../services/layout';
import { DashboardFilterComponent } from '../../../features/dashboard/components/dashboard-filter/dashboard-filter';

@Component({
  selector: 'app-cf-main-layout',
  imports: [RouterOutlet, Sidenavbar, Mainnavbar, DashboardFilterComponent],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  readonly layoutService = inject(LayoutService);
}
