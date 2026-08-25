import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faXmark,
  faBell,
  faCalendarDays,
  faReceipt,
  faBolt,
  faWifi,
  faCreditCard,
  faShieldHalved,
  faMobileScreen,
  faCircleQuestion,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-add-reminder-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './add-reminder-modal.html',
  styleUrl: './add-reminder-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddReminderModalComponent {
  // Inputs and outputs for modal visibility and save events
  readonly isOpen = input<boolean>(false);
  readonly closeModal = output<void>();
  readonly saveReminder = output<{
    title: string;
    amount: number;
    dueDate: string;
    icon: string;
  }>();
  // Form signals for modal inputs
  readonly title = signal<string>('');
  readonly amount = signal<number | null>(null);
  readonly dueDate = signal<string>('');
  readonly icon = signal<string>('fa-bolt');
  readonly formError = signal<string>('');
  // FontAwesome icon definitions
  readonly closeIcon = faXmark;
  readonly bellIcon = faBell;
  readonly calendarIcon = faCalendarDays;
  // Options for bill category dropdown selection
  readonly iconOptions = [
    { label: 'Electricity Bill', value: 'fa-bolt', icon: faBolt },
    { label: 'Internet / Wifi', value: 'fa-wifi', icon: faWifi },
    { label: 'Credit Card', value: 'fa-credit-card', icon: faCreditCard },
    { label: 'Insurance Premium', value: 'fa-shield-halved', icon: faShieldHalved },
    { label: 'Phone Recharge', value: 'fa-mobile-screen', icon: faMobileScreen },
    { label: 'General Receipt / Bill', value: 'fa-receipt', icon: faReceipt },
    { label: 'Others', value: 'fa-circle-question', icon: faCircleQuestion },
  ];
  // Returns today date formatted as YYYY-MM-DD for min date picker constraint
  get todayDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  // Closes modal and resets form state
  onClose(): void {
    this.resetForm();
    this.closeModal.emit();
  }
  // Validates form inputs and emits saved reminder data
  onSubmit(): void {
    const titleVal = this.title().trim();
    const amountVal = this.amount();
    const dateVal = this.dueDate();
    if (!titleVal) {
      this.formError.set('Please enter a bill title.');
      return;
    }
    if (amountVal === null || amountVal <= 0) {
      this.formError.set('Please enter a valid amount.');
      return;
    }
    if (!dateVal) {
      this.formError.set('Please select a due date.');
      return;
    }
    const selectedDate = new Date(dateVal);
    selectedDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      this.formError.set('Due date cannot be a past date for upcoming bills.');
      return;
    }
    this.formError.set('');
    const formattedDate = this.formatDate(dateVal);
    this.saveReminder.emit({
      title: titleVal,
      amount: amountVal,
      dueDate: formattedDate,
      icon: this.icon(),
    });
    this.resetForm();
    this.closeModal.emit();
  }
  // Formats date string into readable short month format
  private formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return dateStr;
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  // Resets internal form input signals to initial values
  private resetForm(): void {
    this.title.set('');
    this.amount.set(null);
    this.dueDate.set('');
    this.icon.set('fa-bolt');
    this.formError.set('');
  }
}
