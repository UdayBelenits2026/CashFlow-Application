import { ChangeDetectionStrategy, Component, input, output, signal, InputSignal, OutputEmitterRef, WritableSignal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-income-delete-confirm-dialog',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './delete-confirm-dialog.component.html',
  styleUrl: './delete-confirm-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeleteConfirmDialogComponent {
  readonly title: InputSignal<string> = input<string>('Delete Income Transaction');
  readonly message: InputSignal<string> = input<string>(
    'Are you sure you want to delete this recorded income transaction? This action will permanently update your totals and historical reports.'
  );
  readonly itemAmount: InputSignal<number | undefined> = input<number | undefined>(undefined);
  readonly itemDescription: InputSignal<string | undefined> = input<string | undefined>(undefined);
  readonly itemDate: InputSignal<string | undefined> = input<string | undefined>(undefined);
  readonly itemAccount: InputSignal<string | undefined> = input<string | undefined>(undefined);
  readonly itemSource: InputSignal<string | undefined> = input<string | undefined>(undefined);

  readonly close: OutputEmitterRef<void> = output<void>();
  readonly confirm: OutputEmitterRef<void> = output<void>();

  readonly isDeleting: WritableSignal<boolean> = signal<boolean>(false);

  onCancel(): void {
    if (this.isDeleting()) return;
    this.close.emit();
  }

  onConfirm(): void {
    if (this.isDeleting()) return;
    this.isDeleting.set(true);
    this.confirm.emit();
  }
}
