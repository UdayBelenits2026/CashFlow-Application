import * as S from './spending.selectors';
import { SpendingState, spendingFeatureKey, initialSpendingState } from './spending.state';
import { Expense } from '../models/expense.model';

function root(overrides: Partial<SpendingState>) {
  return { [spendingFeatureKey]: { ...initialSpendingState, ...overrides } as SpendingState };
}

function expense(p: Partial<Expense>): Expense {
  return {
    id: '1', merchantName: 'Shop', categoryName: 'Food', accountName: 'Checking',
    amount: 10, date: '2026-01-01', paymentMethod: 'CASH', status: 'CLEARED',
    ...p,
  } as Expense;
}

describe('spending selectors', () => {
  it('selectHasLoadedData should be true only when overview is present', () => {
    expect(S.selectHasLoadedData(root({ overview: null }) as any)).toBeFalse();
    expect(S.selectHasLoadedData(root({ overview: { totalSpending: 1 } as any }) as any)).toBeTrue();
  });

  it('selectTotalSpending should fall back to 0', () => {
    expect(S.selectTotalSpending(root({ overview: null }) as any)).toBe(0);
    expect(S.selectTotalSpending(root({ overview: { totalSpending: 250 } as any }) as any)).toBe(250);
  });

  it('selectTopCategory should provide defaults when overview is missing', () => {
    expect(S.selectTopCategory(root({ overview: null }) as any)).toEqual({ name: 'N/A', amount: 0 });
  });

  it('selectRecentExpenses should return the 6 most recent by date', () => {
    const expenses = [
      expense({ id: '1', date: '2026-01-01' }),
      expense({ id: '2', date: '2026-03-01' }),
      expense({ id: '3', date: '2026-02-01' }),
    ];
    const recent = S.selectRecentExpenses(root({ expenses }) as any);
    expect(recent[0].id).toBe('2');
    expect(recent.length).toBe(3);
  });

  it('selectFilteredExpenses should filter by search term', () => {
    const expenses = [
      expense({ id: '1', merchantName: 'Amazon' }),
      expense({ id: '2', merchantName: 'Uber' }),
    ];
    const result = S.selectFilteredExpenses(
      root({ expenses, filters: { ...initialSpendingState.filters, searchTerm: 'uber' } }) as any
    );
    expect(result.map((e) => e.id)).toEqual(['2']);
  });

  it('selectFilteredExpenses should filter by payment method', () => {
    const expenses = [
      expense({ id: '1', paymentMethod: 'CASH' }),
      expense({ id: '2', paymentMethod: 'CREDIT_CARD' }),
    ];
    const result = S.selectFilteredExpenses(
      root({ expenses, filters: { ...initialSpendingState.filters, paymentMethod: 'CASH' } }) as any
    );
    expect(result.map((e) => e.id)).toEqual(['1']);
  });

  it('selectAllExpenses should return the expenses slice', () => {
    const expenses = [expense({ id: '1' })];
    expect(S.selectAllExpenses(root({ expenses }) as any)).toEqual(expenses);
  });
});
