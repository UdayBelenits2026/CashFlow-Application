import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft,
  faPlus,
  faPenToSquare,
  faTrashCan,
  faSearch,
  faBolt,
  faWifi,
  faCreditCard,
  faShieldHalved,
  faMobileScreen,
  faReceipt,
  faCircleQuestion,
  faCalendarDays,
} from '@fortawesome/free-solid-svg-icons';
import { DashboardFacade } from '../../facades/dashboard.facade';
import { DashboardItem } from '../../models/dashboard.models';
import { AddReminderModalComponent } from '../../components/add-reminder-modal/add-reminder-modal';

@Component({
  selector: 'app-cf-dashboard-upcoming-bills',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, AddReminderModalComponent],
  templateUrl: './dashboard-upcoming-bills.html',
  styleUrl: './dashboard-upcoming-bills.scss',
})
export class DashboardUpcomingBills implements OnInit {
  private readonly router = inject(Router);
  readonly facade = inject(DashboardFacade);
  // Reactive selectors for upcoming bills state
  readonly upcomingBills = this.facade.upcomingBills;
  readonly loading = this.facade.loading;
  readonly loadError = this.facade.loadError;
  // Local UI state signals
  readonly searchQuery = signal<string>('');
  readonly isAddModalOpen = signal<boolean>(false);
  readonly editingBill = signal<DashboardItem | null>(null);
  readonly billToDelete = signal<DashboardItem | null>(null);
  // Form input signals for bill editing
  readonly editTitle = signal<string>('');
  readonly editAmount = signal<number | null>(null);
  readonly editDueDate = signal<string>('');
  readonly editIcon = signal<string>('fa-bolt');
  readonly editError = signal<string>('');
  // FontAwesome icon references
  readonly backIcon = faArrowLeft;
  readonly plusIcon = faPlus;
  readonly editIconBtn = faPenToSquare;
  readonly trashIconBtn = faTrashCan;
  readonly searchIcon = faSearch;
  readonly calendarIcon = faCalendarDays;
  // Icon lookup map for bill categories
  readonly icons: Record<string, any> = {
    'fa-bolt': faBolt,
    'fa-wifi': faWifi,
    'fa-credit-card': faCreditCard,
    'fa-shield-halved': faShieldHalved,
    'fa-mobile-screen': faMobileScreen,
    'fa-receipt': faReceipt,
    'fa-circle-question': faCircleQuestion,
  };
  // Select dropdown category options
  readonly iconOptions = [
    { label: 'Electricity Bill', value: 'fa-bolt' },
    { label: 'Internet / Wifi', value: 'fa-wifi' },
    { label: 'Credit Card', value: 'fa-credit-card' },
    { label: 'Insurance Premium', value: 'fa-shield-halved' },
    { label: 'Phone Recharge', value: 'fa-mobile-screen' },
    { label: 'General Receipt / Bill', value: 'fa-receipt' },
    { label: 'Others', value: 'fa-circle-question' },
  ];
  // Computes chronologically sorted and search-filtered bills list
  readonly sortedAndFilteredBills = computed(() => {
    let list = [...this.upcomingBills()];
    const query = this.searchQuery().trim().toLowerCase();
    if (query) {
      list = list.filter((bill) => bill.title.toLowerCase().includes(query));
    }
    return list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });
  // Triggers dashboard data loading on component initialization
  ngOnInit(): void {
    if (this.upcomingBills().length === 0) {
      this.facade.loadDashboard();
    }
  }
  // Navigates back to dashboard home page
  goBack(): void {
    void this.router.navigate(['/dashboard/home']);
  }
  // Opens add bill reminder modal
  openAddModal(): void {
    this.isAddModalOpen.set(true);
  }
  // Closes add bill reminder modal
  closeAddModal(): void {
    this.isAddModalOpen.set(false);
  }
  // Handles saving new reminder item from modal
  onSaveReminder(reminder: { title: string; amount: number; dueDate: string; icon: string }): void {
    this.facade.addUpcomingBill(reminder);
  }
  // Initializes bill edit modal state with selected item
  startEdit(bill: DashboardItem): void {
    this.editingBill.set(bill);
    this.editTitle.set(bill.title);
    this.editAmount.set(Math.abs(bill.amount));
    this.editDueDate.set(this.toInputDateFormat(bill.date));
    this.editIcon.set(bill.icon || 'fa-bolt');
    this.editError.set('');
  }
  // Cancels editing mode and clears edit signals
  cancelEdit(): void {
    this.editingBill.set(null);
    this.editError.set('');
  }
  // Validates edit form inputs and dispatches update action
  saveEdit(): void {
    const current = this.editingBill();
    if (!current) return;
    const titleVal = this.editTitle().trim();
    const amountVal = this.editAmount();
    const dateVal = this.editDueDate();
    if (!titleVal) {
      this.editError.set('Please enter a bill title.');
      return;
    }
    if (amountVal === null || amountVal <= 0) {
      this.editError.set('Please enter a valid amount.');
      return;
    }
    if (!dateVal) {
      this.editError.set('Please select a due date.');
      return;
    }
    const selectedDate = new Date(dateVal);
    selectedDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      this.editError.set('Due date cannot be a past date for upcoming bills.');
      return;
    }
    const updatedItem: DashboardItem = {
      ...current,
      title: titleVal,
      amount: amountVal,
      date: this.formatDateDisplay(dateVal),
      icon: this.editIcon(),
    };
    this.facade.updateUpcomingBill(updatedItem);
    this.cancelEdit();
  }
  // Sets selected bill item for deletion confirmation
  confirmDelete(bill: DashboardItem): void {
    this.billToDelete.set(bill);
  }
  // Cancels deletion process
  cancelDelete(): void {
    this.billToDelete.set(null);
  }
  // Dispatches action to delete selected upcoming bill
  deleteBill(): void {
    const item = this.billToDelete();
    if (item) {
      this.facade.deleteUpcomingBill(item.id);
      this.cancelDelete();
    }
  }
  // Retrieves icon object matching category string
  getIcon(iconKey: string): any {
    return this.icons[iconKey] || faReceipt;
  }
  // Returns today date formatted as YYYY-MM-DD
  get todayDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  // Formats date string to YYYY-MM-DD for date input element
  private toInputDateFormat(dateStr: string): string {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  // Formats date string to short month display format
  private formatDateDisplay(dateStr: string): string {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
