import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { BudgetVsActualItem } from '../../models/spending-summary.model';

@Component({
  selector: 'app-budget-vs-actual',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './budget-vs-actual.component.html',
  styleUrl: './budget-vs-actual.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BudgetVsActualComponent {
  readonly items: InputSignal<BudgetVsActualItem[]> = input<BudgetVsActualItem[]>([]);

  statusLabel(status: string): string {
    switch (status) {
      case 'OVER_BUDGET': return 'Over Budget';
      case 'WARNING': return 'Warning';
      default: return 'On Track';
    }
  }

  statusClass(status: string): string {
    switch (status) {
      case 'OVER_BUDGET': return 'over';
      case 'WARNING': return 'warning';
      default: return 'on-track';
    }
  }
}
