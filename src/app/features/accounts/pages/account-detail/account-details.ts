import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AccountFacade } from '../../facades/account.facade';
import { Transaction, AccountDetailsViewState, initialAccountDetailsViewState } from '../../models/accounts.model';
import { AccountNumberPipe } from '../../../../shared/pipes/account-number-pipe';

@Component({
  selector: 'app-account-details',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, AccountNumberPipe],
  templateUrl: './account-details.html',
  styleUrl: './account-details.scss'
})
export class AccountDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly accountFacade = inject(AccountFacade);
  private readonly destroyRef = inject(DestroyRef);

  // View state for the details page; shape defined by AccountDetailsViewState in the accounts model.
  state: AccountDetailsViewState = { ...initialAccountDetailsViewState };

  // Delete confirmation UI state.
  confirmDeleteOpen = false;
  deleting = false;
  deleteError: string | null = null;
  private pendingDelete = false;

  // Loads account + transactions through the facade and binds reactive state.
  ngOnInit(): void {
    this.state.accountId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.state.accountId) {
      this.state.error = 'Account not found.';
      return;
    }

    this.accountFacade.loadAccounts();
    this.accountFacade.selectAccount(this.state.accountId);
    this.accountFacade.loadTransactions(this.state.accountId);

    this.accountFacade.selectedAccount$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((account) => (this.state.account = account));

    this.accountFacade.transactions$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((transactions) => {
        this.state.transactions = [...transactions].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      });

    this.accountFacade.loading$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((loading) => (this.state.loading = loading));

    this.accountFacade.error$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((error) => {
        if (this.pendingDelete) {
          if (error) {
            this.pendingDelete = false;
            this.deleting = false;
            this.deleteError = 'Unable to delete account. Please try again.';
          }
          return;
        }
        this.state.error = error;
      });

    this.accountFacade.successMessage$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((message) => {
        if (this.pendingDelete && message) {
          this.pendingDelete = false;
          this.router.navigate(['/accounts']);
        }
      });
  }

  // Toggles the account actions dropdown menu.
  toggleActions(): void {
    this.state.actionsOpen = !this.state.actionsOpen;
  }

  // Handles each action menu command and updates local UI state.
  selectAction(action: 'edit' | 'balanceHistory' | 'deactivate' | 'delete'): void {
    this.state.actionsOpen = false;

    if (action === 'edit') {
      if (this.state.account) {
        this.router.navigate(['/accounts/edit', this.state.account.id]);
      }
      return;
    }

    if (action === 'balanceHistory') {
      this.state.historyNotice = 'Balance history will be available once balance snapshots are enabled.';
      return;
    }

    if (action === 'deactivate' && this.state.account) {
      this.accountFacade.updateAccount({ ...this.state.account, status: 'Inactive' });
      return;
    }

    if (action === 'delete' && this.state.account) {
      this.deleteError = null;
      this.confirmDeleteOpen = true;
    }
  }

  // Closes the delete confirmation without deleting.
  cancelDelete(): void {
    this.confirmDeleteOpen = false;
  }

  // Confirms deletion; navigates to the list on success, shows an error otherwise.
  confirmDelete(): void {
    if (this.deleting || !this.state.account) {
      return;
    }
    this.deleting = true;
    this.pendingDelete = true;
    this.deleteError = null;
    this.accountFacade.deleteAccount(this.state.account.id);
  }

  visibleTransactions(): Transaction[] {
    return this.state.showAllTransactions ? this.state.transactions : this.state.transactions.slice(0, 6);
  }

  hasMoreTransactions(): boolean {
    return this.state.transactions.length > 6;
  }

  viewAllTransactions(): void {
    this.state.showAllTransactions = true;
  }

}
