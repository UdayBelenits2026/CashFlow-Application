import { Component, computed, inject, input, output, signal, InputSignal, OutputEmitterRef, WritableSignal, Signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Expense } from '../../models/expense.model';

@Component({
  selector: 'app-receipt-viewer-modal',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe],
  templateUrl: './receipt-viewer-modal.component.html',
  styleUrl: './receipt-viewer-modal.component.scss'
})
export class ReceiptViewerModalComponent {
  readonly expense: InputSignal<Expense | null> = input<Expense | null>(null);
  readonly close: OutputEmitterRef<void> = output<void>();
  readonly updateReceipt: OutputEmitterRef<{ id: string; receiptUrl: string; receiptFileName: string }> = output<{ id: string; receiptUrl: string; receiptFileName: string }>();
  readonly removeReceipt: OutputEmitterRef<string> = output<string>();

  private readonly sanitizer: DomSanitizer = inject(DomSanitizer);

  today: string = new Date().toISOString();

  // Local metadata captured from the most recent upload in this session.
  readonly uploadedSizeLabel: WritableSignal<string> = signal<string>('');
  readonly uploadedType: WritableSignal<string> = signal<string>('');
  readonly uploadError: WritableSignal<string> = signal<string>('');

  readonly safeReceiptUrl: Signal<SafeResourceUrl | null> = computed<SafeResourceUrl | null>(() => {
    const url = this.expense()?.receiptUrl;
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  });

  private readonly maxSizeBytes: number = 5 * 1024 * 1024; // 5 MB

  onClose(): void {
    this.close.emit();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const exp = this.expense();
    if (!file || !exp) return;

    const isValidType = file.type.startsWith('image/') || file.type === 'application/pdf';
    if (!isValidType) {
      this.uploadError.set('Unsupported file type. Please upload a PNG, JPG, or PDF.');
      input.value = '';
      return;
    }

    if (file.size > this.maxSizeBytes) {
      this.uploadError.set('File is too large. Maximum size is 5 MB.');
      input.value = '';
      return;
    }

    this.uploadError.set('');
    this.uploadedSizeLabel.set(this.formatSize(file.size));
    this.uploadedType.set(file.type === 'application/pdf' ? 'PDF Document' : 'Image');

    const objectUrl = URL.createObjectURL(file);
    this.updateReceipt.emit({
      id: exp.id,
      receiptUrl: objectUrl,
      receiptFileName: file.name || 'uploaded_receipt'
    });
    input.value = '';
  }

  onRemoveReceipt(): void {
    const exp = this.expense();
    if (exp) {
      this.uploadedSizeLabel.set('');
      this.uploadedType.set('');
      this.removeReceipt.emit(exp.id);
    }
  }

  onDownload(): void {
    const url = this.expense()?.receiptUrl;
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = this.expense()?.receiptFileName || 'receipt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  isPdf(): boolean {
    const name = this.expense()?.receiptFileName || '';
    return name.toLowerCase().endsWith('.pdf') || this.uploadedType() === 'PDF Document';
  }

  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
