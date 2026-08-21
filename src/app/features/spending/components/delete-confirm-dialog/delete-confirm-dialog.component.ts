import { Component, input, output } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Expense } from '../../models/expense.model';

@Component({
  selector: 'app-delete-confirm-dialog',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './delete-confirm-dialog.component.html',
  styleUrl: './delete-confirm-dialog.component.scss'
})
export class DeleteConfirmDialogComponent {
  readonly expense = input<Expense | null>(null);
  readonly cancel = output<void>();
  readonly confirm = output<string>();

  onCancel(): void {
    this.cancel.emit();
  }

  onConfirm(): void {
    const exp = this.expense();
    if (exp) {
      this.confirm.emit(exp.id);
    }
  }
}
