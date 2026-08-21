import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpendingAlert } from '../../models/spending-summary.model';

@Component({
  selector: 'app-spending-alerts-drawer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spending-alerts-drawer.component.html',
  styleUrl: './spending-alerts-drawer.component.scss'
})
export class SpendingAlertsDrawerComponent {
  readonly alerts = input<SpendingAlert[]>([]);
  readonly close = output<void>();
  readonly markAsRead = output<string>();
  readonly dismiss = output<string>();

  onClose(): void {
    this.close.emit();
  }

  onMarkAsRead(id: string): void {
    this.markAsRead.emit(id);
  }

  onDismiss(id: string): void {
    this.dismiss.emit(id);
  }
}
