import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { TransactionSort } from '../models/models.transaction';
import {
  CreateTransactionRequest,
  UpdateTransactionRequest,
} from '../models/transaction-api.model';
import * as TransactionsActions from '../store/transactions.actions';
import * as TransactionsSelectors from '../store/transactions.select';

@Injectable({
  providedIn: 'root',
})
export class TransactionsFacade {
  private readonly store = inject(Store);

  // List streams (server-paged).
  readonly transactions$ = this.store.select(TransactionsSelectors.selectTransactionContent);
  readonly loading$ = this.store.select(TransactionsSelectors.selectTransactionsLoading);
  readonly error$ = this.store.select(TransactionsSelectors.selectTransactionsError);
  readonly successMessage$ = this.store.select(TransactionsSelectors.selectTransactionsSuccess);
  readonly filters$ = this.store.select(TransactionsSelectors.selectTransactionFilters);
  readonly accountId$ = this.store.select(TransactionsSelectors.selectTransactionAccountId);
  readonly sort$ = this.store.select(TransactionsSelectors.selectTransactionSort);
  readonly pageInfo$ = this.store.select(TransactionsSelectors.selectTransactionPageInfo);
  readonly totalCount$ = this.store.select(TransactionsSelectors.selectTransactionTotalElements);

  // Read-only details streams.
  readonly detail$ = this.store.select(TransactionsSelectors.selectTransactionDetail);
  readonly detailLoading$ = this.store.select(TransactionsSelectors.selectTransactionDetailLoading);
  readonly detailError$ = this.store.select(TransactionsSelectors.selectTransactionDetailError);

  // Edit-form streams.
  readonly editData$ = this.store.select(TransactionsSelectors.selectTransactionEditData);
  readonly editLoading$ = this.store.select(TransactionsSelectors.selectTransactionEditLoading);
  readonly editError$ = this.store.select(TransactionsSelectors.selectTransactionEditError);
  readonly saving$ = this.store.select(TransactionsSelectors.selectTransactionSaving);

  loadTransactions(): void {
    this.store.dispatch(TransactionsActions.loadTransactions());
  }

  setAccountFilter(accountId: number | null): void {
    this.store.dispatch(TransactionsActions.setTransactionAccountFilter({ accountId }));
  }

  clearFilters(): void {
    this.store.dispatch(TransactionsActions.clearTransactionFilters());
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

  clearFeedback(): void {
    this.store.dispatch(TransactionsActions.clearTransactionFeedback());
  }

  loadDetail(id: number): void {
    this.store.dispatch(TransactionsActions.loadTransactionDetail({ id }));
  }

  clearDetail(): void {
    this.store.dispatch(TransactionsActions.clearTransactionDetail());
  }

  loadForEdit(id: number): void {
    this.store.dispatch(TransactionsActions.loadTransactionForEdit({ id }));
  }

  clearEdit(): void {
    this.store.dispatch(TransactionsActions.clearTransactionEdit());
  }

  createTransaction(request: CreateTransactionRequest, idempotencyKey: string): void {
    this.store.dispatch(TransactionsActions.createTransaction({ request, idempotencyKey }));
  }

  updateTransaction(id: number, request: UpdateTransactionRequest): void {
    this.store.dispatch(TransactionsActions.updateTransaction({ id, request }));
  }

  deleteTransaction(id: number): void {
    this.store.dispatch(TransactionsActions.deleteTransaction({ id }));
  }
}
