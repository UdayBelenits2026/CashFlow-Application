import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { IncomeFacade } from '../../facades/income.facade';
import { Income } from '../../models/income.model';
import { IncomeSource } from '../../models/income-source.model';
import { AccountRef } from '../../models/account-ref.model';
import { exportIncomeToCsv } from '../../utility/income.helpers';

import { IncomeDetailsDrawerComponent } from '../../components/income-details-drawer/income-details-drawer.component';
import { AddIncomeModalComponent } from '../../components/add-income-modal/add-income-modal.component';
import { DeleteConfirmDialogComponent } from '../../components/delete-confirm-dialog/delete-confirm-dialog.component';

@Component({
  selector: 'app-income-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    DecimalPipe,
    IncomeDetailsDrawerComponent,
    AddIncomeModalComponent,
    DeleteConfirmDialogComponent
  ],
  templateUrl: './income-history.component.html',
  styleUrl: './income-history.component.scss'
})
export class IncomeHistoryComponent implements OnInit {
  protected readonly Math = Math;
  private readonly incomeFacade: IncomeFacade = inject(IncomeFacade);

  readonly allIncomes$: Observable<Income[]> = this.incomeFacade.allIncomes$;
  readonly filteredIncomes$: Observable<Income[]> = this.incomeFacade.filteredIncomes$;
  readonly sources$: Observable<IncomeSource[]> = this.incomeFacade.sources$;
  readonly accounts$: Observable<AccountRef[]> = this.incomeFacade.accounts$;
  readonly isLoading$: Observable<boolean> = this.incomeFacade.isLoading$;

  searchTerm: string = '';
  selectedSource: string = 'ALL';
  selectedAccount: string = 'ALL';
  selectedTaxable: string = 'ALL';
  startDate: string = '';
  endDate: string = '';
  minAmount: number | null = null;
  maxAmount: number | null = null;
  sortBy: 'date' | 'amount' | 'source' | 'description' = 'date';
  sortOrder: 'asc' | 'desc' = 'desc';

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  readonly pageSizeOptions: number[] = [10, 25, 50];

  showDetailsDrawer: boolean = false;
  showAddModal: boolean = false;
  showDeleteDialog: boolean = false;
  activeIncome: Income | null = null;

  ngOnInit(): void {
    this.incomeFacade.loadDashboard();
  }

  onFilterChange(): void {
    this.incomeFacade.setFilters({
      searchTerm: this.searchTerm,
      sourceId: this.selectedSource === 'ALL' ? null : this.selectedSource,
      accountId: this.selectedAccount === 'ALL' ? null : this.selectedAccount,
      taxable: this.selectedTaxable === 'ALL' ? null : this.selectedTaxable === 'TAXABLE',
      startDate: this.startDate || null,
      endDate: this.endDate || null,
      minAmount: this.minAmount,
      maxAmount: this.maxAmount,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    });
    this.currentPage = 1;
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedSource = 'ALL';
    this.selectedAccount = 'ALL';
    this.selectedTaxable = 'ALL';
    this.startDate = '';
    this.endDate = '';
    this.minAmount = null;
    this.maxAmount = null;
    this.sortBy = 'date';
    this.sortOrder = 'desc';
    this.incomeFacade.resetFilters();
    this.currentPage = 1;
  }

  onRowClick(inc: Income): void {
    this.activeIncome = inc;
    this.showDetailsDrawer = true;
  }

  openEditModal(inc: Income): void {
    this.activeIncome = inc;
    this.showDetailsDrawer = false;
    this.showAddModal = true;
  }

  onUpdateIncome(event: { id: string; income: Partial<Income> } | Partial<Income>): void {
    if ('income' in event && event.id) {
      this.incomeFacade.updateIncome(event.id, event.income);
    } else if (this.activeIncome) {
      this.incomeFacade.updateIncome(this.activeIncome.id, event as Partial<Income>);
    }
    this.showAddModal = false;
  }

  onSaveIncome(income: Partial<Income>): void {
    this.incomeFacade.addIncome(income);
    this.showAddModal = false;
  }

  openDeleteDialog(inc: Income): void {
    this.activeIncome = inc;
    this.showDetailsDrawer = false;
    this.showDeleteDialog = true;
  }

  onConfirmDelete(): void {
    if (this.activeIncome) {
      this.incomeFacade.deleteIncome(this.activeIncome.id);
      this.showDeleteDialog = false;
      this.activeIncome = null;
    }
  }

  onExportCsv(incomes: Income[]): void {
    exportIncomeToCsv(incomes, 'income-transactions-export');
  }

  // Summary Metrics calculations
  getTotalReceived(incomes: Income[]): number {
    return incomes.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  }

  getAverageAmount(incomes: Income[]): number {
    return incomes.length > 0 ? this.getTotalReceived(incomes) / incomes.length : 0;
  }

  getHighestAmount(incomes: Income[]): number {
    return incomes.length > 0 ? Math.max(...incomes.map((i) => Number(i.amount) || 0)) : 0;
  }

  getPaginatedIncomes(incomes: Income[]): Income[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return incomes.slice(start, start + this.pageSize);
  }

  getTotalPages(totalCount: number): number {
    return Math.ceil(totalCount / this.pageSize) || 1;
  }
}
