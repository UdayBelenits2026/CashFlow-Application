/** File purpose: Implements logic for app\features\accounts\facades\account.facade.ts. */
import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import {
  loadAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  selectAccount as selectAccountAction,
  loadAccountTransactions,
  clearAccountFeedback,
  loadAccountFormOptions,
  loadAccountSubTypes,
  loadAccountCategories,
  createAccountCategory
} from '../store/actions/accounts.actions';
import { Account, AccountCategory, CreateAccountCategoryRequest, CreateAccountRequest } from '../models/accounts.model';

import {
  selectAccounts,
  selectTotalBalance,
  selectAccountCount,
  selectBankAccountCount,
  selectCreditCardCount,
  selectCashWalletCount,
  selectInvestmentCount,
  selectLoading,
  selectError,
  selectSelectedAccount,
  selectAccountTransactions,
  selectSuccessMessage,
  selectAccountTypeOptions,
  selectBankOptions,
  selectCurrencyOptions,
  selectAccountSubTypeOptions,
  selectAccountCategories
} from '../store/selectors/accounts.selectors';

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

  // Stream of the account currently opened in the detail view.
  selectedAccount$ = this.store.select(selectSelectedAccount);

  // Stream of transactions for the selected account.
  transactions$ = this.store.select(selectAccountTransactions);

  // Stream of the transient success feedback message.
  successMessage$ = this.store.select(selectSuccessMessage);

  // Streams of the backend-loaded dropdown option lists for the account form.
  accountTypeOptions$ = this.store.select(selectAccountTypeOptions);
  bankOptions$ = this.store.select(selectBankOptions);
  currencyOptions$ = this.store.select(selectCurrencyOptions);
  accountSubTypeOptions$ = this.store.select(selectAccountSubTypeOptions);

  // Stream of all account categories (sub-types) for the categories page.
  accountCategories$ = this.store.select(selectAccountCategories);

  // Triggers account fetch workflow.
  loadAccounts(): void {
    this.store.dispatch(loadAccounts());
  }

  // Triggers account creation workflow.
  createAccount(account: CreateAccountRequest): void {
    this.store.dispatch(createAccount({ account }));
  }

  // Keeps compatibility with consumers still calling addAccount.
  addAccount(account: CreateAccountRequest): void {
    this.createAccount(account);
  }

  // Triggers account update workflow.
  updateAccount(account: Account): void {
    this.store.dispatch(updateAccount({ account }));
  }

  // Triggers account deletion workflow.
  deleteAccount(id: string): void {
    this.store.dispatch(deleteAccount({ id }));
  }

  // Marks the account currently opened in the detail view.
  selectAccount(id: string | null): void {
    this.store.dispatch(selectAccountAction({ id }));
  }

  // Loads the transaction history for a specific account.
  loadTransactions(accountId: string): void {
    this.store.dispatch(loadAccountTransactions({ accountId }));
  }

  // Clears the transient success/error feedback banner.
  clearFeedback(): void {
    this.store.dispatch(clearAccountFeedback());
  }

  // Loads the dropdown option lists (types, banks, currencies) for the form.
  loadFormOptions(): void {
    this.store.dispatch(loadAccountFormOptions());
  }

  // Loads the sub-types available for the selected account type.
  loadSubTypes(accountType: string): void {
    this.store.dispatch(loadAccountSubTypes({ accountType }));
  }

  // Loads all account categories for the categories page.
  loadCategories(): void {
    this.store.dispatch(loadAccountCategories());
  }

  // Creates a new account category.
  createCategory(category: CreateAccountCategoryRequest): void {
    this.store.dispatch(createAccountCategory({ category }));
  }
}

