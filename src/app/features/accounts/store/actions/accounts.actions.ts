import { createAction, props } from '@ngrx/store';
import { Account, AccountCategory, CreateAccountCategoryRequest, CreateAccountRequest, CurrencyOption, Transaction } from '../../models/accounts.model';

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
  props<{ account: CreateAccountRequest }>()
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

// Requests deletion of an existing account.
export const deleteAccount = createAction(
  '[Account] Delete Account',
  props<{ id: string }>()
);

// Removes the deleted account from state.
export const deleteAccountSuccess = createAction(
  '[Account API] Delete Account Success',
  props<{ id: string }>()
);

// Stores the error message when account deletion fails.
export const deleteAccountFailure = createAction(
  '[Account API] Delete Account Failure',
  props<{ error: string }>()
);

// Tracks the account currently being viewed in the detail page.
export const selectAccount = createAction(
  '[Account] Select Account',
  props<{ id: string | null }>()
);

// Requests the transaction history for a specific account.
export const loadAccountTransactions = createAction(
  '[Account] Load Account Transactions',
  props<{ accountId: string }>()
);

// Stores the transactions fetched for the selected account.
export const loadAccountTransactionsSuccess = createAction(
  '[Account API] Load Account Transactions Success',
  props<{ transactions: Transaction[] }>()
);

// Stores the error message when transaction loading fails.
export const loadAccountTransactionsFailure = createAction(
  '[Account API] Load Account Transactions Failure',
  props<{ error: string }>()
);

// Clears the transient success/error feedback banner.
export const clearAccountFeedback = createAction('[Account] Clear Feedback');

// Requests the dropdown option lists (types, banks, currencies) for the form.
export const loadAccountFormOptions = createAction('[Account Form] Load Form Options');

// Stores the fetched dropdown option lists.
export const loadAccountFormOptionsSuccess = createAction(
  '[Account API] Load Form Options Success',
  props<{ accountTypes: string[]; banks: string[]; currencies: CurrencyOption[] }>()
);

// Stores the error message when form option loading fails.
export const loadAccountFormOptionsFailure = createAction(
  '[Account API] Load Form Options Failure',
  props<{ error: string }>()
);

// Requests the sub-types available for the selected account type.
export const loadAccountSubTypes = createAction(
  '[Account Form] Load Account Sub-Types',
  props<{ accountType: string }>()
);

// Stores the sub-types fetched for the selected account type.
export const loadAccountSubTypesSuccess = createAction(
  '[Account API] Load Account Sub-Types Success',
  props<{ subTypes: string[] }>()
);

// Stores the error message when sub-type loading fails.
export const loadAccountSubTypesFailure = createAction(
  '[Account API] Load Account Sub-Types Failure',
  props<{ error: string }>()
);

// Requests every account category (sub-type) for the categories page.
export const loadAccountCategories = createAction('[Account Categories] Load Categories');

// Stores the fetched account categories.
export const loadAccountCategoriesSuccess = createAction(
  '[Account API] Load Categories Success',
  props<{ categories: AccountCategory[] }>()
);

// Stores the error message when category loading fails.
export const loadAccountCategoriesFailure = createAction(
  '[Account API] Load Categories Failure',
  props<{ error: string }>()
);

// Requests creation of a new account category.
export const createAccountCategory = createAction(
  '[Account Categories] Create Category',
  props<{ category: CreateAccountCategoryRequest }>()
);

// Replaces state with the refreshed category list after a successful create.
export const createAccountCategorySuccess = createAction(
  '[Account API] Create Category Success',
  props<{ categories: AccountCategory[] }>()
);

// Stores the error message when category creation fails.
export const createAccountCategoryFailure = createAction(
  '[Account API] Create Category Failure',
  props<{ error: string }>()
);

// Keep the feature terminology available to consumers while the effect names
// remain explicit about the create operation.
export const addAccount = createAccount;
export const addAccountSuccess = createAccountSuccess;
export const addAccountFailure = createAccountFailure;
