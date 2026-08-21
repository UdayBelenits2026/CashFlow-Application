import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DashboardFilterState {
  dateRange: string;
  fromDate: string;
  toDate: string;
  quickSelect: string;
  account: string;
  incomeExpense: string;
  category: string;
  merchant: string;
  minAmount: number | null;
  maxAmount: number | null;
  transactionType: string;
  tag: string;
  paymentMethod: string;
  transactionStatus: string;
  recurring: string;
  budget: string;
  applyToAllWidgets: boolean;
}

@Component({
  selector: 'app-cf-dashboard-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-filter.html',
  styleUrl: './dashboard-filter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardFilter {
  readonly dateRanges = [
    { label: 'Custom Range', value: 'custom' },
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'This Week', value: 'this-week' },
    { label: 'Last Week', value: 'last-week' },
    { label: 'This Month', value: 'this-month' },
    { label: 'Last Month', value: 'last-month' },
    { label: 'This Year', value: 'this-year' },
    { label: 'Last Year', value: 'last-year' },
  ];

  readonly quickSelectOptions = [
    { label: 'Select Range', value: '' },
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'This Week', value: 'this-week' },
    { label: 'Last 7 Days', value: 'last-7-days' },
    { label: 'This Month', value: 'this-month' },
    { label: 'Last Month', value: 'last-month' },
    { label: 'Last 30 Days', value: 'last-30-days' },
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

  readonly filter = signal<DashboardFilterState>({
    dateRange: 'custom',
    fromDate: '2026-05-01',
    toDate: '2026-05-29',
    quickSelect: 'this-month',
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

  updateFilter<K extends keyof DashboardFilterState>(key: K, value: DashboardFilterState[K]): void {
    this.filter.update((currentFilter) => ({
      ...currentFilter,
      [key]: value,
    }));
  }

  toggleApplyToAll(): void {
    this.filter.update((currentFilter) => ({
      ...currentFilter,
      applyToAllWidgets: !currentFilter.applyToAllWidgets,
    }));
  }

  resetFilters(): void {
    this.filter.set({
      dateRange: 'custom',
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

  applyFilters(): void {
    console.log(this.filter());
  }

  close(): void {
    console.log('Close filter');
  }
}
