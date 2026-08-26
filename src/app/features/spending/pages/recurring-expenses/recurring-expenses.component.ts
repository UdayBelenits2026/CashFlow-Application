import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { SpendingFacade } from '../../facades/spending.facade';
import { RecurringExpense } from '../../models/recurring-expense.model';
import { MONTHS_PER_YEAR, WEEKS_PER_MONTH } from '../../utility/spending.constants';
import { DeleteConfirmDialogComponent } from '../../components/delete-confirm-dialog/delete-confirm-dialog.component';

@Component({
  selector: 'app-recurring-expenses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe, DecimalPipe, DeleteConfirmDialogComponent],
  templateUrl: './recurring-expenses.component.html',
  styleUrl: './recurring-expenses.component.scss'
})
export class RecurringExpensesComponent implements OnInit {
  private readonly spendingFacade: SpendingFacade = inject(SpendingFacade);
  private readonly fb: FormBuilder = inject(FormBuilder);

  readonly recurringExpenses$: Observable<RecurringExpense[]> = this.spendingFacade.recurringExpenses$;

  showAddModal: boolean = false;
  deleteTargetId: string | null = null;
  subForm!: FormGroup;

  ngOnInit(): void {
    this.spendingFacade.loadDashboard();
    this.initForm();
  }

  initForm(): void {
    const today = new Date().toISOString().split('T')[0];
    this.subForm = this.fb.group({
      name: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      frequency: ['MONTHLY', Validators.required],
      categoryName: ['Entertainment', Validators.required],
      accountName: ['Main Checking', Validators.required],
      nextBillingDate: [today, Validators.required]
    });
  }

  getActiveCount(list: RecurringExpense[]): number {
    return list.filter((r) => r.isActive).length;
  }

  getMonthlyTotal(list: RecurringExpense[]): number {
    return list
      .filter((r) => r.isActive)
      .reduce((sum, r) => {
        if (r.frequency === 'YEARLY') return sum + r.amount / MONTHS_PER_YEAR;
        if (r.frequency === 'WEEKLY') return sum + r.amount * WEEKS_PER_MONTH;
        return sum + r.amount;
      }, 0);
  }

  toggleActive(id: string, isActive: boolean): void {
    this.spendingFacade.toggleRecurringExpense(id, isActive);
  }

  deleteItem(id: string): void {
    this.deleteTargetId = id;
  }

  onConfirmDelete(id: string): void {
    this.spendingFacade.deleteRecurringExpense(id);
    this.deleteTargetId = null;
  }

  openAddModal(): void {
    this.initForm();
    this.showAddModal = true;
  }

  onSaveSubscription(): void {
    if (this.subForm.invalid) return;

    const val = this.subForm.value;
    const item: Partial<RecurringExpense> = {
      name: val.name,
      amount: Number(val.amount),
      frequency: val.frequency,
      categoryName: val.categoryName,
      accountName: val.accountName,
      nextBillingDate: val.nextBillingDate,
      isActive: true
    };

    this.spendingFacade.addRecurringExpense(item);
    this.showAddModal = false;
  }
}
