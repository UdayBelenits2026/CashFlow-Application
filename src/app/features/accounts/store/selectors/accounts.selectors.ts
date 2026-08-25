import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AccountState, accountsFeatureKey } from '../state/accounts.state';

// Selects the root account feature state registered under "accounts".
export const selectAccountState =
  createFeatureSelector<AccountState>(accountsFeatureKey);

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
);

export const selectBankAccountCount = createSelector(
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

// Returns the id of the account currently opened in the detail view.
export const selectSelectedAccountId = createSelector(
  selectAccountState,
  state => state.selectedAccountId
);

// Resolves the currently selected account from the loaded collection.
export const selectSelectedAccount = createSelector(
  selectAccounts,
  selectSelectedAccountId,
  (accounts, selectedId) =>
    selectedId ? accounts.find(account => account.id === selectedId) ?? null : null
);

// Returns the transactions loaded for the selected account.
export const selectAccountTransactions = createSelector(
  selectAccountState,
  state => state.transactions
);

// Returns the transient success message for the feedback banner.
export const selectSuccessMessage = createSelector(
  selectAccountState,
  state => state.successMessage
);

// Returns the dropdown option lists loaded for the account form.
export const selectAccountFormOptions = createSelector(
  selectAccountState,
  state => state.formOptions
);

// Returns the selectable account types.
export const selectAccountTypeOptions = createSelector(
  selectAccountFormOptions,
  options => options.accountTypes
);

// Returns the selectable banks.
export const selectBankOptions = createSelector(
  selectAccountFormOptions,
  options => options.banks
);

// Returns the selectable currencies.
export const selectCurrencyOptions = createSelector(
  selectAccountFormOptions,
  options => options.currencies
);

// Returns the sub-types for the currently selected account type.
export const selectAccountSubTypeOptions = createSelector(
  selectAccountFormOptions,
  options => options.subTypes
);

// Returns every account category (sub-type) for the categories page.
export const selectAccountCategories = createSelector(
  selectAccountState,
  state => state.categories
);
