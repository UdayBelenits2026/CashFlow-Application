import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { combineLatest, map } from 'rxjs';

import { AccountFacade } from '../../facades/account.facade';
import { AccountCategory } from '../../models/accounts.model';
import { ACCOUNT_CATEGORIES } from '../../utility/account-form.config';

// Accounts Categories page: lists account categories, sub-types, and live counts.
@Component({
  selector: 'app-cf-accounts-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './accounts-categories.html',
  styleUrl: './accounts-categories.scss',
})
export class AccountsCategories implements OnInit {
  private readonly facade = inject(AccountFacade);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  // Category cards grouped by main type, merging predefined sub-types with stored categories.
  readonly categories$ = combineLatest([this.facade.accountCategories$, this.facade.accounts$]).pipe(
    map(([categories, accounts]) =>
      ACCOUNT_CATEGORIES.map((meta) => ({
        label: meta.label,
        description: meta.description,
        subTypes: this.mergeSubTypes(meta.label, meta.subTypes, categories),
        count: accounts.filter(
          (account) => (account.accountType || '').toLowerCase() === meta.label.toLowerCase()
        ).length,
      }))
    )
  );

  readonly categoryTypes = ACCOUNT_CATEGORIES.map((category) => category.label);
  isModalOpen = false;
  feedback: { type: 'success' | 'error'; text: string } | null = null;
  private pendingSave = false;
  private storeCategories: AccountCategory[] = [];

  readonly form = this.fb.group({
    categoryName: ['', [Validators.required, Validators.maxLength(50)]],
    categoryType: ['', [Validators.required]],
    description: ['', [Validators.maxLength(200)]],
  });

  ngOnInit(): void {
    this.facade.loadAccounts();
    this.facade.loadCategories();
    this.facade.accountCategories$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((categories) => (this.storeCategories = categories));
    combineLatest([this.facade.successMessage$, this.facade.error$])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([success, error]) => this.handleFeedback(success, error));
  }

  goBack(): void {
    this.router.navigate(['/accounts']);
  }

  openModal(): void {
    this.feedback = null;
    this.form.reset({ categoryName: '', categoryType: '', description: '' });
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  saveCategory(): void {
    const name = (this.form.value.categoryName ?? '').trim();
    const type = (this.form.value.categoryType ?? '').trim();
    this.form.patchValue({ categoryName: name });
    if (this.form.invalid || !name) {
      this.form.markAllAsTouched();
      this.feedback = { type: 'error', text: 'Unable to add category. Please fill in the required fields.' };
      return;
    }
    if (this.isDuplicate(type, name)) {
      this.feedback = { type: 'error', text: 'A category with this name already exists under the selected type.' };
      return;
    }
    this.pendingSave = true;
    this.facade.createCategory({ accountType: type, name });
  }

  // Merges predefined sub-types with stored categories for a main type (case-insensitive dedupe).
  private mergeSubTypes(label: string, predefined: readonly string[], categories: AccountCategory[]): string[] {
    const merged: string[] = [...predefined];
    for (const category of categories) {
      if ((category.accountType || '').toLowerCase() !== label.toLowerCase()) {
        continue;
      }
      if (!merged.some((existing) => existing.toLowerCase() === category.name.toLowerCase())) {
        merged.push(category.name);
      }
    }
    return merged;
  }

  private isDuplicate(type: string, name: string): boolean {
    const predefined = ACCOUNT_CATEGORIES.find((c) => c.label.toLowerCase() === type.toLowerCase())?.subTypes ?? [];
    const stored = this.storeCategories
      .filter((c) => (c.accountType || '').toLowerCase() === type.toLowerCase())
      .map((c) => c.name);
    return [...predefined, ...stored].some((existing) => existing.toLowerCase() === name.toLowerCase());
  }

  private handleFeedback(success: string | null, error: string | null): void {
    if (!this.pendingSave) {
      return;
    }
    if (error) {
      this.feedback = { type: 'error', text: error };
      this.pendingSave = false;
      return;
    }
    if (success) {
      this.feedback = { type: 'success', text: success };
      this.pendingSave = false;
      this.isModalOpen = false;
      this.form.reset({ categoryName: '', categoryType: '', description: '' });
    }
  }
}
