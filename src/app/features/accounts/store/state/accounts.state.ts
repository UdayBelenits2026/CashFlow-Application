import {
  Account,
  AccountCategory,
  AccountFormOptions,
  Transaction,
  initialAccountFormOptions
} from '../../models/accounts.model';

export const accountsFeatureKey = 'accounts';

// Shape of the accounts feature state.
export interface AccountState {
  accounts: Account[];
  transactions: Transaction[];
  categories: AccountCategory[];
  selectedAccountId: string | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  formOptions: AccountFormOptions;
}

// Default state used before any data is loaded.
export const initialAccountState: AccountState = {
  accounts: [],
  transactions: [],
  categories: [],
  selectedAccountId: null,
  loading: false,
  error: null,
  successMessage: null,
  formOptions: initialAccountFormOptions
};
