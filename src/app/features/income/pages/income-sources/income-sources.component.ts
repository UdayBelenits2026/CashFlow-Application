import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
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
  styleUrl: './income-sources.component.scss'
})
export class IncomeSourcesComponent implements OnInit {
  private readonly incomeFacade: IncomeFacade = inject(IncomeFacade);

  readonly sources$: Observable<IncomeSource[]> = this.incomeFacade.sources$;
  readonly allIncomes$: Observable<Income[]> = this.incomeFacade.allIncomes$;
  readonly accounts$: Observable<AccountRef[]> = this.incomeFacade.accounts$;
  readonly isLoading$: Observable<boolean> = this.incomeFacade.isLoading$;

  searchTerm: string = '';
  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE' = 'ALL';

  selectedSourceForDrawer: IncomeSource | null = null;
  selectedSourceForEdit: IncomeSource | null = null;
  prefilledSourceForIncome: IncomeSource | null = null;

  showSourceModal: boolean = false;
  showAddIncomeModal: boolean = false;

  ngOnInit(): void {
    this.incomeFacade.loadDashboard();
  }

  getFilteredSources(sources: IncomeSource[]): IncomeSource[] {
    return sources.filter((s) => {
      const matchSearch =
        !this.searchTerm ||
        s.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        s.type.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchStatus = this.statusFilter === 'ALL' || s.status === this.statusFilter;
      return matchSearch && matchStatus;
    });
  }

  getSourceIncomes(sourceId: string, allIncomes: Income[]): Income[] {
    return allIncomes.filter((i) => i.incomeSourceId === sourceId || i.sourceName === sourceId);
  }

  openSourceDrawer(src: IncomeSource): void {
    this.selectedSourceForDrawer = src;
  }

  openCreateSource(): void {
    this.selectedSourceForEdit = null;
    this.showSourceModal = true;
  }

  openEditSource(src: IncomeSource): void {
    this.selectedSourceForEdit = src;
    this.selectedSourceForDrawer = null;
    this.showSourceModal = true;
  }

  onToggleStatus(event: { id: string; status: 'ACTIVE' | 'INACTIVE' }): void {
    this.incomeFacade.toggleSourceStatus(event.id, event.status);
    if (this.selectedSourceForDrawer && this.selectedSourceForDrawer.id === event.id) {
      this.selectedSourceForDrawer = { ...this.selectedSourceForDrawer, status: event.status };
    }
  }

  onSaveSource(payload: Partial<IncomeSource>): void {
    this.incomeFacade.addSource(payload);
    this.showSourceModal = false;
  }

  onUpdateSource(event: { id: string; source: Partial<IncomeSource> }): void {
    this.incomeFacade.updateSource(event.id, event.source);
    this.showSourceModal = false;
  }

  onRecordFromSource(src: IncomeSource): void {
    this.prefilledSourceForIncome = src;
    this.selectedSourceForDrawer = null;
    this.showAddIncomeModal = true;
  }

  onSaveIncome(income: Partial<Income>): void {
    this.incomeFacade.addIncome(income);
    this.showAddIncomeModal = false;
    this.prefilledSourceForIncome = null;
  }
}
