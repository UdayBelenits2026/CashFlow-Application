import { ChangeDetectionStrategy, Component, input, output, InputSignal, OutputEmitterRef } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Expense } from '../../models/expense.model';

@Component({
  selector: 'app-expense-details-drawer',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe],
  templateUrl: './expense-details-drawer.component.html',
  styleUrl: './expense-details-drawer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpenseDetailsDrawerComponent {
  readonly expense: InputSignal<Expense | null> = input<Expense | null>(null);
  readonly close: OutputEmitterRef<void> = output<void>();
  readonly edit: OutputEmitterRef<Expense> = output<Expense>();
  readonly delete: OutputEmitterRef<Expense> = output<Expense>();
  readonly viewReceipt: OutputEmitterRef<Expense> = output<Expense>();
  readonly uploadReceipt: OutputEmitterRef<Expense> = output<Expense>();
  readonly split: OutputEmitterRef<Expense> = output<Expense>();

  formatPaymentMethod(method?: string): string {
    switch (method) {
      case 'DEBIT_CARD': return 'Debit Card';
      case 'CREDIT_CARD': return 'Credit Card';
      case 'BANK_TRANSFER': return 'Bank Transfer';
      case 'CASH': return 'Cash';
      default: return method || 'Card';
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onEdit(): void {
    const exp = this.expense();
    if (exp) this.edit.emit(exp);
  }

  onDelete(): void {
    const exp = this.expense();
    if (exp) this.delete.emit(exp);
  }

  onViewReceipt(): void {
    const exp = this.expense();
    if (exp) this.viewReceipt.emit(exp);
  }

  onUploadReceipt(): void {
    const exp = this.expense();
    if (exp) this.uploadReceipt.emit(exp);
  }

  onSplit(): void {
    const exp = this.expense();
    if (exp) this.split.emit(exp);
  }
}
