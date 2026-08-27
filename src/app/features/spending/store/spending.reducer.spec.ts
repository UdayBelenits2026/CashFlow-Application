import { spendingReducer } from './spending.reducer';
import * as A from './spending.actions';
import { initialSpendingState } from './spending.state';

describe('spendingReducer', () => {
  const initial = spendingReducer(undefined, { type: '@@init' } as any);

  it('should expose the initial state', () => {
    expect(initial).toEqual(initialSpendingState);
  });

  it('loadSpendingDashboard should set loading and clear error', () => {
    const state = spendingReducer({ ...initial, error: 'x' }, A.loadSpendingDashboard());
    expect(state.isLoading).toBeTrue();
    expect(state.error).toBeNull();
  });

  it('loadSpendingDashboardSuccess should populate datasets and stop loading', () => {
    const payload = {
      overview: { totalSpending: 100 } as any,
      categories: [{ id: 'c1' }] as any,
      trendPoints: [] as any,
      expenses: [{ id: 'e1' }] as any,
      tags: [{ id: 't1' }] as any,
      recurringExpenses: [] as any,
      alerts: [] as any,
    };
    const state = spendingReducer({ ...initial, isLoading: true }, A.loadSpendingDashboardSuccess(payload));
    expect(state.isLoading).toBeFalse();
    expect(state.overview?.totalSpending).toBe(100);
    expect(state.expenses.length).toBe(1);
    expect(state.categories.length).toBe(1);
  });

  it('loadSpendingDashboardFailure should record the error', () => {
    const state = spendingReducer({ ...initial, isLoading: true }, A.loadSpendingDashboardFailure({ error: 'boom' }));
    expect(state.isLoading).toBeFalse();
    expect(state.error).toBe('boom');
  });
});
