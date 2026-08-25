import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { IncomeOverviewData } from '../../models/income-summary.model';

@Component({
  selector: 'app-income-kpi-cards',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './income-kpi-cards.component.html',
  styleUrl: './income-kpi-cards.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncomeKpiCardsComponent {
  readonly overview: InputSignal<IncomeOverviewData | null> = input<IncomeOverviewData | null>(null);
}
