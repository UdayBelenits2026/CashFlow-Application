import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faFilter,
  faXmark,
  faBookmark,
  faEllipsisVertical,
  faMagnifyingGlass,
  faCalendarDays,
  faPlus,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons';
import { DashboardFilterState } from '../../models/dashboard.models';
import { DashboardFacade } from '../../facades/dashboard.facade';

export interface SavedFilter {
  id: string;
  name: string;
  filterState: DashboardFilterState;
}

@Component({
  selector: 'app-cf-dashboard-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './dashboard-filter.html',
  styleUrl: './dashboard-filter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardFilterComponent {
  private readonly facade = inject(DashboardFacade);

  // Inputs and outputs for filter modal visibility and actions
  readonly isOpen = input<boolean>(false);
  readonly closeModal = output<void>();
  readonly applyFilter = output<DashboardFilterState>();

  // FontAwesome icon definitions
  readonly filterIcon = faFilter;
  readonly closeIcon = faXmark;
  readonly bookmarkIcon = faBookmark;
  readonly ellipsisIcon = faEllipsisVertical;
  readonly searchIcon = faMagnifyingGlass;
  readonly calendarIcon = faCalendarDays;
  readonly plusIcon = faPlus;
  readonly trashIcon = faTrashCan;

  // Options for filter selection dropdowns
  readonly dateRanges = [
    { label: 'Custom Range', value: 'custom' },
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'this-week' },
    { label: 'Last Week', value: 'last-week' },
    { label: 'This Month', value: 'this-month' },
    { label: 'Last Month', value: 'last-month' },
    { label: 'This Quarter', value: 'this-quarter' },
    { label: 'Last Quarter', value: 'last-quarter' },
    { label: 'This Year', value: 'this-year' },
    { label: 'Last Year', value: 'last-year' },
  ];

  readonly accounts = [
    { label: 'All Accounts', value: '' },
    { label: 'Chase Checking •••• 1234', value: 'account-1' },
    { label: 'Savings Account •••• 5678', value: 'account-2' },
    { label: 'Credit Card •••• 9012', value: 'account-3' },
  ];

  readonly incomeExpenseOptions = [
    { label: 'All', value: '' },
    { label: 'Income', value: 'income' },
    { label: 'Expense', value: 'expense' },
  ];

  readonly categories = [
    { label: 'All Categories', value: '' },
    { label: 'Housing', value: 'housing' },
    { label: 'Food & Dining', value: 'food-dining' },
    { label: 'Transportation', value: 'transportation' },
    { label: 'Utilities', value: 'utilities' },
    { label: 'Entertainment', value: 'entertainment' },
    { label: 'Shopping', value: 'shopping' },
    { label: 'Healthcare', value: 'healthcare' },
    { label: 'Salary', value: 'salary' },
    { label: 'Freelance', value: 'freelance' },
    { label: 'Other', value: 'other' },
  ];

  readonly transactionTypes = [
    { label: 'All Types', value: '' },
    { label: 'Purchase', value: 'purchase' },
    { label: 'Payment', value: 'payment' },
    { label: 'Transfer', value: 'transfer' },
    { label: 'Refund', value: 'refund' },
    { label: 'Withdrawal', value: 'withdrawal' },
    { label: 'Deposit', value: 'deposit' },
    { label: 'Adjustment', value: 'adjustment' },
  ];

  readonly tags = [
    { label: 'All Tags', value: '' },
    { label: 'Business', value: 'business' },
    { label: 'Personal', value: 'personal' },
    { label: 'Essential', value: 'essential' },
    { label: 'Travel', value: 'travel' },
    { label: 'Subscription', value: 'subscription' },
  ];

  readonly paymentMethods = [
    { label: 'All Methods', value: '' },
    { label: 'Cash', value: 'cash' },
    { label: 'Debit Card', value: 'debit-card' },
    { label: 'Credit Card', value: 'credit-card' },
    { label: 'Bank Transfer', value: 'bank-transfer' },
    { label: 'UPI', value: 'upi' },
    { label: 'Cheque', value: 'cheque' },
  ];

  readonly transactionStatuses = [
    { label: 'All Status', value: '' },
    { label: 'Completed', value: 'completed' },
    { label: 'Pending', value: 'pending' },
    { label: 'Failed', value: 'failed' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  readonly recurringOptions = [
    { label: 'All', value: '' },
    { label: 'Recurring', value: 'true' },
    { label: 'Non-Recurring', value: 'false' },
  ];

  readonly budgets = [
    { label: 'All Budgets', value: '' },
    { label: 'Housing Budget', value: 'housing-budget' },
    { label: 'Food Budget', value: 'food-budget' },
    { label: 'Transportation Budget', value: 'transport-budget' },
    { label: 'Entertainment Budget', value: 'entertainment-budget' },
    { label: 'Monthly Expenses', value: 'monthly-expenses' },
  ];

  // Helper to calculate start and end dates based on selected date range
  private getDateRangeValues(range: string): { fromDate: string; toDate: string } {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const date = now.getDate();

    const formatDate = (d: Date): string => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    switch (range) {
      case 'today': {
        const todayStr = formatDate(now);
        return { fromDate: todayStr, toDate: todayStr };
      }
      case 'this-week': {
        const dayOfWeek = now.getDay();
        const start = new Date(year, month, date - dayOfWeek);
        const end = new Date(year, month, date + (6 - dayOfWeek));
        return { fromDate: formatDate(start), toDate: formatDate(end) };
      }
      case 'last-week': {
        const dayOfWeek = now.getDay();
        const start = new Date(year, month, date - dayOfWeek - 7);
        const end = new Date(year, month, date + (6 - dayOfWeek) - 7);
        return { fromDate: formatDate(start), toDate: formatDate(end) };
      }
      case 'this-month': {
        const start = new Date(year, month, 1);
        const end = new Date(year, month + 1, 0);
        return { fromDate: formatDate(start), toDate: formatDate(end) };
      }
      case 'last-month': {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0);
        return { fromDate: formatDate(start), toDate: formatDate(end) };
      }
      case 'this-quarter': {
        const quarter = Math.floor(month / 3);
        const start = new Date(year, quarter * 3, 1);
        const end = new Date(year, (quarter + 1) * 3, 0);
        return { fromDate: formatDate(start), toDate: formatDate(end) };
      }
      case 'last-quarter': {
        const quarter = Math.floor(month / 3);
        const start = new Date(year, (quarter - 1) * 3, 1);
        const end = new Date(year, quarter * 3, 0);
        return { fromDate: formatDate(start), toDate: formatDate(end) };
      }
      case 'this-year': {
        const start = new Date(year, 0, 1);
        const end = new Date(year, 11, 31);
        return { fromDate: formatDate(start), toDate: formatDate(end) };
      }
      case 'last-year': {
        const start = new Date(year - 1, 0, 1);
        const end = new Date(year - 1, 11, 31);
        return { fromDate: formatDate(start), toDate: formatDate(end) };
      }
      default:
        return { fromDate: '', toDate: '' };
    }
  }

  private createInitialFilterState(): DashboardFilterState {
    const { fromDate, toDate } = this.getDateRangeValues('this-month');
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

  // Reactive state signal for dashboard filter parameters
  readonly filter = signal<DashboardFilterState>(this.createInitialFilterState());

  readonly savedFilters = signal<SavedFilter[]>(this.loadSavedFilters());
  readonly isSavingFilter = signal(false);
  readonly newFilterName = signal('');
  readonly isManagingFilters = signal(false);
  readonly activeSavedFilterId = signal<string | null>(null);

  readonly submitted = signal(false);

  // Validation computed signals
  readonly isDateInvalid = computed(() => {
    const from = this.filter().fromDate;
    const to = this.filter().toDate;
    return Boolean(from && to && from > to);
  });

  readonly isAmountInvalid = computed(() => {
    const min = this.filter().minAmount;
    const max = this.filter().maxAmount;
    return Boolean(min !== null && max !== null && min > max);
  });

  readonly showDateError = computed(() => this.submitted() && this.isDateInvalid());
  readonly showAmountError = computed(() => this.submitted() && this.isAmountInvalid());

  private loadSavedFilters(): SavedFilter[] {
    try {
      const stored = localStorage.getItem('cashflow.saved_filters.v1');
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

  private persistSavedFilters(list: SavedFilter[]): void {
    try {
      localStorage.setItem('cashflow.saved_filters.v1', JSON.stringify(list));
    } catch {
      // Ignore storage errors
    }
    this.savedFilters.set(list);
  }

  applySavedFilter(saved: SavedFilter): void {
    let filterState = { ...saved.filterState };
    if (filterState.dateRange && filterState.dateRange !== 'custom') {
      const { fromDate, toDate } = this.getDateRangeValues(filterState.dateRange);
      filterState = { ...filterState, fromDate, toDate };
    }
    this.filter.set(filterState);
    this.activeSavedFilterId.set(saved.id);
  }

  toggleSaveFilterInput(): void {
    this.isSavingFilter.update((v) => !v);
    this.newFilterName.set('');
  }

  saveCurrentFilter(): void {
    const name = this.newFilterName().trim();
    if (!name) return;

    const newSaved: SavedFilter = {
      id: 'sf-' + Date.now(),
      name,
      filterState: { ...this.filter() },
    };

    const updated = [...this.savedFilters(), newSaved];
    this.persistSavedFilters(updated);
    this.activeSavedFilterId.set(newSaved.id);
    this.isSavingFilter.set(false);
    this.newFilterName.set('');
  }

  toggleManageFilters(): void {
    this.isManagingFilters.update((v) => !v);
  }

  deleteSavedFilter(id: string, event?: Event): void {
    event?.stopPropagation();
    const updated = this.savedFilters().filter((sf) => sf.id !== id);
    this.persistSavedFilters(updated);
    if (this.activeSavedFilterId() === id) {
      this.activeSavedFilterId.set(null);
    }
  }

  // Updates specific filter property value in signal state
  updateFilter<K extends keyof DashboardFilterState>(key: K, value: DashboardFilterState[K]): void {
    this.activeSavedFilterId.set(null);
    if (key === 'dateRange' && typeof value === 'string') {
      if (value === 'custom') {
        this.filter.update((currentFilter) => ({
          ...currentFilter,
          dateRange: value,
        }));
      } else {
        const { fromDate, toDate } = this.getDateRangeValues(value);
        this.filter.update((currentFilter) => ({
          ...currentFilter,
          dateRange: value,
          fromDate,
          toDate,
        }));
      }
    } else {
      this.filter.update((currentFilter) => ({
        ...currentFilter,
        [key]: value,
      }));
    }
  }

  // Resets all filter signals to initial state
  resetFilters(): void {
    this.submitted.set(false);
    this.activeSavedFilterId.set(null);
    this.filter.set(this.createInitialFilterState());
  }

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.submitted.set(false);
        const active = this.facade.activeFilters();
        if (active) {
          this.filter.update((curr) => ({
            ...curr,
            ...active,
          }));
        }
      }
    });
  }

  // Emits selected filters and closes modal if validation passes
  applyFilters(): void {
    this.submitted.set(true);

    if (this.isDateInvalid() || this.isAmountInvalid()) {
      return;
    }

    this.facade.applyFilters(this.filter());
    this.applyFilter.emit(this.filter());
    this.onClose();
  }

  // Emits close modal event
  onClose(): void {
    this.submitted.set(false);
    this.closeModal.emit();
  }
}
