import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of } from 'rxjs';

import { AccountApiService } from '../../../accounts/data/account-api.service';
import { maskAccountNumber } from '../../components/transaction-form/transaction-form.util';
import { TransactionsFacade } from '../../facades/transactions.facade';
import { Transaction } from '../../models/models.transaction';

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
  private readonly accountApi = inject(AccountApiService);
  private readonly destroyRef = inject(DestroyRef);

  transaction: Transaction | null = null;
  loading = false;
  loadError: string | null = null;
  maskedAccount = '';

  confirmDeleteOpen = false;
  deleting = false;
  deleteError: string | null = null;

  private id = '';
  private pendingDelete = false;

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    this.facade.loadTransaction(this.id);

    this.facade.selectedLoading$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((loading) => (this.loading = loading));

    this.facade.selectedError$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((error) => (this.loadError = error));

    this.facade.selectedTransaction$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((transaction) => {
        this.transaction = transaction;
        if (transaction) {
          this.resolveMaskedAccount(transaction.accountId);
        }
      });

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
        this.deleteError = 'We couldn’t delete the transaction. Please try again.';
      }
    });
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

  private resolveMaskedAccount(accountId: string): void {
    this.accountApi
      .getAccountById(accountId)
      .pipe(
        catchError(() => of(null)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((account) => {
        this.maskedAccount = maskAccountNumber(account?.accountNumber ?? accountId);
      });
  }
}
