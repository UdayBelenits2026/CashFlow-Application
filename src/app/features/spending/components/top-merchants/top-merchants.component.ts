import { ChangeDetectionStrategy, Component, computed, input, output, InputSignal, OutputEmitterRef, Signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { SpendingMerchant } from '../../models/spending-summary.model';

@Component({
  selector: 'app-top-merchants',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './top-merchants.component.html',
  styleUrl: './top-merchants.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopMerchantsComponent {
  readonly merchants: InputSignal<SpendingMerchant[]> = input<SpendingMerchant[]>([]);
  readonly limit: InputSignal<number> = input<number>(5);
  readonly showViewAll: InputSignal<boolean> = input<boolean>(true);
  readonly viewAll: OutputEmitterRef<void> = output<void>();

  readonly visibleMerchants: Signal<SpendingMerchant[]> = computed(() => this.merchants().slice(0, this.limit()));

  onViewAll(): void {
    this.viewAll.emit();
  }

  initials(name: string): string {
    return (name || 'M').trim().charAt(0).toUpperCase();
  }
}
