import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBuildingColumns, faCircleXmark } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-cf-cash-balance',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './cash-balance.html',
  styleUrl: './cash-balance.scss',
})
export class CashBalance {
  readonly title = input<string>('Cash Balance');
  readonly totalBalance = input<number>(8450);
  readonly inAccounts = input<number>(8760);
  readonly pending = input<number>(-310);
  readonly isLoading = input<boolean>(false);
  readonly hasError = input<boolean>(false);
  readonly retry = output<void>();
  readonly icon = faBuildingColumns;
  readonly errorIcon = faCircleXmark;

  onRetry(): void {
    this.retry.emit();
  }
}
