import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { IncomeFacade } from '../../facades/income.facade';
import { RecurringIncome } from '../../models/recurring-income.model';
import { IncomeSource } from '../../models/income-source.model';
import { AccountRef } from '../../models/account-ref.model';
import { formatFrequency } from '../../utility/income.helpers';

import { RecurringIncomeModalComponent } from '../../components/recurring-income-modal/recurring-income-modal.component';
import { DeleteConfirmDialogComponent } from '../../components/delete-confirm-dialog/delete-confirm-dialog.component';

@Component({
  selector: 'app-recurring-income-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    DecimalPipe,
    RecurringIncomeModalComponent,
    DeleteConfirmDialogComponent
  ],
  templateUrl: './recurring-income.component.html',
  styleUrl: './recurring-income.component.scss'
})
export class RecurringIncomeComponent implements OnInit {
  private readonly incomeFacade: IncomeFacade = inject(IncomeFacade);

  readonly recurringIncomes$: Observable<RecurringIncome[]> = this.incomeFacade.recurringIncomes$;
  readonly sources$: Observable<IncomeSource[]> = this.incomeFacade.sources$;
  readonly accounts$: Observable<AccountRef[]> = this.incomeFacade.accounts$;
  readonly isLoading$: Observable<boolean> = this.incomeFacade.isLoading$;

  searchTerm: string = '';
  statusFilter: 'ALL' | 'ACTIVE' | 'PAUSED' = 'ALL';

  showModal: boolean = false;
  showDeleteDialog: boolean = false;
  activeItem: RecurringIncome | null = null;

  ngOnInit(): void {
    this.incomeFacade.loadDashboard();
  }

  getFilteredList(items: RecurringIncome[]): RecurringIncome[] {
    return items.filter((r) => {
      const matchSearch =
        !this.searchTerm ||
        r.sourceName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        r.accountName.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchStatus = this.statusFilter === 'ALL' || r.status === this.statusFilter;
      return matchSearch && matchStatus;
    });
  }

  getTotalRecurring(items: RecurringIncome[]): number {
    return items.filter((r) => r.status === 'ACTIVE').reduce((sum, r) => sum + r.expectedAmount, 0);
  }

  getActiveCount(items: RecurringIncome[]): number {
    return items.filter((r) => r.status === 'ACTIVE').length;
  }

  getNext30DaysTotal(items: RecurringIncome[]): number {
    const today = new Date();
    const in30Days = new Date();
    in30Days.setDate(today.getDate() + 30);

    return items
      .filter((r) => {
        if (r.status !== 'ACTIVE' || !r.nextIncomeDate) return false;
        const d = new Date(r.nextIncomeDate);
        return d >= today && d <= in30Days;
      })
      .reduce((sum, r) => sum + r.expectedAmount, 0);
  }

  openCreate(): void {
    this.activeItem = null;
    this.showModal = true;
  }

  openEdit(item: RecurringIncome): void {
    this.activeItem = item;
    this.showModal = true;
  }

  openDelete(item: RecurringIncome): void {
    this.activeItem = item;
    this.showDeleteDialog = true;
  }

  onToggleStatus(item: RecurringIncome): void {
    const nextStatus = item.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    this.incomeFacade.toggleRecurring(item.id, nextStatus);
  }

  onRecordOccurrence(item: RecurringIncome): void {
    this.incomeFacade.recordRecurringIncome(item.id);
  }

  onSaveItem(payload: Partial<RecurringIncome>): void {
    this.incomeFacade.addRecurring(payload);
    this.showModal = false;
  }

  onUpdateItem(event: { id: string; item: Partial<RecurringIncome> }): void {
    this.incomeFacade.updateRecurring(event.id, event.item);
    this.showModal = false;
  }

  onConfirmDelete(): void {
    if (this.activeItem) {
      this.incomeFacade.deleteRecurring(this.activeItem.id);
      this.showDeleteDialog = false;
      this.activeItem = null;
    }
  }

  formatFrequencyLabel(freq: string): string {
    return formatFrequency(freq as any);
  }
}
