import * as S from './income.selectors';
import { IncomeState, incomeFeatureKey, initialIncomeState } from './income.state';
import { Income } from '../models/income.model';
import { IncomeSource } from '../models/income-source.model';

function root(overrides: Partial<IncomeState>) {
  return { [incomeFeatureKey]: { ...initialIncomeState, ...overrides } as IncomeState };
}

function income(p: Partial<Income>): Income {
  return {
    id: '1', accountId: 'a1', accountName: 'Checking', incomeSourceId: 's1', sourceName: 'Job',
    sourceType: 'Salary', amount: 100, date: '2026-01-01', description: '', taxable: false,
    isRecurring: false, status: 'RECORDED',
    ...p,
  } as Income;
}

describe('income selectors', () => {
  it('selectTotalIncome should fall back to 0 with no overview', () => {
    expect(S.selectTotalIncome(root({ overview: null }) as any)).toBe(0);
  });

  it('selectTotalIncome should read from overview', () => {
    expect(S.selectTotalIncome(root({ overview: { totalIncome: 500 } as any }) as any)).toBe(500);
  });

  it('selectHasLoadedData should be true when incomes exist', () => {
    expect(S.selectHasLoadedData(root({ incomes: [income({})] }) as any)).toBeTrue();
    expect(S.selectHasLoadedData(root({}) as any)).toBeFalse();
  });

  it('selectTopSource should provide defaults when overview is missing', () => {
    expect(S.selectTopSource(root({ overview: null }) as any)).toEqual({ name: 'None', amount: 0, percentage: 0 });
  });

  it('selectActiveSources should filter active sources', () => {
    const sources = [
      { id: 's1', status: 'ACTIVE' } as IncomeSource,
      { id: 's2', status: 'INACTIVE' } as IncomeSource,
    ];
    expect(S.selectActiveSources(root({ sources }) as any).map((s) => s.id)).toEqual(['s1']);
  });

  it('selectRecentIncomes should return the 5 most recent RECORDED incomes', () => {
    const incomes = [
      income({ id: '1', date: '2026-01-01', status: 'RECORDED' }),
      income({ id: '2', date: '2026-03-01', status: 'RECORDED' }),
      income({ id: '3', date: '2026-02-01', status: 'PENDING' }),
    ];
    const recent = S.selectRecentIncomes(root({ incomes }) as any);
    expect(recent.map((i) => i.id)).toEqual(['2', '1']);
  });

  it('selectFilteredIncomes should filter by search term', () => {
    const incomes = [
      income({ id: '1', description: 'Salary payment' }),
      income({ id: '2', description: 'Bonus' }),
    ];
    const result = S.selectFilteredIncomes(
      root({ incomes, filters: { ...initialIncomeState.filters, searchTerm: 'bonus' } }) as any
    );
    expect(result.map((i) => i.id)).toEqual(['2']);
  });

  it('selectFilteredIncomes should filter by taxable flag', () => {
    const incomes = [income({ id: '1', taxable: true }), income({ id: '2', taxable: false })];
    const result = S.selectFilteredIncomes(
      root({ incomes, filters: { ...initialIncomeState.filters, taxable: true } }) as any
    );
    expect(result.map((i) => i.id)).toEqual(['1']);
  });
});
