import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowRight,
  faBuildingColumns,
  faChartPie,
  faCheck,
  faReceipt,
  faWallet,
} from '@fortawesome/free-solid-svg-icons';
import { DashboardFacade } from '../../facades/dashboard.facade';
import { SummaryCardComponent } from '../../widgets/summary-card/summary-card';
import { LineChart } from '../../../../shared/charts/line-chart/line-chart';

@Component({
  selector: 'app-dashboard-new-user',
  standalone: true,
  imports: [AsyncPipe, FontAwesomeModule, SummaryCardComponent, LineChart],
  templateUrl: './dashboard-new-user.html',
  styleUrl: './dashboard-new-user.scss',
})
export class DashboardNewUser {
  readonly facade = inject(DashboardFacade);
  readonly summaryCards$ = this.facade.summaryCards$;
  readonly onboardingSteps$ = this.facade.onboardingSteps$;
  readonly onboardingActions$ = this.facade.onboardingActions$;
  readonly icons: Record<string, any> = {
    bank: faBuildingColumns,
    wallet: faWallet,
    receipt: faReceipt,
    chart: faChartPie,
  };
  readonly checkIcon = faCheck;
  readonly arrowIcon = faArrowRight;
  readonly lineChartLabels = ['May 1', 'May 8', 'May 15', 'May 22', 'May 31'];

  start(actionId: string): void {
    this.facade.startOnboarding(actionId);
  }
}
