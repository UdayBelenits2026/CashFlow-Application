/** File purpose: Implements logic for app\features\accounts\store\account.actions.ts. */
import { createAction, props } from '@ngrx/store';
import { Account } from '../models/accounts.model';

// Starts loading account data from the API.
export const loadAccounts = createAction(
  '[Account] Load Accounts'
);

// Stores the latest account list after a successful fetch.
export const loadAccountsSuccess = createAction(
  '[Account API] Load Accounts Success',
  props<{ accounts: Account[] }>()
);

// Stores the error message when account loading fails.
export const loadAccountsFailure = createAction(
  '[Account API] Load Accounts Failure',
  props<{ error: string }>()
);

// Requests account creation from the API layer.
export const createAccount = createAction(
  '[Account] Create Account',
  props<{ account: Omit<Account, 'id'> & { id?: string } }>()
);

// Replaces state with the refreshed account list after create succeeds.
export const createAccountSuccess = createAction(
  '[Account API] Create Account Success',
  props<{ accounts: Account[] }>()
);

// Stores the error message when account creation fails.
export const createAccountFailure = createAction(
  '[Account API] Create Account Failure',
  props<{ error: string }>()
);

// Requests account updates for an existing record.
export const updateAccount = createAction(
  '[Account] Update Account',
  props<{ account: Account }>()
);

// Replaces state with the refreshed account list after update succeeds.
export const updateAccountSuccess = createAction(
  '[Account API] Update Account Success',
  props<{ accounts: Account[] }>()
);

// Stores the error message when account update fails.
export const updateAccountFailure = createAction(
  '[Account API] Update Account Failure',
  props<{ error: string }>()
);

// Keep the feature terminology available to consumers while the effect names
// remain explicit about the create operation.
export const addAccount = createAccount;
export const addAccountSuccess = createAccountSuccess;
export const addAccountFailure = createAccountFailure;
