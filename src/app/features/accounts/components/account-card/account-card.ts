import { Component, input, output } from '@angular/core';
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
  readonly account = input<Account>({ ...DEFAULT_ACCOUNT });

  // Emits the account id when a card is selected.
  readonly accountSelected = output<string>();

  // Handles card click and forwards the selected id.
  onAccountClick(): void {
    this.accountSelected.emit(this.account().id);
  }
}
