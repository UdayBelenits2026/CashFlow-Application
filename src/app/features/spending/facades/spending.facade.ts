import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import * as SpendingActions from '../store/spending.actions';
import * as SpendingSelectors from '../store/spending.selectors';
import { Expense } from '../models/expense.model';
import { Tag } from '../models/tag.model';
import { RecurringExpense } from '../models/recurring-expense.model';
import { ExpenseFilters } from '../store/spending.state';

@Injectable({
  providedIn: 'root'
})
export class SpendingFacade {
  private readonly store = inject(Store);

  // Status & Feedback
  readonly isLoading$ = this.store.select(SpendingSelectors.selectIsLoading);
  readonly error$ = this.store.select(SpendingSelectors.selectSpendingError);
  readonly successMessage$ = this.store.select(SpendingSelectors.selectSuccessMessage);

  // Overview & KPIs
  readonly overview$ = this.store.select(SpendingSelectors.selectSpendingOverview);
  readonly totalSpending$ = this.store.select(SpendingSelectors.selectTotalSpending);
  readonly transactionCount$ = this.store.select(SpendingSelectors.selectTransactionCount);
  readonly averageDailySpending$ = this.store.select(SpendingSelectors.selectAverageDailySpending);
  readonly topCategory$ = this.store.select(SpendingSelectors.selectTopCategory);
  readonly budgetUsed$ = this.store.select(SpendingSelectors.selectBudgetUsed);

  // Charts
  readonly categories$ = this.store.select(SpendingSelectors.selectSpendingCategories);
  readonly trendPoints$ = this.store.select(SpendingSelectors.selectSpendingTrendPoints);

  // Expenses
  readonly allExpenses$ = this.store.select(SpendingSelectors.selectAllExpenses);
  readonly recentExpenses$ = this.store.select(SpendingSelectors.selectRecentExpenses);
  readonly filteredExpenses$ = this.store.select(SpendingSelectors.selectFilteredExpenses);
  readonly selectedExpense$ = this.store.select(SpendingSelectors.selectSelectedExpense);
  readonly filters$ = this.store.select(SpendingSelectors.selectExpenseFilters);

  // Auxiliary data
  readonly tags$ = this.store.select(SpendingSelectors.selectTags);
  readonly recurringExpenses$ = this.store.select(SpendingSelectors.selectRecurringExpenses);
  readonly alerts$ = this.store.select(SpendingSelectors.selectAlerts);
  readonly unreadAlertsCount$ = this.store.select(SpendingSelectors.selectUnreadAlertsCount);
  readonly insights$ = this.store.select(SpendingSelectors.selectCalculatedInsights);

  // Action Dispatchers
  loadDashboard(): void {
    this.store.dispatch(SpendingActions.loadSpendingDashboard());
  }

  loadOverview(): void {
    this.loadDashboard();
  }

  retry(): void {
    this.loadDashboard();
  }

  addExpense(expense: Partial<Expense>): void {
    this.store.dispatch(SpendingActions.addExpense({ expense }));
  }

  updateExpense(id: string, expense: Partial<Expense>): void {
    this.store.dispatch(SpendingActions.updateExpense({ id, expense }));
  }

  deleteExpense(id: string): void {
    this.store.dispatch(SpendingActions.deleteExpense({ id }));
  }

  selectExpense(id: string | null): void {
    this.store.dispatch(SpendingActions.selectExpense({ id }));
  }

  setFilters(filters: Partial<ExpenseFilters>): void {
    this.store.dispatch(SpendingActions.setExpenseFilters({ filters }));
  }

  resetFilters(): void {
    this.store.dispatch(SpendingActions.resetExpenseFilters());
  }

  addTag(tag: Tag): void {
    this.store.dispatch(SpendingActions.addTag({ tag }));
  }

  deleteTag(id: string): void {
    this.store.dispatch(SpendingActions.deleteTag({ id }));
  }

  addRecurringExpense(item: Partial<RecurringExpense>): void {
    this.store.dispatch(SpendingActions.addRecurringExpense({ item }));
  }

  toggleRecurringExpense(id: string, isActive: boolean): void {
    this.store.dispatch(SpendingActions.toggleRecurringExpense({ id, isActive }));
  }

  deleteRecurringExpense(id: string): void {
    this.store.dispatch(SpendingActions.deleteRecurringExpense({ id }));
  }

  markAlertAsRead(id: string): void {
    this.store.dispatch(SpendingActions.markAlertAsRead({ id }));
  }

  dismissAlert(id: string): void {
    this.store.dispatch(SpendingActions.dismissAlert({ id }));
  }

  clearFeedback(): void {
    this.store.dispatch(SpendingActions.clearSpendingFeedback());
  }
}
