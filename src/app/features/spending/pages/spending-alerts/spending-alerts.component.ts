import { Component, OnInit, inject, signal, computed, WritableSignal, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SpendingFacade } from '../../facades/spending.facade';
import { SpendingAlert, AlertTab } from '../../models/spending-summary.model';

@Component({
  selector: 'app-spending-alerts',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './spending-alerts.component.html',
  styleUrl: './spending-alerts.component.scss'
})
export class SpendingAlertsComponent implements OnInit {
  private readonly spendingFacade: SpendingFacade = inject(SpendingFacade);

  readonly isLoading$: Observable<boolean> = this.spendingFacade.isLoading$;

  readonly activeTab: WritableSignal<AlertTab> = signal<AlertTab>('ALL');
  readonly allAlerts: Signal<SpendingAlert[]> = toSignal(this.spendingFacade.alerts$, { initialValue: [] as SpendingAlert[] });

  readonly unreadCount: Signal<number> = computed(() => this.allAlerts().filter((a) => !a.isRead).length);
  readonly readCount: Signal<number> = computed(() => this.allAlerts().filter((a) => a.isRead).length);
  readonly filteredAlerts: Signal<SpendingAlert[]> = computed(() => {
    const alerts = this.allAlerts();
    const tab = this.activeTab();
    if (tab === 'UNREAD') return alerts.filter((a) => !a.isRead);
    if (tab === 'READ') return alerts.filter((a) => a.isRead);
    return alerts;
  });

  ngOnInit(): void {
    this.spendingFacade.loadDashboard();
  }

  setTab(tab: AlertTab): void {
    this.activeTab.set(tab);
  }

  markAsRead(id: string): void {
    this.spendingFacade.markAlertAsRead(id);
  }

  dismiss(id: string): void {
    this.spendingFacade.dismissAlert(id);
  }

  markAllAsRead(): void {
    this.allAlerts().filter((a) => !a.isRead).forEach((a) => this.spendingFacade.markAlertAsRead(a.id));
  }

  severityClass(severity: string): string {
    switch (severity) {
      case 'danger': return 'sev-danger';
      case 'warning': return 'sev-warning';
      case 'success': return 'sev-success';
      default: return 'sev-info';
    }
  }

  severityIcon(severity: string): string {
    switch (severity) {
      case 'danger': return '🚨';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      default: return 'ℹ️';
    }
  }
}
