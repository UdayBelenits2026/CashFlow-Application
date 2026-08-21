/** File purpose: Implements logic for app\features\accounts\facades\account.facade.ts. */
import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import {
  loadAccounts,
  createAccount,
  updateAccount
} from '../store/account.actions';
import { Account } from '../models/accounts.model';

import {
  selectAccounts,
  selectTotalBalance,
  selectAccountCount,
  selectBankAccountCount,
  selectCreditCardCount,
  selectCashWalletCount,
  selectInvestmentCount,
  selectLoading,
  selectError
} from '../store/account.selectors';

@Injectable({
  providedIn: 'root'
})
export class AccountFacade {

  // Gives the facade access to dispatch actions and select state.
  private readonly store = inject(Store);

  // Exposes account state as read-only streams for page components.
  accounts$ = this.store.select(selectAccounts);

  totalBalance$ = this.store.select(selectTotalBalance);

  accountCount$ = this.store.select(selectAccountCount);

  bankAccountCount$ =
    this.store.select(selectBankAccountCount);

  creditCardCount$ =
    this.store.select(selectCreditCardCount);

  cashWalletCount$ =
    this.store.select(selectCashWalletCount);

  investmentCount$ =
    this.store.select(selectInvestmentCount);

  loading$ = this.store.select(selectLoading);

  error$ = this.store.select(selectError);

  // Triggers account fetch workflow.
  loadAccounts(): void {
    this.store.dispatch(loadAccounts());
  }

  // Triggers account creation workflow.
  createAccount(account: Omit<Account, 'id'> & { id?: string }): void {
    this.store.dispatch(createAccount({ account }));
  }

  // Keeps compatibility with consumers still calling addAccount.
  addAccount(account: Omit<Account, 'id'> & { id?: string }): void {
    this.createAccount(account);
  }

  // Triggers account update workflow.
  updateAccount(account: Account): void {
    this.store.dispatch(updateAccount({ account }));
  }
}
