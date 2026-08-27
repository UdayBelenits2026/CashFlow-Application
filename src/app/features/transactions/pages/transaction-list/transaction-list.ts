import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { combineLatest, map } from 'rxjs';

import { LookupService } from '../../data/lookup.service';
import { TransactionsFacade } from '../../facades/transactions.facade';
import { TransactionSortField } from '../../models/models.transaction';
import { LookupItem } from '../../models/transaction-api.model';

@Component({
  selector: 'app-cf-transaction-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-list.html',
  styleUrl: './transaction-list.scss',
})
export class TransactionList implements OnInit {
  private readonly facade = inject(TransactionsFacade);
  private readonly lookup = inject(LookupService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly pageSizes = [10, 20, 50, 100];

  // Local UI state (kept out of the store).
  openMenuId: number | null = null;
  confirmDeleteId: number | null = null;
  accounts: LookupItem[] = [];

  // Single view-model stream keeps the template on one async subscription.
  readonly vm$ = combineLatest([
    this.facade.transactions$,
    this.facade.loading$,
    this.facade.error$,
    this.facade.successMessage$,
    this.facade.accountId$,
    this.facade.sort$,
    this.facade.pageInfo$
  ]).pipe(
    map(([transactions, loading, error, successMessage, accountId, sort, pageInfo]) => ({
      transactions,
      loading,
      error,
      successMessage,
      accountId,
      sort,
      pageInfo,
      hasActiveQuery: accountId != null
    }))
  );

  ngOnInit(): void {
    this.facade.clearFeedback();
    this.lookup
      .getAccounts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => (this.accounts = items),
        error: () => (this.accounts = [])
      });
    this.facade.loadTransactions();
  }

  // --- Account filter (server-side) ---
  onAccountChange(value: string): void {
    this.facade.setAccountFilter(value ? Number(value) : null);
  }

  clearFilters(): void {
    this.facade.clearFilters();
  }

  // --- Sorting (server-side) ---
  onSort(field: TransactionSortField, current: { field: TransactionSortField; direction: 'asc' | 'desc' }): void {
    const direction = current.field === field && current.direction === 'asc' ? 'desc' : 'asc';
    this.facade.setSort({ field, direction });
  }

  // --- Pagination (page is 0-based) ---
  goToPage(page: number): void {
    this.openMenuId = null;
    this.facade.setPage(page);
  }

  onPageSizeChange(pageSize: string): void {
    this.facade.setPageSize(Number(pageSize));
  }

  // --- Row actions ---
  toggleMenu(id: number): void {
    this.openMenuId = this.openMenuId === id ? null : id;
  }

  viewDetails(id: number): void {
    this.openMenuId = null;
    this.router.navigate(['/transactions', id]);
  }

  editTransaction(id: number): void {
    this.openMenuId = null;
    this.router.navigate(['/transactions/edit', id]);
  }

  askDelete(id: number): void {
    this.openMenuId = null;
    this.confirmDeleteId = id;
  }

  cancelDelete(): void {
    this.confirmDeleteId = null;
  }

  confirmDelete(): void {
    if (this.confirmDeleteId != null) {
      this.facade.deleteTransaction(this.confirmDeleteId);
    }
    this.confirmDeleteId = null;
  }

  dismissFeedback(): void {
    this.facade.clearFeedback();
  }

  addTransaction(): void {
    this.router.navigate(['/transactions/add']);
  }

  uploadStatement(): void {
    this.router.navigate(['/transactions/upload']);
  }
}
