import { ChangeDetectionStrategy, Component, input, output, InputSignal, OutputEmitterRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Expense } from '../../models/expense.model';

@Component({
  selector: 'app-delete-confirm-dialog',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './delete-confirm-dialog.component.html',
  styleUrl: './delete-confirm-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeleteConfirmDialogComponent {
  readonly expense: InputSignal<Expense | null> = input<Expense | null>(null);
  readonly title: InputSignal<string> = input<string>('Delete Expense?');
  readonly message: InputSignal<string | null> = input<string | null>(null);
  readonly confirmLabel: InputSignal<string> = input<string>('Delete Expense');
  readonly itemId: InputSignal<string | null> = input<string | null>(null);
  readonly cancel: OutputEmitterRef<void> = output<void>();
  readonly confirm: OutputEmitterRef<string> = output<string>();

  onCancel(): void {
    this.cancel.emit();
  }

  onConfirm(): void {
    const id = this.itemId() ?? this.expense()?.id;
    if (id) {
      this.confirm.emit(id);
    }
  }
}
