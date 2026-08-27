import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { LookupService } from '../../data/lookup.service';
import { TransactionsFacade } from '../../facades/transactions.facade';
import { LookupItem, TransactionDetail } from '../../models/transaction-api.model';

// Read-only details view for a single transaction with edit/delete actions.
@Component({
  selector: 'app-cf-transaction-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-details.html',
  styleUrl: './transaction-details.scss',
})
export class TransactionDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly facade = inject(TransactionsFacade);
  private readonly lookup = inject(LookupService);
  private readonly destroyRef = inject(DestroyRef);

  transaction: TransactionDetail | null = null;
  loading = false;
  loadError: string | null = null;

  confirmDeleteOpen = false;
  deleting = false;
  deleteError: string | null = null;

  private accounts: LookupItem[] = [];
  private categories: LookupItem[] = [];
  private merchants: LookupItem[] = [];
  private incomeSources: LookupItem[] = [];

  private id = 0;
  private pendingDelete = false;

  ngOnInit(): void {
    this.facade.clearFeedback();
    this.id = Number(this.route.snapshot.paramMap.get('id'));

    this.loadLookups();
    this.facade.loadDetail(this.id);

    this.facade.detailLoading$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((loading) => (this.loading = loading));

    this.facade.detailError$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((error) => (this.loadError = error));

    this.facade.detail$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((detail) => (this.transaction = detail));

    // Delete outcome (only reacts once the user confirms a delete).
    this.facade.successMessage$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((message) => {
      if (this.pendingDelete && message) {
        this.pendingDelete = false;
        this.router.navigate(['/transactions']);
      }
    });

    this.facade.error$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((error) => {
      if (this.pendingDelete && error) {
        this.pendingDelete = false;
        this.deleting = false;
        this.confirmDeleteOpen = false;
        this.deleteError = error;
      }
    });
  }

  // Resolve IDs to names via lookups; falls back to #id when the lookup is unavailable.
  accountName(): string {
    return this.nameFor(this.accounts, this.transaction?.accountId);
  }

  categoryName(): string {
    return this.nameFor(this.categories, this.transaction?.categoryId);
  }

  merchantName(): string {
    return this.nameFor(this.merchants, this.transaction?.merchantId);
  }

  incomeSourceName(): string {
    return this.nameFor(this.incomeSources, this.transaction?.incomeSourceId);
  }

  goBack(): void {
    this.router.navigate(['/transactions']);
  }

  editTransaction(): void {
    this.router.navigate(['/transactions/edit', this.id]);
  }

  openDeleteConfirm(): void {
    this.deleteError = null;
    this.confirmDeleteOpen = true;
  }

  cancelDelete(): void {
    this.confirmDeleteOpen = false;
  }

  confirmDelete(): void {
    if (this.deleting) {
      return;
    }
    this.deleting = true;
    this.pendingDelete = true;
    this.facade.deleteTransaction(this.id);
  }

  private loadLookups(): void {
    this.bind(() => this.lookup.getAccounts(), (items) => (this.accounts = items));
    this.bind(() => this.lookup.getCategories(), (items) => (this.categories = items));
    this.bind(() => this.lookup.getMerchants(), (items) => (this.merchants = items));
    this.bind(() => this.lookup.getIncomeSources(), (items) => (this.incomeSources = items));
  }

  private bind(
    source: () => Observable<LookupItem[]>,
    assign: (items: LookupItem[]) => void
  ): void {
    source()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: assign, error: () => assign([]) });
  }

  private nameFor(list: LookupItem[], id: number | undefined): string {
    if (id == null) {
      return '—';
    }
    return list.find((item) => item.id === id)?.name ?? `#${id}`;
  }
}
