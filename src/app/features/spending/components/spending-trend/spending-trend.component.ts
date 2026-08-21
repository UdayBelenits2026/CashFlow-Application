import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpendingTrendPoint } from '../../models/spending-summary.model';

@Component({
  selector: 'app-spending-trend',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spending-trend.component.html',
  styleUrl: './spending-trend.component.scss'
})
export class SpendingTrendComponent {
  readonly trendPoints = input<SpendingTrendPoint[]>([]);
}
