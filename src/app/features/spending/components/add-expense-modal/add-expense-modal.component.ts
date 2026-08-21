import { Component, OnInit, inject, input, output, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Expense } from '../../models/expense.model';
import { SpendingCategoryItem } from '../../models/spending-summary.model';

@Component({
  selector: 'app-add-expense-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DecimalPipe],
  templateUrl: './add-expense-modal.component.html',
  styleUrl: './add-expense-modal.component.scss'
})
export class AddExpenseModalComponent implements OnInit {
  // Modern Signal Inputs and Outputs
  readonly expense = input<Expense | null>(null);
  readonly categories = input<SpendingCategoryItem[]>([]);
  readonly close = output<void>();
  readonly save = output<Partial<Expense>>();
  readonly update = output<{ id: string; expense: Partial<Expense> }>();

  private readonly fb = inject(FormBuilder);

  // Modern Signal State
  readonly currentStep = signal<number>(1);
  readonly selectedCategoryId = signal<string>('cat-1');
  readonly selectedCategoryName = signal<string>('Food & Dining');
  readonly selectedCategoryColor = signal<string>('#0F172A');

  readonly defaultCategories: SpendingCategoryItem[] = [
    { id: 'cat-1', name: 'Food & Dining', color: '#0F172A', amount: 0, percentage: 0, barWidth: '0%' },
    { id: 'cat-2', name: 'Shopping', color: '#1D4ED8', amount: 0, percentage: 0, barWidth: '0%' },
    { id: 'cat-3', name: 'Transportation', color: '#EA580C', amount: 0, percentage: 0, barWidth: '0%' },
    { id: 'cat-4', name: 'Utilities', color: '#D97706', amount: 0, percentage: 0, barWidth: '0%' },
    { id: 'cat-5', name: 'Entertainment', color: '#6366F1', amount: 0, percentage: 0, barWidth: '0%' },
    { id: 'cat-6', name: 'Health', color: '#10B981', amount: 0, percentage: 0, barWidth: '0%' },
    { id: 'cat-7', name: 'Travel', color: '#06B6D4', amount: 0, percentage: 0, barWidth: '0%' },
    { id: 'cat-8', name: 'Education', color: '#8B5CF6', amount: 0, percentage: 0, barWidth: '0%' },
    { id: 'cat-9', name: 'Others', color: '#64748B', amount: 0, percentage: 0, barWidth: '0%' }
  ];

  expenseForm!: FormGroup;

  // Computed signals
  readonly isEditMode = computed(() => !!this.expense());
  readonly availableCategories = computed(() => {
    const cats = this.categories();
    return cats && cats.length > 0 ? cats : this.defaultCategories;
  });

  ngOnInit(): void {
    const exp = this.expense();
    if (exp) {
      // Pre-fill existing expense values for Edit Mode
      this.selectedCategoryId.set(exp.categoryId || 'cat-1');
      this.selectedCategoryName.set(exp.categoryName || 'Food & Dining');
      this.selectedCategoryColor.set(exp.categoryColor || '#0F172A');

      this.expenseForm = this.fb.group({
        amount: [exp.amount, [Validators.required, Validators.min(0.01)]],
        date: [exp.date, Validators.required],
        merchantName: [exp.merchantName, Validators.required],
        accountName: [exp.accountName || 'Main Checking', Validators.required],
        paymentMethod: [exp.paymentMethod || 'DEBIT_CARD', Validators.required],
        notes: [exp.notes || '']
      });
    } else {
      // Default initial values for Add Mode
      const today = new Date().toISOString().split('T')[0];
      this.expenseForm = this.fb.group({
        amount: [null, [Validators.required, Validators.min(0.01)]],
        date: [today, Validators.required],
        merchantName: ['', Validators.required],
        accountName: ['Main Checking', Validators.required],
        paymentMethod: ['DEBIT_CARD', Validators.required],
        notes: ['']
      });
    }
  }

  isStep1Valid(): boolean {
    return (
      this.expenseForm.get('amount')?.valid === true &&
      this.expenseForm.get('date')?.valid === true &&
      this.expenseForm.get('merchantName')?.valid === true
    );
  }

  nextStep(): void {
    if (this.currentStep() === 1 && this.isStep1Valid()) {
      this.currentStep.set(2);
    } else if (this.currentStep() === 2 && this.selectedCategoryId()) {
      this.currentStep.set(3);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  selectCategory(cat: SpendingCategoryItem): void {
    this.selectedCategoryId.set(cat.id);
    this.selectedCategoryName.set(cat.name);
    this.selectedCategoryColor.set(cat.color);
  }

  onClose(): void {
    this.close.emit();
  }

  onSaveExpense(): void {
    const formVal = this.expenseForm.value;
    const exp = this.expense();
    const payload: Partial<Expense> = {
      amount: Number(formVal.amount),
      date: formVal.date,
      merchantName: formVal.merchantName,
      categoryId: this.selectedCategoryId(),
      categoryName: this.selectedCategoryName(),
      categoryColor: this.selectedCategoryColor(),
      accountId: formVal.accountName === 'Chase Sapphire' ? 'acc-2' : 'acc-1',
      accountName: formVal.accountName,
      paymentMethod: formVal.paymentMethod,
      notes: formVal.notes || '',
      tags: exp?.tags || [],
      receiptUrl: exp?.receiptUrl,
      receiptFileName: exp?.receiptFileName,
      status: exp?.status || 'CLEARED'
    };

    if (exp?.id) {
      this.update.emit({ id: exp.id, expense: payload });
    }
    this.save.emit(payload);
  }
}
