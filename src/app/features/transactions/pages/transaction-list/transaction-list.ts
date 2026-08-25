import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { combineLatest, debounceTime, distinctUntilChanged, map } from 'rxjs';

import { TransactionsFacade } from '../../facades/transactions.facade';
import { Transaction, TransactionSortField } from '../../models/models.transaction';
import { DatePickerComponent, DateRange } from '../../../../shared/ui/date-picker/date-picker';

@Component({
  selector: 'app-cf-transaction-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DatePickerComponent],
  templateUrl: './transaction-list.html',
  styleUrl: './transaction-list.scss',
})
export class TransactionList implements OnInit {
  private readonly facade = inject(TransactionsFacade);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly pageSizes = [10, 25, 50, 100];

  // Local UI state (kept out of the store).
  openMenuId: string | null = null;
  isFilterPanelOpen = false;
  categoryModalId: string | null = null;
  categoryModalValue = '';
  confirmDeleteId: string | null = null;

  // Draft values for the extra-filters panel, applied on "Apply".
  draftType: '' | Transaction['type'] = '';
  draftMinAmount: number | null = null;
  draftMaxAmount: number | null = null;

  // Single view-model stream keeps the template on one async subscription.
  readonly vm$ = combineLatest([
    this.facade.transactions$,
    this.facade.loading$,
    this.facade.error$,
    this.facade.successMessage$,
    this.facade.filters$,
    this.facade.sort$,
    this.facade.accountOptions$,
    this.facade.categoryOptions$,
    this.facade.pageInfo$
  ]).pipe(
    map(([transactions, loading, error, successMessage, filters, sort, accountOptions, categoryOptions, pageInfo]) => ({
      transactions,
      loading,
      error,
      successMessage,
      filters,
      sort,
      accountOptions,
      categoryOptions,
      pageInfo,
      dateRange: { start: this.toDate(filters.startDate), end: this.toDate(filters.endDate) },
      hasActiveQuery:
        !!filters.accountId ||
        !!filters.category ||
        !!filters.type ||
        !!filters.startDate ||
        !!filters.endDate ||
        filters.minAmount !== null ||
        filters.maxAmount !== null ||
        this.searchControl.value.trim().length >= 2
    }))
  );

  ngOnInit(): void {
    this.facade.loadTransactions();

    // valueChanges -> trim -> debounce -> distinct -> search (min 2 chars, empty clears).
    this.searchControl.valueChanges
      .pipe(
        map((value) => value.trim()),
        debounceTime(350),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((term) => this.facade.setSearch(term.length >= 2 ? term : ''));
  }

  // --- Top filter bar (applied immediately) ---
  onAccountChange(accountId: string): void {
    this.facade.setFilters({ accountId });
  }

  onCategoryChange(category: string): void {
    this.facade.setFilters({ category });
  }

  onStartDateChange(startDate: string): void {
    this.facade.setFilters({ startDate });
  }

  onEndDateChange(endDate: string): void {
    this.facade.setFilters({ endDate });
  }

  // Applies the shared date-range picker selection to the store filters.
  onDateRangeChange(range: DateRange): void {
    this.facade.setFilters({ startDate: this.toIso(range.start), endDate: this.toIso(range.end) });
  }

  private toDate(value: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value ?? '');
    return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
  }

  private toIso(date: Date | null): string {
    if (!date) {
      return '';
    }
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  // --- Sorting ---
  onSort(field: TransactionSortField, current: { field: TransactionSortField; direction: 'asc' | 'desc' }): void {
    const direction = current.field === field && current.direction === 'asc' ? 'desc' : 'asc';
    this.facade.setSort({ field, direction });
  }

  // --- Pagination ---
  goToPage(page: number): void {
    this.openMenuId = null;
    this.facade.setPage(page);
  }

  onPageSizeChange(pageSize: string): void {
    this.facade.setPageSize(Number(pageSize));
  }

  // --- Extra filters panel ---
  openFilterPanel(filters: { type: '' | Transaction['type']; minAmount: number | null; maxAmount: number | null }): void {
    this.draftType = filters.type;
    this.draftMinAmount = filters.minAmount;
    this.draftMaxAmount = filters.maxAmount;
    this.isFilterPanelOpen = true;
  }

  closeFilterPanel(): void {
    this.isFilterPanelOpen = false;
  }

  applyFilters(): void {
    this.facade.setFilters({
      type: this.draftType,
      minAmount: this.draftMinAmount,
      maxAmount: this.draftMaxAmount
    });
    this.isFilterPanelOpen = false;
  }

  clearFilters(): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.draftType = '';
    this.draftMinAmount = null;
    this.draftMaxAmount = null;
    this.facade.clearFilters();
    this.isFilterPanelOpen = false;
  }

  // --- Row actions ---
  toggleMenu(id: string): void {
    this.openMenuId = this.openMenuId === id ? null : id;
  }

  viewDetails(id: string): void {
    this.openMenuId = null;
    this.router.navigate(['/transactions', id]);
  }

  editTransaction(id: string): void {
    this.openMenuId = null;
    this.router.navigate(['/transactions/edit', id]);
  }

  duplicateTransaction(transaction: Transaction): void {
    this.openMenuId = null;
    this.facade.duplicateTransaction(transaction);
  }

  openCategoryModal(transaction: Transaction): void {
    this.openMenuId = null;
    this.categoryModalId = transaction.id;
    this.categoryModalValue = transaction.category;
  }

  closeCategoryModal(): void {
    this.categoryModalId = null;
  }

  saveCategory(): void {
    if (this.categoryModalId && this.categoryModalValue) {
      this.facade.changeCategory(this.categoryModalId, this.categoryModalValue);
    }
    this.categoryModalId = null;
  }

  askDelete(id: string): void {
    this.openMenuId = null;
    this.confirmDeleteId = id;
  }

  cancelDelete(): void {
    this.confirmDeleteId = null;
  }

  confirmDelete(): void {
    if (this.confirmDeleteId) {
      this.facade.deleteTransaction(this.confirmDeleteId);
    }
    this.confirmDeleteId = null;
  }

  dismissFeedback(): void {
    this.facade.clearFeedback();
  }

  // Masks the account identifier so the full value is never exposed in the list.
  maskAccount(accountId: string): string {
    const tail = (accountId || '').slice(-4);
    return tail ? `•••• ${tail}` : '••••';
  }

  addTransaction(): void {
    this.router.navigate(['/transactions/add']);
  }

  uploadStatement(): void {
    this.router.navigate(['/transactions/upload']);
  }
}
