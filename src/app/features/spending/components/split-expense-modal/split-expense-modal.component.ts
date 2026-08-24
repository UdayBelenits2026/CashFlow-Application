import { Component, OnInit, inject, input, output, signal, computed, DestroyRef, InputSignal, OutputEmitterRef, WritableSignal, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Expense } from '../../models/expense.model';
import { SpendingCategoryItem } from '../../models/spending-summary.model';
import { DEFAULT_CATEGORIES } from '../../utility/spending.constants';

@Component({
  selector: 'app-split-expense-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DecimalPipe],
  templateUrl: './split-expense-modal.component.html',
  styleUrl: './split-expense-modal.component.scss'
})
export class SplitExpenseModalComponent implements OnInit {
  readonly expense: InputSignal<Expense | null> = input<Expense | null>(null);
  readonly categories: InputSignal<SpendingCategoryItem[]> = input<SpendingCategoryItem[]>([]);
  readonly close: OutputEmitterRef<void> = output<void>();
  readonly splitSaved: OutputEmitterRef<{ originalId: string; splits: Partial<Expense>[] }> = output<{ originalId: string; splits: Partial<Expense>[] }>();

  private readonly fb: FormBuilder = inject(FormBuilder);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  // Bumped on each form value change so the computed totals re-evaluate.
  private readonly formTick: WritableSignal<number> = signal(0);

  splitForm!: FormGroup;

  readonly availableCategories: Signal<SpendingCategoryItem[]> = computed(() => {
    const cats = this.categories();
    return cats && cats.length > 0 ? cats : DEFAULT_CATEGORIES;
  });

  readonly totalOriginalAmount: Signal<number> = computed(() => this.expense()?.amount || 0);

  readonly allocatedAmount: Signal<number> = computed(() => {
    this.formTick();
    if (!this.splitForm) return 0;
    const values = this.splitsArray.value as { amount: number }[];
    return values.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  });

  readonly remainingAmount: Signal<number> = computed(() =>
    Number((this.totalOriginalAmount() - this.allocatedAmount()).toFixed(2))
  );

  readonly isSplitValid: Signal<boolean> = computed(() => {
    this.formTick();
    return (
      this.splitForm?.valid === true &&
      this.splitsArray.length >= 2 &&
      Math.abs(this.remainingAmount()) < 0.01
    );
  });

  get splitsArray(): FormArray {
    return this.splitForm.get('splits') as FormArray;
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

    this.splitForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.formTick.update((v) => v + 1));
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
    if (!exp || !this.isSplitValid()) return;

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
