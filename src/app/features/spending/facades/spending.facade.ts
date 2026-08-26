import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as SpendingActions from '../store/spending.actions';
import * as SpendingSelectors from '../store/spending.selectors';
import { Expense } from '../models/expense.model';
import { Tag } from '../models/tag.model';
import { RecurringExpense } from '../models/recurring-expense.model';
import { ExpenseFilters } from '../store/spending.state';
import {
  SpendingOverviewData,
  SpendingCategoryItem,
  SpendingTrendPoint,
  SpendingAlert,
  SpendingMerchant,
  BudgetVsActualItem,
  SpendingInsight
} from '../models/spending-summary.model';

@Injectable({
  providedIn: 'root'
})
export class SpendingFacade {
  private readonly store: Store = inject(Store);

  // Status & Feedback
  readonly isLoading$: Observable<boolean> = this.store.select(SpendingSelectors.selectIsLoading);
  readonly error$: Observable<string | null> = this.store.select(SpendingSelectors.selectSpendingError);
  readonly successMessage$: Observable<string | null> = this.store.select(SpendingSelectors.selectSuccessMessage);
  readonly hasData$: Observable<boolean> = this.store.select(SpendingSelectors.selectHasLoadedData);

  // Overview & KPIs
  readonly overview$: Observable<SpendingOverviewData | null> = this.store.select(SpendingSelectors.selectSpendingOverview);
  readonly totalSpending$: Observable<number> = this.store.select(SpendingSelectors.selectTotalSpending);
  readonly transactionCount$: Observable<number> = this.store.select(SpendingSelectors.selectTransactionCount);
  readonly averageDailySpending$: Observable<number> = this.store.select(SpendingSelectors.selectAverageDailySpending);
  readonly topCategory$: Observable<{ name: string; amount: number }> = this.store.select(SpendingSelectors.selectTopCategory);
  readonly budgetUsed$: Observable<number> = this.store.select(SpendingSelectors.selectBudgetUsed);

  // Charts
  readonly categories$: Observable<SpendingCategoryItem[]> = this.store.select(SpendingSelectors.selectSpendingCategories);
  readonly trendPoints$: Observable<SpendingTrendPoint[]> = this.store.select(SpendingSelectors.selectSpendingTrendPoints);
  readonly topMerchants$: Observable<SpendingMerchant[]> = this.store.select(SpendingSelectors.selectTopMerchants);
  readonly budgetVsActual$: Observable<BudgetVsActualItem[]> = this.store.select(SpendingSelectors.selectBudgetVsActual);

  // Expenses
  readonly allExpenses$: Observable<Expense[]> = this.store.select(SpendingSelectors.selectAllExpenses);
  readonly recentExpenses$: Observable<Expense[]> = this.store.select(SpendingSelectors.selectRecentExpenses);
  readonly filteredExpenses$: Observable<Expense[]> = this.store.select(SpendingSelectors.selectFilteredExpenses);
  readonly filters$: Observable<ExpenseFilters> = this.store.select(SpendingSelectors.selectExpenseFilters);

  // Auxiliary data
  readonly tags$: Observable<Tag[]> = this.store.select(SpendingSelectors.selectTags);
  readonly recurringExpenses$: Observable<RecurringExpense[]> = this.store.select(SpendingSelectors.selectRecurringExpenses);
  readonly alerts$: Observable<SpendingAlert[]> = this.store.select(SpendingSelectors.selectAlerts);
  readonly unreadAlertsCount$: Observable<number> = this.store.select(SpendingSelectors.selectUnreadAlertsCount);
  readonly insights$: Observable<SpendingInsight[]> = this.store.select(SpendingSelectors.selectCalculatedInsights);

  // Action Dispatchers
  loadDashboard(): void {
    this.store.dispatch(SpendingActions.loadSpendingDashboard());
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
