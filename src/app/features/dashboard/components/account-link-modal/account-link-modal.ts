import { Component, ChangeDetectionStrategy, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faXmark,
  faLock,
  faBuildingColumns,
  faCreditCard,
  faChevronDown,
  faShieldHalved,
  faCircleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import {
  AccountLinkTab,
  AccountLinkPayload,
  AccountLinkValidationErrors,
  BANK_OPTIONS,
  ACCOUNT_TYPE_OPTIONS,
  CARD_ISSUER_OPTIONS,
  CARD_TYPE_OPTIONS,
} from '../../models/account-link.model';

@Component({
  selector: 'app-account-link-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './account-link-modal.html',
  styleUrl: './account-link-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountLinkModalComponent {
  // Modal visibility input and event outputs
  readonly isOpen = input<boolean>(false);
  readonly closeModal = output<void>();
  readonly connectAccount = output<AccountLinkPayload>();

  // Active tab signal ('bank' | 'credit-card')
  readonly activeTab = signal<AccountLinkTab>('bank');

  // Bank account form signals
  readonly bankName = signal<string>('');
  readonly accountType = signal<string>('');
  readonly routingNumber = signal<string>('');
  readonly accountNumber = signal<string>('');
  readonly bankNickname = signal<string>('');

  // Credit card form signals
  readonly cardIssuer = signal<string>('');
  readonly cardType = signal<string>('');
  readonly last4Digits = signal<string>('');
  readonly cardNickname = signal<string>('');

  // Validation errors signal
  readonly errors = signal<AccountLinkValidationErrors>({});
  readonly isSubmitted = signal<boolean>(false);

  // Dropdown options constants
  readonly bankOptions = BANK_OPTIONS;
  readonly accountTypeOptions = ACCOUNT_TYPE_OPTIONS;
  readonly cardIssuerOptions = CARD_ISSUER_OPTIONS;
  readonly cardTypeOptions = CARD_TYPE_OPTIONS;

  // FontAwesome icons
  readonly closeIcon = faXmark;
  readonly lockIcon = faLock;
  readonly bankIcon = faBuildingColumns;
  readonly cardIcon = faCreditCard;
  readonly chevronIcon = faChevronDown;
  readonly shieldIcon = faShieldHalved;
  readonly errorIcon = faCircleExclamation;

  // Current nickname character count computed properties
  readonly currentNickname = computed(() => {
    return this.activeTab() === 'bank' ? this.bankNickname() : this.cardNickname();
  });

  readonly nicknameLength = computed(() => this.currentNickname().length);

  readonly isNicknameExceeded = computed(() => this.nicknameLength() > 30);

  // Switches active form tab
  setTab(tab: AccountLinkTab): void {
    this.activeTab.set(tab);
    if (this.isSubmitted()) {
      this.validate();
    } else {
      this.errors.set({});
    }
  }

  // Closes modal dialog and resets state
  onClose(): void {
    this.resetForm();
    this.closeModal.emit();
  }

  // Resets form signals and validation states
  resetForm(): void {
    this.activeTab.set('bank');
    this.bankName.set('');
    this.accountType.set('');
    this.routingNumber.set('');
    this.accountNumber.set('');
    this.bankNickname.set('');
    this.cardIssuer.set('');
    this.cardType.set('');
    this.last4Digits.set('');
    this.cardNickname.set('');
    this.errors.set({});
    this.isSubmitted.set(false);
  }

  // Runs full validation rules on current active tab
  validate(): boolean {
    const errs: AccountLinkValidationErrors = {};
    const tab = this.activeTab();

    if (tab === 'bank') {
      const bank = this.bankName().trim();
      const type = this.accountType().trim();
      const routing = this.routingNumber().trim();
      const accNum = this.accountNumber().trim();

      if (!bank) {
        errs.bankName = 'Bank name is required';
      }
      if (!type) {
        errs.accountType = 'Account type is required';
      }
      if (!routing) {
        errs.routingNumber = 'Routing number is required';
      } else if (!/^\d{9}$/.test(routing)) {
        errs.routingNumber = 'Routing number must be 9 digits';
      }
      if (!accNum) {
        errs.accountNumber = 'Account number is required';
      } else if (!/^\d{4,17}$/.test(accNum)) {
        errs.accountNumber = 'Account number must be 4 to 17 digits';
      }
      if (this.bankNickname().length > 30) {
        errs.nickname = 'Account nickname cannot exceed 30 characters';
      }
    } else {
      const issuer = this.cardIssuer().trim();
      const type = this.cardType().trim();
      const digits = this.last4Digits().trim();

      if (!issuer) {
        errs.cardIssuer = 'Card issuer is required';
      }
      if (!type) {
        errs.cardType = 'Card type is required';
      }
      if (!digits) {
        errs.last4Digits = 'Last 4 digits are required';
      } else if (!/^\d{4}$/.test(digits)) {
        errs.last4Digits = 'Must be exactly 4 digits';
      }
      if (this.cardNickname().length > 30) {
        errs.nickname = 'Account nickname cannot exceed 30 characters';
      }
    }

    if (this.isSubmitted()) {
      this.errors.set(errs);
    }
    return Object.keys(errs).length === 0;
  }

  // Handles input changes and triggers real-time validation when form has been submitted once
  onFieldChange(): void {
    if (this.isSubmitted()) {
      this.validate();
    }
  }

  // Handles form submission
  onSubmit(): void {
    this.isSubmitted.set(true);
    const isValid = this.validate();

    if (!isValid) {
      return;
    }

    const payload: AccountLinkPayload = {
      linkType: this.activeTab(),
      ...(this.activeTab() === 'bank'
        ? {
            bankAccount: {
              bankName: this.bankName(),
              accountType: this.accountType(),
              routingNumber: this.routingNumber(),
              accountNumber: this.accountNumber(),
              nickname: this.bankNickname(),
            },
          }
        : {
            creditCard: {
              cardIssuer: this.cardIssuer(),
              cardType: this.cardType(),
              last4Digits: this.last4Digits(),
              nickname: this.cardNickname(),
            },
          }),
    };

    this.connectAccount.emit(payload);
    this.onClose();
  }
}
