import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faFilter,
  faXmark,
  faCircleInfo,
  faBookmark,
  faEllipsisVertical,
  faMagnifyingGlass,
  faCalendarDays,
} from '@fortawesome/free-solid-svg-icons';
import { DashboardFilterState } from '../../models/dashboard.models';

@Component({
  selector: 'app-cf-dashboard-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './dashboard-filter.html',
  styleUrl: './dashboard-filter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardFilterComponent {
  // Inputs and outputs for filter modal visibility and actions
  readonly isOpen = input<boolean>(false);
  readonly closeModal = output<void>();
  readonly applyFilter = output<DashboardFilterState>();

  // FontAwesome icon definitions
  readonly filterIcon = faFilter;
  readonly closeIcon = faXmark;
  readonly infoIcon = faCircleInfo;
  readonly bookmarkIcon = faBookmark;
  readonly ellipsisIcon = faEllipsisVertical;
  readonly searchIcon = faMagnifyingGlass;
  readonly calendarIcon = faCalendarDays;

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

  // Reactive state signal for dashboard filter parameters
  readonly filter = signal<DashboardFilterState>({
    dateRange: 'this-month',
    fromDate: '2026-05-01',
    toDate: '2026-05-29',
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
    applyToAllWidgets: true,
  });

  readonly savedFilters = signal(['This Month - All Accounts', 'Business Expenses', 'Income Only']);

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

  // Updates specific filter property value in signal state
  updateFilter<K extends keyof DashboardFilterState>(key: K, value: DashboardFilterState[K]): void {
    this.filter.update((currentFilter) => ({
      ...currentFilter,
      [key]: value,
    }));
  }

  // Toggles apply to all widgets flag
  toggleApplyToAll(): void {
    this.filter.update((currentFilter) => ({
      ...currentFilter,
      applyToAllWidgets: !currentFilter.applyToAllWidgets,
    }));
  }

  // Resets all filter signals to initial state
  resetFilters(): void {
    this.filter.set({
      dateRange: 'this-month',
      fromDate: '',
      toDate: '',
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
      applyToAllWidgets: true,
    });
  }

  // Emits selected filters and closes modal
  applyFilters(): void {
    this.applyFilter.emit(this.filter());
    this.onClose();
  }

  // Emits close modal event
  onClose(): void {
    this.closeModal.emit();
  }
}
