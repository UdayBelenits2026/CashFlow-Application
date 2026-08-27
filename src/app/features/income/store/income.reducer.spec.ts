import { incomeReducer } from './income.reducer';
import * as A from './income.actions';
import { initialIncomeState } from './income.state';

describe('incomeReducer', () => {
  const initial = incomeReducer(undefined, { type: '@@init' } as any);

  it('should expose the initial state', () => {
    expect(initial).toEqual(initialIncomeState);
  });

  it('loadIncomeDashboard should set loading and clear error', () => {
    const state = incomeReducer({ ...initial, error: 'x' }, A.loadIncomeDashboard());
    expect(state.isLoading).toBeTrue();
    expect(state.error).toBeNull();
  });

  it('loadIncomeDashboardSuccess should populate datasets and stop loading', () => {
    const payload = {
      overview: { totalIncome: 100 } as any,
      sources: [{ id: 's1' }] as any,
      trendPoints: [{ xLabel: 'Jan' }] as any,
      incomes: [{ id: 'i1' }] as any,
      recurringIncomes: [{ id: 'r1' }] as any,
      accounts: [{ id: 'a1' }] as any,
    };
    const state = incomeReducer({ ...initial, isLoading: true }, A.loadIncomeDashboardSuccess(payload));
    expect(state.isLoading).toBeFalse();
    expect(state.overview?.totalIncome).toBe(100);
    expect(state.sources.length).toBe(1);
    expect(state.incomes.length).toBe(1);
  });

  it('loadIncomeDashboardFailure should record the error', () => {
    const state = incomeReducer({ ...initial, isLoading: true }, A.loadIncomeDashboardFailure({ error: 'boom' }));
    expect(state.isLoading).toBeFalse();
    expect(state.error).toBe('boom');
  });
});
