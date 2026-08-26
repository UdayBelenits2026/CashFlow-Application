import { createReducer, on } from '@ngrx/store';
import {
  loadAccounts,
  loadAccountsSuccess,
  loadAccountsFailure,
  createAccount,
  createAccountSuccess,
  createAccountFailure,
  updateAccount,
  updateAccountSuccess,
  updateAccountFailure,
  deleteAccount,
  deleteAccountSuccess,
  deleteAccountFailure,
  selectAccount,
  loadAccountTransactions,
  loadAccountTransactionsSuccess,
  loadAccountTransactionsFailure,
  clearAccountFeedback,
  loadAccountFormOptionsSuccess,
  loadAccountSubTypes,
  loadAccountSubTypesSuccess,
  loadAccountCategoriesSuccess,
  createAccountCategory,
  createAccountCategorySuccess,
  createAccountCategoryFailure
} from '../actions/accounts.actions';
import { AccountState, initialAccountState } from '../state/accounts.state';

// Handles all account state transitions triggered by account actions.
export const accountReducer = createReducer(
  initialAccountState,

  // Marks list requests as in progress.
  on(loadAccounts, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  // Stores fetched accounts and clears loading/error flags.
  on(loadAccountsSuccess, (state, { accounts }) => ({
    ...state,
    accounts,
    loading: false,
    error: null
  })),

  // Captures fetch errors and ends loading state.
  on(loadAccountsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Marks create/update/delete as in progress and clears prior feedback.
  on(createAccount, updateAccount, deleteAccount, (state) => ({
    ...state,
    loading: true,
    error: null,
    successMessage: null
  })),

  // Replaces state with the refreshed list after a successful create.
  on(createAccountSuccess, (state, { accounts }) => ({
    ...state,
    accounts,
    loading: false,
    error: null,
    successMessage: 'Account created successfully.'
  })),

  // Replaces state with the refreshed list after a successful update.
  on(updateAccountSuccess, (state, { accounts }) => ({
    ...state,
    accounts,
    loading: false,
    error: null,
    successMessage: 'Account updated successfully.'
  })),

  // Removes the deleted account and resets selection when needed.
  on(deleteAccountSuccess, (state, { id }) => ({
    ...state,
    accounts: state.accounts.filter((account) => account.id !== id),
    selectedAccountId: state.selectedAccountId === id ? null : state.selectedAccountId,
    loading: false,
    error: null,
    successMessage: 'Account deleted successfully.'
  })),

  // Captures errors from create/update/delete write operations.
  on(createAccountFailure, updateAccountFailure, deleteAccountFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Tracks the account opened in the detail view.
  on(selectAccount, (state, { id }) => ({
    ...state,
    selectedAccountId: id
  })),

  // Marks transaction loading in progress.
  on(loadAccountTransactions, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  // Stores the fetched transactions for the selected account.
  on(loadAccountTransactionsSuccess, (state, { transactions }) => ({
    ...state,
    transactions,
    loading: false,
    error: null
  })),

  // Captures transaction loading errors.
  on(loadAccountTransactionsFailure, (state, { error }) => ({
    ...state,
    transactions: [],
    loading: false,
    error
  })),

  // Clears the transient feedback banner.
  on(clearAccountFeedback, (state) => ({
    ...state,
    error: null,
    successMessage: null
  })),

  // Stores the fetched dropdown option lists (types, banks, currencies).
  on(loadAccountFormOptionsSuccess, (state, { accountTypes, banks, currencies }) => ({
    ...state,
    formOptions: { ...state.formOptions, accountTypes, banks, currencies }
  })),

  // Clears sub-types while the new list is being fetched.
  on(loadAccountSubTypes, (state) => ({
    ...state,
    formOptions: { ...state.formOptions, subTypes: [] }
  })),

  // Stores the sub-types fetched for the selected account type.
  on(loadAccountSubTypesSuccess, (state, { subTypes }) => ({
    ...state,
    formOptions: { ...state.formOptions, subTypes }
  })),

  // Stores the fetched account categories.
  on(loadAccountCategoriesSuccess, (state, { categories }) => ({
    ...state,
    categories
  })),

  // Marks category creation in progress and clears prior feedback.
  on(createAccountCategory, (state) => ({
    ...state,
    loading: true,
    error: null,
    successMessage: null
  })),

  // Replaces state with the refreshed category list after a successful create.
  on(createAccountCategorySuccess, (state, { categories }) => ({
    ...state,
    categories,
    loading: false,
    error: null,
    successMessage: 'Category added successfully.'
  })),

  // Captures errors from category creation.
  on(createAccountCategoryFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);
