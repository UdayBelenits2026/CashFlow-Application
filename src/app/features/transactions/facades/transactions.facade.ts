import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { CreateTransactionRequest, Transaction, TransactionFilters, TransactionSort } from '../models/models.transaction';
import * as TransactionsActions from '../store/transactions.actions';
import * as TransactionsSelectors from '../store/transactions.select';

@Injectable({
  providedIn: 'root'
})
export class TransactionsFacade {
  private readonly store = inject(Store);

  // Read-only streams consumed by the transactions page.
  readonly transactions$ = this.store.select(TransactionsSelectors.selectPagedTransactions);
  readonly loading$ = this.store.select(TransactionsSelectors.selectTransactionsLoading);
  readonly error$ = this.store.select(TransactionsSelectors.selectTransactionsError);
  readonly successMessage$ = this.store.select(TransactionsSelectors.selectTransactionsSuccess);
  readonly filters$ = this.store.select(TransactionsSelectors.selectTransactionFilters);
  readonly search$ = this.store.select(TransactionsSelectors.selectTransactionSearch);
  readonly sort$ = this.store.select(TransactionsSelectors.selectTransactionSort);
  readonly accountOptions$ = this.store.select(TransactionsSelectors.selectAccountOptions);
  readonly categoryOptions$ = this.store.select(TransactionsSelectors.selectCategoryOptions);
  readonly pageInfo$ = this.store.select(TransactionsSelectors.selectTransactionPageInfo);
  readonly totalCount$ = this.store.select(TransactionsSelectors.selectFilteredCount);

  // Edit-form streams.
  readonly selectedTransaction$ = this.store.select(TransactionsSelectors.selectSelectedTransaction);
  readonly selectedLoading$ = this.store.select(TransactionsSelectors.selectSelectedLoading);
  readonly selectedError$ = this.store.select(TransactionsSelectors.selectSelectedError);
  readonly saving$ = this.store.select(TransactionsSelectors.selectTransactionSaving);

  loadTransactions(): void {
    this.store.dispatch(TransactionsActions.loadTransactions());
  }

  setFilters(filters: Partial<TransactionFilters>): void {
    this.store.dispatch(TransactionsActions.setTransactionFilters({ filters }));
  }

  clearFilters(): void {
    this.store.dispatch(TransactionsActions.clearTransactionFilters());
  }

  setSearch(search: string): void {
    this.store.dispatch(TransactionsActions.setTransactionSearch({ search }));
  }

  setSort(sort: TransactionSort): void {
    this.store.dispatch(TransactionsActions.setTransactionSort({ sort }));
  }

  setPage(page: number): void {
    this.store.dispatch(TransactionsActions.setTransactionPage({ page }));
  }

  setPageSize(pageSize: number): void {
    this.store.dispatch(TransactionsActions.setTransactionPageSize({ pageSize }));
  }

  deleteTransaction(id: string): void {
    this.store.dispatch(TransactionsActions.deleteTransaction({ id }));
  }

  duplicateTransaction(transaction: Transaction): void {
    this.store.dispatch(TransactionsActions.duplicateTransaction({ transaction }));
  }

  changeCategory(id: string, category: string): void {
    this.store.dispatch(TransactionsActions.changeTransactionCategory({ id, category }));
  }

  clearFeedback(): void {
    this.store.dispatch(TransactionsActions.clearTransactionFeedback());
  }

  loadTransaction(id: string): void {
    this.store.dispatch(TransactionsActions.loadTransaction({ id }));
  }

  clearSelected(): void {
    this.store.dispatch(TransactionsActions.clearSelectedTransaction());
  }

  createTransaction(transaction: CreateTransactionRequest, idempotencyKey: string): void {
    this.store.dispatch(TransactionsActions.createTransaction({ transaction, idempotencyKey }));
  }

  updateTransaction(id: string, changes: Partial<Transaction>): void {
    this.store.dispatch(TransactionsActions.updateTransaction({ id, changes }));
  }
}
