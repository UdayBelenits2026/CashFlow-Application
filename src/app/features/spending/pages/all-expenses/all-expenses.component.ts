import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpendingFacade } from '../../facades/spending.facade';
import { Expense } from '../../models/expense.model';
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
  styleUrl: './all-expenses.component.scss'
})
export class AllExpensesComponent implements OnInit {
  private readonly spendingFacade = inject(SpendingFacade);

  readonly allExpenses$ = this.spendingFacade.allExpenses$;
  readonly filteredExpenses$ = this.spendingFacade.filteredExpenses$;
  readonly categories$ = this.spendingFacade.categories$;
  readonly isLoading$ = this.spendingFacade.isLoading$;

  searchTerm = '';
  selectedCategory = 'ALL';
  selectedAccount = 'ALL';
  sortBy = 'NEWEST';

  // Pagination State
  currentPage = 1;
  pageSize = 10;
  readonly pageSizeOptions = [10, 25, 50];

  showAddModal = false;
  showEditModal = false;
  showDeleteDialog = false;
  showReceiptViewer = false;
  showDetailsDrawer = false;
  showSplitModal = false;

  activeExpense: Expense | null = null;

  ngOnInit(): void {
    this.spendingFacade.loadDashboard();
  }

  onFilterChange(): void {
    this.currentPage = 1; // Reset to first page on filter change
    let sortBy: 'date' | 'amount' | 'merchant' = 'date';
    let sortOrder: 'asc' | 'desc' = 'desc';

    if (this.sortBy === 'NEWEST') {
      sortBy = 'date';
      sortOrder = 'desc';
    } else if (this.sortBy === 'OLDEST') {
      sortBy = 'date';
      sortOrder = 'asc';
    } else if (this.sortBy === 'AMOUNT_DESC') {
      sortBy = 'amount';
      sortOrder = 'desc';
    } else if (this.sortBy === 'AMOUNT_ASC') {
      sortBy = 'amount';
      sortOrder = 'asc';
    }

    this.spendingFacade.setFilters({
      searchTerm: this.searchTerm,
      categoryId: this.selectedCategory === 'ALL' ? null : this.selectedCategory,
      sortBy,
      sortOrder
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = 'ALL';
    this.selectedAccount = 'ALL';
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
    const sub = this.filteredExpenses$.subscribe((expenses) => {
      if (!expenses || expenses.length === 0) return;

      const headers = ['Transaction ID', 'Date', 'Merchant', 'Category', 'Account', 'Payment Method', 'Amount ($)', 'Status', 'Notes'];
      const rows = expenses.map(e => [
        `"${e.id}"`,
        `"${e.date}"`,
        `"${e.merchantName.replace(/"/g, '""')}"`,
        `"${e.categoryName.replace(/"/g, '""')}"`,
        `"${e.accountName.replace(/"/g, '""')}"`,
        `"${e.paymentMethod || 'DEBIT_CARD'}"`,
        e.amount,
        `"${e.status || 'CLEARED'}"`,
        `"${(e.notes || '').replace(/"/g, '""')}"`
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `spending_expenses_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
    sub.unsubscribe();
  }

  formatPayment(method?: string): string {
    switch (method) {
      case 'DEBIT_CARD': return 'Debit Card';
      case 'CREDIT_CARD': return 'Credit Card';
      case 'BANK_TRANSFER': return 'Bank Transfer';
      case 'CASH': return 'Cash';
      default: return method || 'Card';
    }
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
