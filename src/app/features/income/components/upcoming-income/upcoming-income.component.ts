import { Component, input, output, InputSignal, OutputEmitterRef } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { UpcomingIncomeItem } from '../../models/income-summary.model';

@Component({
  selector: 'app-upcoming-income',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe],
  templateUrl: './upcoming-income.component.html',
  styleUrl: './upcoming-income.component.scss'
})
export class UpcomingIncomeComponent {
  readonly upcomingItems: InputSignal<UpcomingIncomeItem[]> = input<UpcomingIncomeItem[]>([]);
  readonly recordIncome: OutputEmitterRef<string> = output<string>();

  onRecord(recurringId: string): void {
    this.recordIncome.emit(recurringId);
  }
}
