import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowRight,
  faBuildingColumns,
  faChartPie,
  faCheck,
  faFileLines,
  faReceipt,
  faUser,
  faWallet,
} from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { DashboardFacade } from '../../facades/dashboard.facade';
import { SummaryCardComponent } from '../../components/summary-card/summary-card';
import { LineChart } from '../../../../shared/charts/line-chart/line-chart';
import {
  SummaryCard,
  AccountLinkPayload,
  ProfileSetupForm,
  ONBOARDING_ACTION_ID,
} from '../../models/dashboard.models';
import { AccountLinkModalComponent } from '../../components/account-link-modal/account-link-modal';
import { ProfileSetupModalComponent } from '../../components/profile-setup-modal/profile-setup-modal';

@Component({
  selector: 'app-dashboard-new-user',
  standalone: true,
  imports: [
    FontAwesomeModule,
    SummaryCardComponent,
    LineChart,
    AccountLinkModalComponent,
    ProfileSetupModalComponent,
  ],
  templateUrl: './dashboard-new-user.html',
  styleUrl: './dashboard-new-user.scss',
})
export class DashboardNewUser {
  readonly facade = inject(DashboardFacade);
  private readonly router = inject(Router);

  // Modal visibility signals
  readonly isAccountLinkModalOpen = signal<boolean>(false);
  readonly isProfileModalOpen = signal<boolean>(false);
  // Reactive onboarding state signals
  readonly onboardingSteps = this.facade.onboardingSteps;
  readonly onboardingActions = this.facade.onboardingActions;
  readonly completionPercentage = computed(() => {
    const steps = this.onboardingSteps();
    if (!steps || steps.length === 0) return 0;
    const completed = steps.filter((step) => step.completed).length;
    return Math.round((completed / steps.length) * 100);
  });

  constructor() {
    // Automatically navigate to /dashboard/home when all onboarding steps are completed
    effect(() => {
      const steps = this.onboardingSteps();
      if (steps && steps.length > 0 && steps.every((step) => step.completed)) {
        void this.router.navigate(['/dashboard/home']);
      }
    });
  }
  // Zeroed out summary card values for new onboarding user
  readonly summaryCards: SummaryCard[] = [
    {
      id: 'income',
      title: 'Total Income',
      amount: 0,
      selectedMonthAmount: 0,
      previousMonthAmount: 0,
      percentage: 0,
      trend: 'up',
      comparison: 'vs last month',
      icon: 'fa-wallet',
    },
    {
      id: 'expenses',
      title: 'Total Expenses',
      amount: 0,
      selectedMonthAmount: 0,
      previousMonthAmount: 0,
      percentage: 0,
      trend: 'down',
      comparison: 'vs last month',
      icon: 'fa-money-bill-transfer',
    },
    {
      id: 'cashFlow',
      title: 'Net Cash Flow',
      amount: 0,
      selectedMonthAmount: 0,
      previousMonthAmount: 0,
      percentage: 0,
      trend: 'up',
      comparison: 'vs last month',
      icon: 'fa-chart-line',
    },
    {
      id: 'savings',
      title: 'Total Savings',
      amount: 0,
      selectedMonthAmount: 0,
      previousMonthAmount: 0,
      percentage: 0,
      trend: 'up',
      comparison: 'vs last month',
      icon: 'fa-piggy-bank',
    },
  ];
  // FontAwesome icon references
  readonly icons: Record<string, IconDefinition> = {
    user: faUser,
    bank: faBuildingColumns,
    wallet: faWallet,
    receipt: faReceipt,
    chart: faChartPie,
  };
  readonly checkIcon = faCheck;
  readonly arrowIcon = faArrowRight;
  readonly docIcon = faFileLines;
  readonly lineChartLabels = ['May 1', 'May 8', 'May 15', 'May 22', 'May 31'];

  // Starts selected onboarding step or opens relevant modal
  start(actionId: string): void {
    if (
      actionId === ONBOARDING_ACTION_ID.connectAccount ||
      actionId === ONBOARDING_ACTION_ID.connectBank
    ) {
      this.isAccountLinkModalOpen.set(true);
    } else if (actionId === ONBOARDING_ACTION_ID.completeProfile) {
      this.isProfileModalOpen.set(true);
    } else {
      this.facade.startOnboarding(actionId);
    }
  }

  // Handles bank or credit card connection submission
  onAccountConnected(payload: AccountLinkPayload): void {
    this.facade.connectAccount(payload);
    this.isAccountLinkModalOpen.set(false);
  }

  // Handles profile setup submission
  onProfileSaved(payload: ProfileSetupForm): void {
    this.facade.saveProfile(payload);
    this.isProfileModalOpen.set(false);
  }
}
