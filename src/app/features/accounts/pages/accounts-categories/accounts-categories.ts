import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { combineLatest, map } from 'rxjs';

import { AccountFacade } from '../../facades/account.facade';
import { AccountCategory } from '../../models/accounts.model';
import { ACCOUNT_CATEGORIES } from '../../utility/account-form.config';

// Accounts Categories page: lists account categories, sub-types, and live counts.
@Component({
  selector: 'app-cf-accounts-categories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accounts-categories.html',
  styleUrl: './accounts-categories.scss',
})
export class AccountsCategories implements OnInit {
  private readonly facade = inject(AccountFacade);
  private readonly router = inject(Router);

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

  ngOnInit(): void {
    this.facade.loadAccounts();
    this.facade.loadCategories();
  }

  goBack(): void {
    this.router.navigate(['/accounts']);
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
}
