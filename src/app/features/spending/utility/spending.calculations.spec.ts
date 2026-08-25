import {
  recalculateOverviewAndCategories,
  buildExpenseEntity,
  computeTopMerchants,
  computeBudgetVsActual,
  computeInsights
} from './spending.calculations';
import { Expense } from '../models/expense.model';
import { SpendingCategoryItem, SpendingOverviewData } from '../models/spending-summary.model';

function makeExpense(partial: Partial<Expense>): Expense {
  return {
    id: 'exp-x',
    amount: 0,
    date: '2026-05-01',
    merchantName: 'Merchant',
    categoryId: 'cat-1',
    categoryName: 'Food & Dining',
    accountId: 'acc-1',
    accountName: 'Main Checking',
    paymentMethod: 'DEBIT_CARD',
    status: 'CLEARED',
    createdAt: '2026-05-01T00:00:00Z',
    ...partial
  };
}

const baseOverview: SpendingOverviewData = {
  totalSpending: 0,
  spendingGrowthPercentage: 0,
  transactionsCount: 0,
  transactionsGrowthCount: 0,
  averageDaily: 0,
  averageDailyGrowthPercentage: 0,
  topCategoryName: '',
  topCategoryAmount: 0,
  budgetTotal: 1000,
  budgetUsedPercentage: 0
};

describe('spending.calculations', () => {
  describe('recalculateOverviewAndCategories', () => {
    it('returns inputs untouched when overview is null', () => {
      const cats: SpendingCategoryItem[] = [];
      const result = recalculateOverviewAndCategories([], null, cats);
      expect(result.overview).toBeNull();
      expect(result.categories).toBe(cats);
    });

    it('sums totals, counts transactions and picks the top category', () => {
      const expenses = [
        makeExpense({ amount: 100, categoryName: 'Food & Dining' }),
        makeExpense({ amount: 250, categoryName: 'Shopping' }),
        makeExpense({ amount: 50, categoryName: 'Food & Dining' })
      ];
      const { overview } = recalculateOverviewAndCategories(expenses, baseOverview, []);
      expect(overview?.totalSpending).toBe(400);
      expect(overview?.transactionsCount).toBe(3);
      expect(overview?.topCategoryName).toBe('Shopping');
      expect(overview?.topCategoryAmount).toBe(250);
      expect(overview?.budgetUsedPercentage).toBe(40); // 400 / 1000
    });
  });

  describe('buildExpenseEntity', () => {
    it('applies defaults for missing fields', () => {
      const e = buildExpenseEntity({ amount: 12.5, merchantName: 'Cafe' });
      expect(e.amount).toBe(12.5);
      expect(e.merchantName).toBe('Cafe');
      expect(e.paymentMethod).toBe('DEBIT_CARD');
      expect(e.status).toBe('CLEARED');
      expect(e.id).toMatch(/^exp-/);
      expect(e.categoryName).toBe('Food & Dining');
    });
  });

  describe('computeTopMerchants', () => {
    it('returns an empty array for no expenses', () => {
      expect(computeTopMerchants([])).toEqual([]);
    });

    it('aggregates by merchant, sorts by amount and computes share', () => {
      const expenses = [
        makeExpense({ merchantName: 'Uber', amount: 200, categoryName: 'Travel' }),
        makeExpense({ merchantName: 'Amazon', amount: 300, categoryName: 'Shopping' }),
        makeExpense({ merchantName: 'Uber', amount: 100, categoryName: 'Travel' })
      ];
      const result = computeTopMerchants(expenses);
      expect(result.length).toBe(2);
      expect(result[0].name).toBe('Amazon');
      expect(result[1].name).toBe('Uber');
      expect(result[1].amount).toBe(300);
      expect(result[1].transactionCount).toBe(2);
      expect(result[1].percentage).toBe(50); // 300 of 600
    });
  });

  describe('computeBudgetVsActual', () => {
    const categories: SpendingCategoryItem[] = [
      { id: 'c1', name: 'A', amount: 90, percentage: 0, color: '#000', barWidth: '0%', budget: 100 },
      { id: 'c2', name: 'B', amount: 120, percentage: 0, color: '#111', barWidth: '0%', budget: 100 },
      { id: 'c3', name: 'C', amount: 40, percentage: 0, color: '#222', barWidth: '0%', budget: 100 },
      { id: 'c4', name: 'D', amount: 10, percentage: 0, color: '#333', barWidth: '0%' } // no budget → excluded
    ];

    it('excludes categories without a budget', () => {
      const result = computeBudgetVsActual(categories);
      expect(result.length).toBe(3);
      expect(result.find((r) => r.name === 'D')).toBeUndefined();
    });

    it('assigns status by usage and sorts by percent used desc', () => {
      const result = computeBudgetVsActual(categories);
      expect(result[0].name).toBe('B');
      expect(result[0].status).toBe('OVER_BUDGET'); // 120%
      expect(result.find((r) => r.name === 'A')?.status).toBe('WARNING'); // 90%
      expect(result.find((r) => r.name === 'C')?.status).toBe('ON_TRACK'); // 40%
    });
  });

  describe('computeInsights', () => {
    it('returns an empty array when overview is null', () => {
      expect(computeInsights(null, [])).toEqual([]);
    });

    it('produces insights from overview and expenses', () => {
      const overview: SpendingOverviewData = {
        ...baseOverview,
        topCategoryName: 'Food & Dining',
        topCategoryAmount: 660,
        averageDaily: 85.48
      };
      const expenses = [makeExpense({ merchantName: 'Uber', amount: 200 })];
      const insights = computeInsights(overview, expenses);
      const ids = insights.map((i) => i.id);
      expect(ids).toContain('ins-1');
      expect(ids).toContain('ins-3');
      expect(ids).toContain('ins-4');
    });
  });
});
