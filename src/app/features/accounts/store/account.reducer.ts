/** File purpose: Implements logic for app\features\accounts\store\account.reducer.ts. */
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
  updateAccountFailure
} from './account.actions';
import { Account } from '../models/accounts.model';

export interface AccountState {
  accounts: Account[];
  loading: boolean;
  error: string | null;
}

export const initialAccountState: AccountState = {
  accounts: [],
  loading: false,
  error: null
};

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

  // Reuses same loading behavior for create and update requests.
  on(createAccount, updateAccount, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  // Replaces state with the latest list after successful write operations.
  on(createAccountSuccess, updateAccountSuccess, (state, { accounts }) => ({
    ...state,
    accounts,
    loading: false,
    error: null
  })),

  // Captures errors from write operations.
  on(createAccountFailure, updateAccountFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);
