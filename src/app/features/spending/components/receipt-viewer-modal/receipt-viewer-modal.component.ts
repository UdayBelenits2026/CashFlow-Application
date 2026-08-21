import { Component, input, output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Expense } from '../../models/expense.model';

@Component({
  selector: 'app-receipt-viewer-modal',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './receipt-viewer-modal.component.html',
  styleUrl: './receipt-viewer-modal.component.scss'
})
export class ReceiptViewerModalComponent {
  readonly expense = input<Expense | null>(null);
  readonly close = output<void>();
  readonly updateReceipt = output<{ id: string; receiptUrl: string; receiptFileName: string }>();
  readonly removeReceipt = output<string>();

  today = new Date().toISOString();

  onClose(): void {
    this.close.emit();
  }

  onFileSelected(event: any): void {
    const file = event.target?.files?.[0];
    const exp = this.expense();
    if (file && exp) {
      const mockUrl = 'https://images.unsplash.com/photo-1554415707-9e4c018a482d?w=800&auto=format&fit=crop&q=60';
      this.updateReceipt.emit({
        id: exp.id,
        receiptUrl: mockUrl,
        receiptFileName: file.name || 'uploaded_receipt.pdf'
      });
    }
  }

  onRemoveReceipt(): void {
    const exp = this.expense();
    if (exp) {
      this.removeReceipt.emit(exp.id);
    }
  }
}
