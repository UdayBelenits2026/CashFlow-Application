import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom, Observable } from 'rxjs';
import { SpendingFacade } from '../../facades/spending.facade';
import { Expense } from '../../models/expense.model';
import { SpendingCategoryItem } from '../../models/spending-summary.model';
import { exportExpensesToCsv, formatPaymentMethod } from '../../utility/spending.helpers';
import { ExpenseDetailsDrawerComponent } from '../../components/expense-details-drawer/expense-details-drawer.component';
import { AddExpenseModalComponent } from '../../components/add-expense-modal/add-expense-modal.component';
import { DeleteConfirmDialogComponent } from '../../components/delete-confirm-dialog/delete-confirm-dialog.component';
import { ReceiptViewerModalComponent } from '../../components/receipt-viewer-modal/receipt-viewer-modal.component';
import { SplitExpenseModalComponent } from '../../components/split-expense-modal/split-expense-modal.component';

@Component({
  selector: 'app-all-expenses',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    DecimalPipe,
    ExpenseDetailsDrawerComponent,
    AddExpenseModalComponent,
    DeleteConfirmDialogComponent,
    ReceiptViewerModalComponent,
    SplitExpenseModalComponent
  ],
  templateUrl: './all-expenses.component.html',
  styleUrl: './all-expenses.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllExpensesComponent implements OnInit {
  private readonly spendingFacade: SpendingFacade = inject(SpendingFacade);

  readonly allExpenses$: Observable<Expense[]> = this.spendingFacade.allExpenses$;
  readonly filteredExpenses$: Observable<Expense[]> = this.spendingFacade.filteredExpenses$;
  readonly categories$: Observable<SpendingCategoryItem[]> = this.spendingFacade.categories$;
  readonly isLoading$: Observable<boolean> = this.spendingFacade.isLoading$;

  searchTerm: string = '';
  selectedCategory: string = 'ALL';
  selectedAccount: string = 'ALL';
  selectedPayment: string = 'ALL';
  startDate: string = '';
  endDate: string = '';
  minAmount: number | null = null;
  maxAmount: number | null = null;
  sortBy: string = 'NEWEST';

  // Pagination State
  currentPage: number = 1;
  pageSize: number = 10;
  readonly pageSizeOptions: number[] = [10, 25, 50];

  showAddModal: boolean = false;
  showEditModal: boolean = false;
  showDeleteDialog: boolean = false;
  showReceiptViewer: boolean = false;
  showDetailsDrawer: boolean = false;
  showSplitModal: boolean = false;

  activeExpense: Expense | null = null;

  ngOnInit(): void {
    this.spendingFacade.loadDashboard();
  }

  onFilterChange(): void {
    this.currentPage = 1; // Reset to first page on filter change
    let sortBy: 'date' | 'amount' | 'merchant' = 'date';
    let sortOrder: 'asc' | 'desc' = 'desc';

    switch (this.sortBy) {
      case 'NEWEST':
        sortBy = 'date';
        sortOrder = 'desc';
        break;
      case 'OLDEST':
        sortBy = 'date';
        sortOrder = 'asc';
        break;
      case 'AMOUNT_DESC':
        sortBy = 'amount';
        sortOrder = 'desc';
        break;
      case 'AMOUNT_ASC':
        sortBy = 'amount';
        sortOrder = 'asc';
        break;
    }

    this.spendingFacade.setFilters({
      searchTerm: this.searchTerm,
      categoryId: this.selectedCategory === 'ALL' ? null : this.selectedCategory,
      accountId: this.selectedAccount === 'ALL' ? null : this.selectedAccount,
      paymentMethod: this.selectedPayment === 'ALL' ? null : this.selectedPayment,
      startDate: this.startDate || null,
      endDate: this.endDate || null,
      minAmount: this.minAmount !== null && this.minAmount !== undefined && `${this.minAmount}` !== '' ? Number(this.minAmount) : null,
      maxAmount: this.maxAmount !== null && this.maxAmount !== undefined && `${this.maxAmount}` !== '' ? Number(this.maxAmount) : null,
      sortBy,
      sortOrder
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = 'ALL';
    this.selectedAccount = 'ALL';
    this.selectedPayment = 'ALL';
    this.startDate = '';
    this.endDate = '';
    this.minAmount = null;
    this.maxAmount = null;
    this.sortBy = 'NEWEST';
    this.currentPage = 1;
    this.spendingFacade.resetFilters();
  }

  // Pagination Helpers
  getPaginatedExpenses(expenses: Expense[]): Expense[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return expenses.slice(startIndex, startIndex + this.pageSize);
  }

  getTotalPages(totalItems: number): number {
    return Math.ceil(totalItems / this.pageSize) || 1;
  }

  setPage(page: number, totalItems: number): void {
    const totalPages = this.getTotalPages(totalItems);
    if (page >= 1 && page <= totalPages) {
      this.currentPage = page;
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
  }

  // CSV Export Feature
  exportToCsv(): void {
    firstValueFrom(this.filteredExpenses$).then((expenses) => {
      if (!expenses || expenses.length === 0) return;
      exportExpensesToCsv(expenses, `spending_expenses_${new Date().toISOString().split('T')[0]}`);
    });
  }

  formatPayment(method?: string): string {
    return formatPaymentMethod(method);
  }

  onSelectExpense(exp: Expense): void {
    this.activeExpense = exp;
    this.showDetailsDrawer = true;
  }

  onSaveNewExpense(expense: Partial<Expense>): void {
    this.spendingFacade.addExpense(expense);
    this.showAddModal = false;
  }

  openEditModal(exp: Expense): void {
    this.activeExpense = exp;
    this.showDetailsDrawer = false;
    this.showEditModal = true;
  }

  onUpdateExpense(event: { id: string; expense: Partial<Expense> } | Partial<Expense>): void {
    if ('expense' in event && event.id) {
      this.spendingFacade.updateExpense(event.id, event.expense);
    } else if (this.activeExpense) {
      this.spendingFacade.updateExpense(this.activeExpense.id, event as Partial<Expense>);
    }
    this.showEditModal = false;
  }

  openDeleteDialog(exp: Expense): void {
    this.activeExpense = exp;
    this.showDetailsDrawer = false;
    this.showDeleteDialog = true;
  }

  onConfirmDeleteExpense(id: string): void {
    this.spendingFacade.deleteExpense(id);
    this.showDeleteDialog = false;
    this.showDetailsDrawer = false;
    this.activeExpense = null;
  }

  openReceiptViewer(exp: Expense): void {
    this.activeExpense = exp;
    this.showReceiptViewer = true;
  }

  onUpdateReceipt(event: { id: string; receiptUrl: string; receiptFileName: string }): void {
    if (this.activeExpense) {
      this.spendingFacade.updateExpense(event.id, {
        receiptUrl: event.receiptUrl,
        receiptFileName: event.receiptFileName
      });
      this.activeExpense = { ...this.activeExpense, receiptUrl: event.receiptUrl, receiptFileName: event.receiptFileName };
    }
  }

  onRemoveReceipt(id: string): void {
    if (this.activeExpense) {
      this.spendingFacade.updateExpense(id, { receiptUrl: undefined, receiptFileName: undefined });
      this.activeExpense = { ...this.activeExpense, receiptUrl: undefined, receiptFileName: undefined };
    }
  }

  // Split Feature Handlers
  openSplitModal(exp: Expense): void {
    this.activeExpense = exp;
    this.showDetailsDrawer = false;
    this.showSplitModal = true;
  }

  onSaveSplits(event: { originalId: string; splits: Partial<Expense>[] }): void {
    // Delete original and add the split items
    this.spendingFacade.deleteExpense(event.originalId);
    event.splits.forEach((splitItem) => {
      this.spendingFacade.addExpense(splitItem);
    });
    this.showSplitModal = false;
    this.activeExpense = null;
  }
}
