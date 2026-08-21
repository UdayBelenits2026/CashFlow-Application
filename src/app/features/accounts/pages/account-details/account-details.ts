/** File purpose: Implements logic for app\features\accounts\pages\account-details\account-details.ts. */
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Account, Transaction } from '../../models/accounts.model';
import { AccountNumberPipe } from '../../../../shared/pipes/account-number.pipe';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-account-details',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, AccountNumberPipe],
  templateUrl: './account-details.html',
  styleUrl: './account-details.scss'
})
export class AccountDetails implements OnInit {

  // Route id and screen state for account detail rendering.
  accountId:string = '';
  account: Account | null = null;
  transactions: Transaction[] = [];
  loading: boolean = false;
  error: string | null = null;
  actionsOpen = false;
  historyNotice: string | null = null;
  showAllTransactions = false;
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3007';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  // Reads account id from route and triggers data loading.
  ngOnInit(): void {

    this.accountId =
      this.route.snapshot.paramMap.get('id') ?? '';

    if (this.accountId) {
      this.loadAccount();
    }

  }

  // Loads account header/details information.
  private loadAccount(): void {
    this.loading = true;
    this.error = null;
    this.http.get<Account>(`${this.baseUrl}/accounts/${this.accountId}`).subscribe({
      next: (account: Account | null) => {
        this.account = account;
        this.loading = false;
        this.loadTransactions();
      },
      error: (err: HttpErrorResponse) => {
        this.error = 'Failed to load account details';
        this.loading = false;
        console.error(err);
      }
    });
  }

  // Loads transactions shown in the recent activity section.
  private loadTransactions(): void {
    this.http.get<Transaction[]>(`${this.baseUrl}/transactions?accountId=${this.accountId}`).subscribe({
      next: (transactions: Transaction[]) => {
        this.transactions = [...transactions]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },
      error: (err: HttpErrorResponse) => {
        this.error = 'Failed to load account transactions';
        console.error(err);
      }
    });
  }

  // Toggles the account actions dropdown menu.
  toggleActions(): void {
    this.actionsOpen = !this.actionsOpen;
  }

  // Handles each action menu command and updates local UI state.
  selectAction(action: 'edit' | 'balanceHistory' | 'deactivate' | 'delete'): void {
    this.actionsOpen = false;

    if (action === 'edit') {
      if (this.account) {
        this.router.navigate(['/accounts/edit', this.account.id]);
      }
      return;
    }

    if (action === 'balanceHistory') {
      this.historyNotice = 'Balance history will be available once balance snapshots are enabled.';
      return;
    }

    if (action === 'deactivate' && this.account) {
      this.account = { ...this.account, status: 'Inactive' };
      return;
    }

    if (action === 'delete') {
      this.error = 'Delete account is not available yet.';
    }
  }

  get visibleTransactions(): Transaction[] {
    return this.showAllTransactions ? this.transactions : this.transactions.slice(0, 6);
  }

  get hasMoreTransactions(): boolean {
    return this.transactions.length > 6;
  }

  viewAllTransactions(): void {
    this.showAllTransactions = true;
  }

}
