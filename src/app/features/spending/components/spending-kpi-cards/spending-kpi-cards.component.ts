import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { SpendingOverviewData } from '../../models/spending-summary.model';

@Component({
  selector: 'app-spending-kpi-cards',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './spending-kpi-cards.component.html',
  styleUrl: './spending-kpi-cards.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpendingKpiCardsComponent {
  readonly overview: InputSignal<SpendingOverviewData | null> = input<SpendingOverviewData | null>(null);
}
