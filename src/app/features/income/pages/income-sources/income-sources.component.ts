import { ChangeDetectionStrategy, Component, OnInit, Signal, WritableSignal, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncomeFacade } from '../../facades/income.facade';
import { IncomeSource } from '../../models/income-source.model';
import { Income } from '../../models/income.model';
import { AccountRef } from '../../models/account-ref.model';

import { IncomeSourceDetailsDrawerComponent } from '../../components/income-source-details-drawer/income-source-details-drawer.component';
import { IncomeSourceModalComponent } from '../../components/income-source-modal/income-source-modal.component';
import { AddIncomeModalComponent } from '../../components/add-income-modal/add-income-modal.component';

@Component({
  selector: 'app-income-sources',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DecimalPipe,
    IncomeSourceDetailsDrawerComponent,
    IncomeSourceModalComponent,
    AddIncomeModalComponent
  ],
  templateUrl: './income-sources.component.html',
  styleUrl: './income-sources.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncomeSourcesComponent implements OnInit {
  private readonly incomeFacade: IncomeFacade = inject(IncomeFacade);

  readonly sources: Signal<IncomeSource[]> = toSignal(this.incomeFacade.sources$, { initialValue: [] });
  readonly allIncomes: Signal<Income[]> = toSignal(this.incomeFacade.allIncomes$, { initialValue: [] });
  readonly accounts: Signal<AccountRef[]> = toSignal(this.incomeFacade.accounts$, { initialValue: [] });
  readonly isLoading: Signal<boolean> = toSignal(this.incomeFacade.isLoading$, { initialValue: false });

  readonly searchTerm: WritableSignal<string> = signal('');
  readonly statusFilter: WritableSignal<'ALL' | 'ACTIVE' | 'INACTIVE'> = signal('ALL');

  readonly selectedSourceForDrawer: WritableSignal<IncomeSource | null> = signal(null);
  readonly selectedSourceForEdit: WritableSignal<IncomeSource | null> = signal(null);
  readonly prefilledSourceForIncome: WritableSignal<IncomeSource | null> = signal(null);

  readonly showSourceModal: WritableSignal<boolean> = signal(false);
  readonly showAddIncomeModal: WritableSignal<boolean> = signal(false);

  readonly filteredSources: Signal<IncomeSource[]> = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const status = this.statusFilter();
    return this.sources().filter((s) => {
      const matchSearch =
        !term ||
        s.name.toLowerCase().includes(term) ||
        s.type.toLowerCase().includes(term);
      const matchStatus = status === 'ALL' || s.status === status;
      return matchSearch && matchStatus;
    });
  });

  ngOnInit(): void {
    this.incomeFacade.loadDashboard();
  }

  getSourceIncomes(sourceId: string, allIncomes: Income[]): Income[] {
    return allIncomes.filter((i) => i.incomeSourceId === sourceId || i.sourceName === sourceId);
  }

  getActiveCount(sources: IncomeSource[]): number {
    return sources.filter((s) => s.status === 'ACTIVE').length;
  }

  getTotalYtd(sources: IncomeSource[]): number {
    return sources.reduce((sum, s) => sum + (s.totalReceivedYtd || 0), 0);
  }

  getExpectedTotal(sources: IncomeSource[]): number {
    return sources.reduce((sum, s) => sum + (s.expectedAmount || 0), 0);
  }

  getRecurringCount(sources: IncomeSource[]): number {
    return sources.filter((s) => s.isRecurring).length;
  }

  openSourceDrawer(src: IncomeSource): void {
    this.selectedSourceForDrawer.set(src);
  }

  openCreateSource(): void {
    this.selectedSourceForEdit.set(null);
    this.showSourceModal.set(true);
  }

  openEditSource(src: IncomeSource): void {
    this.selectedSourceForEdit.set(src);
    this.selectedSourceForDrawer.set(null);
    this.showSourceModal.set(true);
  }

  onToggleStatus(event: { id: string; status: 'ACTIVE' | 'INACTIVE' }): void {
    this.incomeFacade.toggleSourceStatus(event.id, event.status);
    const current = this.selectedSourceForDrawer();
    if (current && current.id === event.id) {
      this.selectedSourceForDrawer.set({ ...current, status: event.status });
    }
  }

  onSaveSource(payload: Partial<IncomeSource>): void {
    this.incomeFacade.addSource(payload);
    this.showSourceModal.set(false);
  }

  onUpdateSource(event: { id: string; source: Partial<IncomeSource> }): void {
    this.incomeFacade.updateSource(event.id, event.source);
    this.showSourceModal.set(false);
  }

  onRecordFromSource(src: IncomeSource): void {
    this.prefilledSourceForIncome.set(src);
    this.selectedSourceForDrawer.set(null);
    this.showAddIncomeModal.set(true);
  }

  onSaveIncome(income: Partial<Income>): void {
    this.incomeFacade.addIncome(income);
    this.showAddIncomeModal.set(false);
    this.prefilledSourceForIncome.set(null);
  }
}
