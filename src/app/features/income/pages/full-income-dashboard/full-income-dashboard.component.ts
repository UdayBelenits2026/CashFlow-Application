import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { IncomeFacade } from '../../facades/income.facade';
import { Income } from '../../models/income.model';
import { IncomeSource } from '../../models/income-source.model';
import { AccountRef } from '../../models/account-ref.model';
import {
  IncomeOverviewData,
  UpcomingIncomeItem
} from '../../models/income-summary.model';

import { IncomeKpiCardsComponent } from '../../components/income-kpi-cards/income-kpi-cards.component';
import { RecentIncomeComponent } from '../../components/recent-income/recent-income.component';
import { UpcomingIncomeComponent } from '../../components/upcoming-income/upcoming-income.component';
import { IncomeDetailsDrawerComponent } from '../../components/income-details-drawer/income-details-drawer.component';
import { AddIncomeModalComponent } from '../../components/add-income-modal/add-income-modal.component';
import { IncomeSourceModalComponent } from '../../components/income-source-modal/income-source-modal.component';
import { DeleteConfirmDialogComponent } from '../../components/delete-confirm-dialog/delete-confirm-dialog.component';

@Component({
  selector: 'app-full-income-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IncomeKpiCardsComponent,
    RecentIncomeComponent,
    UpcomingIncomeComponent,
    IncomeDetailsDrawerComponent,
    AddIncomeModalComponent,
    IncomeSourceModalComponent,
    DeleteConfirmDialogComponent
  ],
  templateUrl: './full-income-dashboard.component.html',
  styleUrl: './full-income-dashboard.component.scss'
})
export class FullIncomeDashboardComponent implements OnInit {
  private readonly incomeFacade: IncomeFacade = inject(IncomeFacade);

  readonly isLoading$: Observable<boolean> = this.incomeFacade.isLoading$;
  readonly overview$: Observable<IncomeOverviewData | null> = this.incomeFacade.overview$;
  readonly recentIncomes$: Observable<Income[]> = this.incomeFacade.recentIncomes$;
  readonly upcomingIncomes$: Observable<UpcomingIncomeItem[]> = this.incomeFacade.upcomingIncomes$;
  readonly sources$: Observable<IncomeSource[]> = this.incomeFacade.sources$;
  readonly accounts$: Observable<AccountRef[]> = this.incomeFacade.accounts$;

  showDetailsDrawer: boolean = false;
  showAddModal: boolean = false;
  showSourceModal: boolean = false;
  showDeleteDialog: boolean = false;
  activeIncome: Income | null = null;

  ngOnInit(): void {
    this.incomeFacade.loadDashboard();
  }

  onIncomeSelected(inc: Income): void {
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

  onRecordRecurring(recurringId: string): void {
    this.incomeFacade.recordRecurringIncome(recurringId);
  }

  onSaveSource(source: Partial<IncomeSource>): void {
    this.incomeFacade.addSource(source);
    this.showSourceModal = false;
  }
}
