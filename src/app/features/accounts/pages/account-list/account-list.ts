/** File purpose: Implements logic for app\features\accounts\pages\account-list\account-list.ts. */
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { map } from 'rxjs';
import { ChartConfiguration } from 'chart.js';

import { AccountCard } from '../../components/account-card/account-card';
import { AccountFacade } from '../../facades/account.facade';
import { Account } from '../../models/accounts.model';
import { DoughnutChart } from '../../../../shared/charts/doughnut-chart/doughnut-chart';

interface AccountTypeBalance {
  label: string;
  accountType: Account['accountType'];
  color: string;
  balance: number;
}

interface AccountTypeChartViewModel {
  labels: string[];
  total: number;
  balances: AccountTypeBalance[];
  datasets: ChartConfiguration<'doughnut'>['data']['datasets'];
}

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
  // Display config used to aggregate balances by account type.
  private readonly accountTypes = [
    { label: 'Bank Accounts', accountType: 'Bank Account', color: '#2563eb' },
    { label: 'Credit Cards', accountType: 'Credit Card', color: '#5b8def' },
    { label: 'Cash / Wallet', accountType: 'Cash / Wallet', color: '#f59e0b' },
    { label: 'Investment', accountType: 'Investment', color: '#f97316' },
    { label: 'Loan', accountType: 'Loan', color: '#7c3aed' }
  ] as const;

  constructor(private router: Router) {}

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
      const balances = this.accountTypes.map((config) => {
        const balance = accounts
          .filter(account => account.accountType === config.accountType)
          .reduce((total, account) => total + account.balance, 0);

        return {
          label: config.label,
          accountType: config.accountType,
          color: config.color,
          balance
        };
      });

      const labels = balances.map(item => item.label);
      const values = balances.map(item => item.balance);
      const total = values.reduce((sum, value) => sum + value, 0);

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
    console.log('Account List initialized');
  }

  // Navigates to account details after card selection.
  viewAccount(accountId: string): void {
    console.log('Selected Account ID:', accountId);
    this.router.navigate(['/accounts', accountId]);
  }

  // Opens the unified add account route.
  openAddAccount(): void {
    this.router.navigate(['/accounts/add']);
  }

  showAllAccountsList(): void {
    this.showAllAccounts = true;
  }
}
