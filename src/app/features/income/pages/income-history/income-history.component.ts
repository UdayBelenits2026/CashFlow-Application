import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed, Signal, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncomeFacade } from '../../facades/income.facade';
import { Income, SortField } from '../../models/income.model';
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
  styleUrl: './income-history.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncomeHistoryComponent implements OnInit {
  private readonly incomeFacade: IncomeFacade = inject(IncomeFacade);

  readonly allIncomes: Signal<Income[]> = toSignal(this.incomeFacade.allIncomes$, { initialValue: [] as Income[] });
  readonly filteredIncomes: Signal<Income[]> = toSignal(this.incomeFacade.filteredIncomes$, { initialValue: [] as Income[] });
  readonly sources: Signal<IncomeSource[]> = toSignal(this.incomeFacade.sources$, { initialValue: [] as IncomeSource[] });
  readonly accounts: Signal<AccountRef[]> = toSignal(this.incomeFacade.accounts$, { initialValue: [] as AccountRef[] });
  readonly isLoading: Signal<boolean> = toSignal(this.incomeFacade.isLoading$, { initialValue: false });

  readonly searchTerm: WritableSignal<string> = signal('');
  readonly selectedSource: WritableSignal<string> = signal('ALL');
  readonly selectedAccount: WritableSignal<string> = signal('ALL');
  readonly selectedTaxable: WritableSignal<string> = signal('ALL');
  readonly startDate: WritableSignal<string> = signal('');
  readonly endDate: WritableSignal<string> = signal('');
  readonly minAmount: WritableSignal<number | null> = signal<number | null>(null);
  readonly maxAmount: WritableSignal<number | null> = signal<number | null>(null);
  readonly sortBy: WritableSignal<SortField> = signal<SortField>('date');
  readonly sortOrder: WritableSignal<'asc' | 'desc'> = signal<'asc' | 'desc'>('desc');

  readonly currentPage: WritableSignal<number> = signal(1);
  readonly pageSize: WritableSignal<number> = signal(10);
  readonly pageSizeOptions: number[] = [10, 25, 50];

  readonly showDetailsDrawer: WritableSignal<boolean> = signal(false);
  readonly showAddModal: WritableSignal<boolean> = signal(false);
  readonly showDeleteDialog: WritableSignal<boolean> = signal(false);
  readonly activeIncome: WritableSignal<Income | null> = signal<Income | null>(null);

  readonly totalReceived: Signal<number> = computed(() =>
    this.filteredIncomes().reduce((sum, i) => sum + (Number(i.amount) || 0), 0)
  );
  readonly averageAmount: Signal<number> = computed(() => {
    const rows = this.filteredIncomes();
    return rows.length > 0 ? this.totalReceived() / rows.length : 0;
  });
  readonly highestAmount: Signal<number> = computed(() => {
    const rows = this.filteredIncomes();
    return rows.length > 0 ? Math.max(...rows.map((i) => Number(i.amount) || 0)) : 0;
  });
  readonly taxableTotal: Signal<number> = computed(() =>
    this.filteredIncomes().filter((i) => i.taxable).reduce((sum, i) => sum + (Number(i.amount) || 0), 0)
  );
  readonly totalPages: Signal<number> = computed(() => Math.ceil(this.filteredIncomes().length / this.pageSize()) || 1);
  readonly pageRangeEnd: Signal<number> = computed(() => Math.min(this.currentPage() * this.pageSize(), this.filteredIncomes().length));
  readonly paginatedIncomes: Signal<Income[]> = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredIncomes().slice(start, start + this.pageSize());
  });

  ngOnInit(): void {
    this.incomeFacade.loadDashboard();
  }

  onFilterChange(): void {
    this.incomeFacade.setFilters({
      searchTerm: this.searchTerm(),
      sourceId: this.selectedSource() === 'ALL' ? null : this.selectedSource(),
      accountId: this.selectedAccount() === 'ALL' ? null : this.selectedAccount(),
      taxable: this.selectedTaxable() === 'ALL' ? null : this.selectedTaxable() === 'TAXABLE',
      startDate: this.startDate() || null,
      endDate: this.endDate() || null,
      minAmount: this.minAmount(),
      maxAmount: this.maxAmount(),
      sortBy: this.sortBy(),
      sortOrder: this.sortOrder()
    });
    this.currentPage.set(1);
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.selectedSource.set('ALL');
    this.selectedAccount.set('ALL');
    this.selectedTaxable.set('ALL');
    this.startDate.set('');
    this.endDate.set('');
    this.minAmount.set(null);
    this.maxAmount.set(null);
    this.sortBy.set('date');
    this.sortOrder.set('desc');
    this.incomeFacade.resetFilters();
    this.currentPage.set(1);
  }

  onRowClick(inc: Income): void {
    this.activeIncome.set(inc);
    this.showDetailsDrawer.set(true);
  }

  openEditModal(inc: Income): void {
    this.activeIncome.set(inc);
    this.showDetailsDrawer.set(false);
    this.showAddModal.set(true);
  }

  onUpdateIncome(event: { id: string; income: Partial<Income> } | Partial<Income>): void {
    if ('income' in event && event.id) {
      this.incomeFacade.updateIncome(event.id, event.income);
    } else {
      const inc = this.activeIncome();
      if (inc) this.incomeFacade.updateIncome(inc.id, event as Partial<Income>);
    }
    this.showAddModal.set(false);
  }

  onSaveIncome(income: Partial<Income>): void {
    this.incomeFacade.addIncome(income);
    this.showAddModal.set(false);
  }

  openDeleteDialog(inc: Income): void {
    this.activeIncome.set(inc);
    this.showDetailsDrawer.set(false);
    this.showDeleteDialog.set(true);
  }

  onConfirmDelete(): void {
    const inc = this.activeIncome();
    if (inc) {
      this.incomeFacade.deleteIncome(inc.id, inc.accountId);
      this.showDeleteDialog.set(false);
      this.activeIncome.set(null);
    }
  }

  onExportCsv(incomes: Income[]): void {
    exportIncomeToCsv(incomes, 'income-transactions-export');
  }

  setSort(field: SortField): void {
    if (this.sortBy() === field) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortOrder.set('desc');
    }
    this.onFilterChange();
  }

  hasActiveFilters(): boolean {
    return (
      !!this.searchTerm() ||
      this.selectedSource() !== 'ALL' ||
      this.selectedAccount() !== 'ALL' ||
      this.selectedTaxable() !== 'ALL' ||
      !!this.startDate() || !!this.endDate() ||
      this.minAmount() != null || this.maxAmount() != null
    );
  }

  clearSearch(): void { this.searchTerm.set(''); this.onFilterChange(); }
  clearSource(): void { this.selectedSource.set('ALL'); this.onFilterChange(); }
  clearAccount(): void { this.selectedAccount.set('ALL'); this.onFilterChange(); }
  clearTaxable(): void { this.selectedTaxable.set('ALL'); this.onFilterChange(); }
  clearDates(): void { this.startDate.set(''); this.endDate.set(''); this.onFilterChange(); }
  clearAmount(): void { this.minAmount.set(null); this.maxAmount.set(null); this.onFilterChange(); }

  setPage(page: number): void { this.currentPage.set(page); }
  setPageSize(size: number): void { this.pageSize.set(size); this.currentPage.set(1); }

  sourceName(id: string, sources: IncomeSource[]): string {
    return sources.find((s) => s.id === id)?.name || id;
  }

  accountName(id: string, accounts: AccountRef[]): string {
    return accounts.find((a) => a.id === id)?.name || id;
  }
}
