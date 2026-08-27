import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { map } from 'rxjs';

import { AccountCard } from '../../components/account-card/account-card';
import { AccountFacade } from '../../facades/account.facade';
import { ACCOUNT_TYPE_CHART_CONFIG, AccountTypeChartViewModel } from '../../models/accounts.model';
import { DoughnutChart } from '../../../../shared/charts/doughnut-chart/doughnut-chart';

@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    RouterModule,
    AccountCard,
    DoughnutChart
  ],
  templateUrl: './account-list.html',
  styleUrl: './account-list.scss'
})
export class AccountListComponent implements OnInit {
  // Facade centralizes store interaction for this page.
  private readonly accountFacade = inject(AccountFacade);
  private readonly router = inject(Router);
  // Account types + colors used to aggregate balances for the chart.
  private readonly accountTypes = ACCOUNT_TYPE_CHART_CONFIG;

  // Reactive view state streams consumed by the template.
  accounts$ = this.accountFacade.accounts$;
  totalBalance$ = this.accountFacade.totalBalance$;
  accountCount$ = this.accountFacade.accountCount$;
  loading$ = this.accountFacade.loading$;
  error$ = this.accountFacade.error$;
  showAllAccounts = false;
  // Builds chart-ready balance totals grouped by account type.
  accountTypeChart$ = this.accounts$.pipe(
    map((accounts): AccountTypeChartViewModel => {
      const rawBalances = this.accountTypes.map((config) => ({
        label: config.label,
        accountType: config.accountType,
        color: config.color,
        balance: accounts
          .filter(account => account.accountType === config.accountType)
          .reduce((total, account) => total + account.balance, 0)
      }));

      const total = rawBalances.reduce((sum, item) => sum + item.balance, 0);

      const balances = rawBalances.map(item => ({
        ...item,
        percentage: total > 0 ? Math.round((item.balance / total) * 100) : 0
      }));

      const labels = balances.map(item => item.label);
      const values = balances.map(item => item.balance);

      return {
        labels,
        total,
        balances,
        datasets: [
          {
            data: values,
            backgroundColor: balances.map(item => item.color),
            borderWidth: 0,
            hoverOffset: 6
          }
        ]
      };
    })
  );
  // Loads accounts when page initializes.
  ngOnInit(): void {
    this.accountFacade.loadAccounts();
  }

  // Navigates to account details after card selection.
  viewAccount(accountId: string): void {
    this.router.navigate(['/accounts', accountId]);
  }

  // Opens the unified add account route.
  openAddAccount(): void {
    this.router.navigate(['/accounts/add']);
  }

  // Navigates to the account categories page.
  openCategories(): void {
    this.router.navigate(['/accounts/categories']);
  }

  showAllAccountsList(): void {
    this.showAllAccounts = true;
  }
}
