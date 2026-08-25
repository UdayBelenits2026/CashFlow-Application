/** File purpose: Implements logic for app\features\accounts\components\account-card\account-card.ts. */
import {
  Component,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Account, DEFAULT_ACCOUNT } from '../../models/accounts.model';
import { AccountNumberPipe } from '../../../../shared/pipes/account-number-pipe';

@Component({
  selector: 'app-account-card',
  standalone: true,
  imports: [
    AccountNumberPipe,
    CurrencyPipe
  ],
  templateUrl: './account-card.html',
  styleUrl: './account-card.scss'
})
export class AccountCard {

  // Card data displayed in the account list.
  @Input() account: Account = { ...DEFAULT_ACCOUNT };

  // Emits account id when a card is selected.
  @Output() accountSelected =
    new EventEmitter<string>();

  // Handles card click and forwards the selected id.
  onAccountClick(): void {
    this.accountSelected.emit(this.account.id);
  }
}
