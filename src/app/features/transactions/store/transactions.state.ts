import { TransactionFilters, TransactionSort } from '../models/models.transaction';
import {
  EditTransactionData,
  TransactionDetail,
  TransactionListItem
} from '../models/transaction-api.model';

export const transactionsFeatureKey = 'transactions';

export interface TransactionsState {
  // List (server-paged; page is 0-based, matching the backend).
  content: TransactionListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  filters: TransactionFilters;
  sort: TransactionSort;
  loading: boolean;
  error: string | null;
  successMessage: string | null;

  // Read-only details.
  detail: TransactionDetail | null;
  detailLoading: boolean;
  detailError: string | null;

  // Edit-form data.
  editData: EditTransactionData | null;
  editLoading: boolean;
  editError: string | null;

  // Create/update in-flight.
  saving: boolean;
}

export const initialTransactionFilters: TransactionFilters = {
  accountId: null
};

export const initialTransactionsState: TransactionsState = {
  content: [],
  page: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0,
  filters: initialTransactionFilters,
  sort: { field: 'date', direction: 'desc' },
  loading: false,
  error: null,
  successMessage: null,
  detail: null,
  detailLoading: false,
  detailError: null,
  editData: null,
  editLoading: false,
  editError: null,
  saving: false
};
