import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpendingInsight } from '../../models/spending-summary.model';

@Component({
  selector: 'app-spending-insights-drawer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spending-insights-drawer.component.html',
  styleUrl: './spending-insights-drawer.component.scss'
})
export class SpendingInsightsDrawerComponent {
  readonly insights = input<SpendingInsight[]>([]);
  readonly close = output<void>();

  onClose(): void {
    this.close.emit();
  }
}
