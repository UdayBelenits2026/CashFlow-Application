import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faXmark,
  faUser,
  faShieldHalved,
  faChevronDown,
  faCircleExclamation,
  faEnvelope,
  faCoins,
  faBullseye,
} from '@fortawesome/free-solid-svg-icons';
import {
  ProfileSetupForm,
  ProfileSetupValidationErrors,
  FINANCIAL_GOAL_OPTIONS,
} from '../../models/profile-setup.model';

@Component({
  selector: 'app-profile-setup-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './profile-setup-modal.html',
  styleUrl: './profile-setup-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileSetupModalComponent {
  // Modal visibility input and event outputs
  readonly isOpen = input<boolean>(false);
  readonly closeModal = output<void>();
  readonly saveProfile = output<ProfileSetupForm>();

  // Profile setup form signals
  readonly fullName = signal<string>('Neelima Sharma');
  readonly email = signal<string>('neelima@example.com');
  readonly currency = signal<string>('INR');
  readonly financialGoal = signal<string>('');
  readonly monthlyIncomeGoal = signal<number | null>(null);

  // Validation signals
  readonly errors = signal<ProfileSetupValidationErrors>({});
  readonly isSubmitted = signal<boolean>(false);

  // Dropdown options
  readonly financialGoalOptions = FINANCIAL_GOAL_OPTIONS;

  // FontAwesome icons
  readonly closeIcon = faXmark;
  readonly userIcon = faUser;
  readonly shieldIcon = faShieldHalved;
  readonly chevronIcon = faChevronDown;
  readonly errorIcon = faCircleExclamation;
  readonly emailIcon = faEnvelope;
  readonly coinIcon = faCoins;
  readonly goalIcon = faBullseye;

  // Closes modal and resets state
  onClose(): void {
    this.resetForm();
    this.closeModal.emit();
  }

  // Resets form state
  resetForm(): void {
    this.fullName.set('Neelima Sharma');
    this.email.set('neelima@example.com');
    this.currency.set('INR');
    this.financialGoal.set('');
    this.monthlyIncomeGoal.set(null);
    this.errors.set({});
    this.isSubmitted.set(false);
  }

  // Validates form fields
  validate(): boolean {
    const errs: ProfileSetupValidationErrors = {};
    const nameVal = this.fullName().trim();
    const emailVal = this.email().trim();
    const goalVal = this.financialGoal().trim();

    if (!nameVal) {
      errs.fullName = 'Full name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal) {
      errs.email = 'Email address is required';
    } else if (!emailRegex.test(emailVal)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!goalVal) {
      errs.financialGoal = 'Primary financial goal is required';
    }

    if (this.isSubmitted()) {
      this.errors.set(errs);
    }
    return Object.keys(errs).length === 0;
  }

  // Live validation on field change if form was submitted
  onFieldChange(): void {
    if (this.isSubmitted()) {
      this.validate();
    }
  }

  // Form submission handler
  onSubmit(): void {
    this.isSubmitted.set(true);
    const isValid = this.validate();

    if (!isValid) {
      return;
    }

    const payload: ProfileSetupForm = {
      fullName: this.fullName().trim(),
      email: this.email().trim(),
      currency: this.currency(),
      financialGoal: this.financialGoal(),
      monthlyIncomeGoal: this.monthlyIncomeGoal(),
    };

    this.saveProfile.emit(payload);
    this.onClose();
  }
}
