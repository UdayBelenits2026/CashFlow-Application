import { Injectable } from '@angular/core';
import { DashboardFilterState } from '../models/dashboard-filter.model';
import { getDateRangeValues } from '../utility/dashboard-date-range.util';

export interface SavedFilter {
  id: string;
  name: string;
  filterState: DashboardFilterState;
}

const STORAGE_KEY = 'cashflow.saved_filters.v1';

@Injectable({
  providedIn: 'root',
})
export class DashboardSavedFiltersService {
  // Builds a fresh filter state defaulted to the current month
  createInitialFilterState(): DashboardFilterState {
    const { fromDate, toDate } = getDateRangeValues('this-month');
    return {
      dateRange: 'custom',
      fromDate,
      toDate,
      quickSelect: '',
      account: '',
      incomeExpense: '',
      category: '',
      merchant: '',
      minAmount: null,
      maxAmount: null,
      transactionType: '',
      tag: '',
      paymentMethod: '',
      transactionStatus: '',
      recurring: '',
      budget: '',
    };
  }

  // Loads persisted saved filters, falling back to defaults
  load(): SavedFilter[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback to defaults if parsing fails
    }

    return [
      {
        id: 'sf-1',
        name: 'This Month - All Accounts',
        filterState: { ...this.createInitialFilterState(), dateRange: 'this-month' },
      },
      {
        id: 'sf-2',
        name: 'Business Expenses',
        filterState: {
          ...this.createInitialFilterState(),
          dateRange: 'this-month',
          incomeExpense: 'expense',
          tag: 'business',
        },
      },
      {
        id: 'sf-3',
        name: 'Income Only',
        filterState: {
          ...this.createInitialFilterState(),
          dateRange: 'this-month',
          incomeExpense: 'income',
        },
      },
    ];
  }

  // Persists saved filters to local storage
  persist(list: SavedFilter[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Ignore storage errors
    }
  }
}
