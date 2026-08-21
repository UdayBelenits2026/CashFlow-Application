import { Component, input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { SpendingOverviewData } from '../../models/spending-summary.model';

@Component({
  selector: 'app-spending-kpi-cards',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './spending-kpi-cards.component.html',
  styleUrl: './spending-kpi-cards.component.scss'
})
export class SpendingKpiCardsComponent {
  readonly overview = input<SpendingOverviewData | null>(null);
}
