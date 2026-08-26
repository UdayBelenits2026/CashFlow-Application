import { ChangeDetectionStrategy, Component, OnInit, Signal, WritableSignal, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncomeFacade } from '../../facades/income.facade';
import { RecurringIncome } from '../../models/recurring-income.model';
import { IncomeSource, IncomeFrequency } from '../../models/income-source.model';
import { AccountRef } from '../../models/account-ref.model';
import { formatFrequency, getRecurringNextLabel } from '../../utility/income.helpers';
import { getDaysUntilNextIncome, getNext30DaysRecurringTotal, getRecurringNextTone } from '../../utility/income.calculations';

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
  styleUrl: './recurring-income.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecurringIncomeComponent implements OnInit {
  private readonly incomeFacade: IncomeFacade = inject(IncomeFacade);

  readonly recurringIncomes: Signal<RecurringIncome[]> = toSignal(this.incomeFacade.recurringIncomes$, { initialValue: [] });
  readonly sources: Signal<IncomeSource[]> = toSignal(this.incomeFacade.sources$, { initialValue: [] });
  readonly accounts: Signal<AccountRef[]> = toSignal(this.incomeFacade.accounts$, { initialValue: [] });
  readonly isLoading: Signal<boolean> = toSignal(this.incomeFacade.isLoading$, { initialValue: false });

  readonly searchTerm: WritableSignal<string> = signal('');
  readonly statusFilter: WritableSignal<'ALL' | 'ACTIVE' | 'PAUSED'> = signal('ALL');

  readonly showModal: WritableSignal<boolean> = signal(false);
  readonly showDeleteDialog: WritableSignal<boolean> = signal(false);
  readonly activeItem: WritableSignal<RecurringIncome | null> = signal(null);

  readonly filteredList: Signal<RecurringIncome[]> = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const status = this.statusFilter();
    return this.recurringIncomes().filter((r) => {
      const matchSearch =
        !term ||
        r.sourceName.toLowerCase().includes(term) ||
        r.accountName.toLowerCase().includes(term);
      const matchStatus = status === 'ALL' || r.status === status;
      return matchSearch && matchStatus;
    });
  });

  ngOnInit(): void {
    this.incomeFacade.loadDashboard();
  }

  getTotalRecurring(items: RecurringIncome[]): number {
    return items.filter((r) => r.status === 'ACTIVE').reduce((sum, r) => sum + r.expectedAmount, 0);
  }

  getActiveCount(items: RecurringIncome[]): number {
    return items.filter((r) => r.status === 'ACTIVE').length;
  }

  getPausedCount(items: RecurringIncome[]): number {
    return items.filter((r) => r.status === 'PAUSED').length;
  }

  getNext30DaysTotal(items: RecurringIncome[]): number {
    return getNext30DaysRecurringTotal(items);
  }

  getDaysUntilNext(item: RecurringIncome): number | null {
    return getDaysUntilNextIncome(item.nextIncomeDate);
  }

  getNextLabel(item: RecurringIncome): string {
    return getRecurringNextLabel(this.getDaysUntilNext(item));
  }

  getNextTone(item: RecurringIncome): 'overdue' | 'soon' | 'normal' | 'none' {
    return getRecurringNextTone(item);
  }

  openCreate(): void {
    this.activeItem.set(null);
    this.showModal.set(true);
  }

  openEdit(item: RecurringIncome): void {
    this.activeItem.set(item);
    this.showModal.set(true);
  }

  openDelete(item: RecurringIncome): void {
    this.activeItem.set(item);
    this.showDeleteDialog.set(true);
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
    this.showModal.set(false);
  }

  onUpdateItem(event: { id: string; item: Partial<RecurringIncome> }): void {
    this.incomeFacade.updateRecurring(event.id, event.item);
    this.showModal.set(false);
  }

  onConfirmDelete(): void {
    const current = this.activeItem();
    if (current) {
      this.incomeFacade.deleteRecurring(current.id);
      this.showDeleteDialog.set(false);
      this.activeItem.set(null);
    }
  }

  formatFrequencyLabel(freq: IncomeFrequency): string {
    return formatFrequency(freq);
  }
}
