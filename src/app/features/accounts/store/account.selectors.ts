/** File purpose: Implements logic for app\features\accounts\store\account.selectors.ts. */
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AccountState } from './account.reducer';

// Selects the root account feature state registered under "accounts".
export const selectAccountState =
  createFeatureSelector<AccountState>('accounts');

// Returns the full account collection.
export const selectAccounts = createSelector(
  selectAccountState,
  state => state.accounts
);

// Returns loading flag for account fetch/create/update workflows.
export const selectLoading = createSelector(
  selectAccountState,
  state => state.loading
);

// Returns the latest account error message.
export const selectError = createSelector(
  selectAccountState,
  state => state.error
);

// Aggregates account balances for dashboard totals.
export const selectTotalBalance = createSelector(
  selectAccounts,
  accounts =>
    accounts.reduce(
      (total, account) => total + account.balance,
      0
    )
);

// Computes account counts used by overview widgets.
export const selectAccountCount = createSelector(
  selectAccounts,
  accounts => accounts.length
);export const selectBankAccountCount = createSelector(
  selectAccounts,
  accounts =>
    accounts.filter(
      account => account.accountType === 'Bank Account'
    ).length
);

export const selectCreditCardCount = createSelector(
  selectAccounts,
  accounts =>
    accounts.filter(
      account => account.accountType === 'Credit Card'
    ).length
);

export const selectCashWalletCount = createSelector(
  selectAccounts,
  accounts =>
    accounts.filter(
      account => account.accountType === 'Cash / Wallet'
    ).length
);

export const selectInvestmentCount = createSelector(
  selectAccounts,
  accounts =>
    accounts.filter(
      account => account.accountType === 'Investment'
    ).length
);
