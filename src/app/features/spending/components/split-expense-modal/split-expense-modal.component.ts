import { Component, OnInit, inject, input, output, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Expense } from '../../models/expense.model';
import { SpendingCategoryItem } from '../../models/spending-summary.model';

@Component({
  selector: 'app-split-expense-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DecimalPipe],
  templateUrl: './split-expense-modal.component.html',
  styleUrl: './split-expense-modal.component.scss'
})
export class SplitExpenseModalComponent implements OnInit {
  readonly expense = input<Expense | null>(null);
  readonly categories = input<SpendingCategoryItem[]>([]);
  readonly close = output<void>();
  readonly splitSaved = output<{ originalId: string; splits: Partial<Expense>[] }>();

  private readonly fb = inject(FormBuilder);

  splitForm!: FormGroup;

  defaultCategories: SpendingCategoryItem[] = [
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

  readonly availableCategories = computed(() => {
    const cats = this.categories();
    return cats && cats.length > 0 ? cats : this.defaultCategories;
  });

  get splitsArray(): FormArray {
    return this.splitForm.get('splits') as FormArray;
  }

  get totalOriginalAmount(): number {
    return this.expense()?.amount || 0;
  }

  get allocatedAmount(): number {
    if (!this.splitForm) return 0;
    const values = this.splitsArray.value as { amount: number }[];
    return values.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }

  get remainingAmount(): number {
    return Number((this.totalOriginalAmount - this.allocatedAmount).toFixed(2));
  }

  get isSplitValid(): boolean {
    return (
      this.splitForm?.valid === true &&
      this.splitsArray.length >= 2 &&
      Math.abs(this.remainingAmount) < 0.01
    );
  }

  ngOnInit(): void {
    const exp = this.expense();
    const half = exp ? Number((exp.amount / 2).toFixed(2)) : 0;
    const rem = exp ? Number((exp.amount - half).toFixed(2)) : 0;

    this.splitForm = this.fb.group({
      splits: this.fb.array([
        this.createSplitGroup(half, exp?.categoryId || 'cat-1', 'Part 1'),
        this.createSplitGroup(rem, 'cat-2', 'Part 2')
      ])
    });
  }

  createSplitGroup(amount: number, categoryId: string, notes: string): FormGroup {
    return this.fb.group({
      amount: [amount, [Validators.required, Validators.min(0.01)]],
      categoryId: [categoryId, Validators.required],
      notes: [notes]
    });
  }

  addSplitRow(): void {
    const defaultCat = this.availableCategories()[0]?.id || 'cat-1';
    this.splitsArray.push(this.createSplitGroup(0, defaultCat, ''));
  }

  removeSplitRow(index: number): void {
    if (this.splitsArray.length > 2) {
      this.splitsArray.removeAt(index);
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onSaveSplits(): void {
    const exp = this.expense();
    if (!exp || !this.isSplitValid) return;

    const cats = this.availableCategories();
    const formSplits = this.splitsArray.value as { amount: number; categoryId: string; notes: string }[];

    const generatedSplits: Partial<Expense>[] = formSplits.map((item, idx) => {
      const catObj = cats.find((c) => c.id === item.categoryId) || cats[0];
      return {
        amount: Number(item.amount),
        date: exp.date,
        merchantName: `${exp.merchantName} (Split ${idx + 1})`,
        categoryId: catObj.id,
        categoryName: catObj.name,
        categoryColor: catObj.color,
        accountId: exp.accountId,
        accountName: exp.accountName,
        paymentMethod: exp.paymentMethod,
        notes: item.notes || exp.notes,
        status: exp.status,
        tags: exp.tags
      };
    });

    this.splitSaved.emit({
      originalId: exp.id,
      splits: generatedSplits
    });
  }
}
