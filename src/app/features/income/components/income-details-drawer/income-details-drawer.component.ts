import { Component, input, output, InputSignal, OutputEmitterRef } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Income } from '../../models/income.model';

@Component({
  selector: 'app-income-details-drawer',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe],
  templateUrl: './income-details-drawer.component.html',
  styleUrl: './income-details-drawer.component.scss'
})
export class IncomeDetailsDrawerComponent {
  readonly income: InputSignal<Income | null> = input<Income | null>(null);
  readonly close: OutputEmitterRef<void> = output<void>();
  readonly edit: OutputEmitterRef<Income> = output<Income>();
  readonly delete: OutputEmitterRef<Income> = output<Income>();

  onClose(): void {
    this.close.emit();
  }

  onEdit(): void {
    const inc = this.income();
    if (inc) this.edit.emit(inc);
  }

  onDelete(): void {
    const inc = this.income();
    if (inc) this.delete.emit(inc);
  }
}
