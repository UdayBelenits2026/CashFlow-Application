import { dashboardReducer } from './dashboard.reducer';
import * as A from './dashboard.actions';
import { initialDashboardState, DashboardApiResponse } from '../models/dashboard.models';

describe('dashboardReducer', () => {
  const initial = dashboardReducer(undefined, { type: '@@init' } as any);

  it('should expose the initial state', () => {
    expect(initial).toEqual(initialDashboardState);
  });

  it('loadDashboard should set loading and clear error', () => {
    const state = dashboardReducer({ ...initial, loadError: true }, A.loadDashboard({}));
    expect(state.loading).toBeTrue();
    expect(state.loadError).toBeFalse();
  });

  it('loadDashboard should merge provided filters', () => {
    const state = dashboardReducer(initial, A.loadDashboard({ filters: { merchant: 'Amazon' } as any }));
    expect((state.activeFilters as any).merchant).toBe('Amazon');
  });

  it('setDashboardFilters should merge filters', () => {
    const state = dashboardReducer(initial, A.setDashboardFilters({ filters: { merchant: 'X' } as any }));
    expect((state.activeFilters as any).merchant).toBe('X');
  });

  it('loadDashboardSuccess should populate state and stop loading', () => {
    const data = {
      summaryCards: [],
      upcomingBills: [],
      recentTransactions: [],
      recentIncome: [],
      recentExpenses: [],
      widgetConfig: [],
      onboardingSteps: [],
      onboardingActions: [],
      isNewUser: false,
      cashBalance: null,
    } as unknown as DashboardApiResponse;
    const state = dashboardReducer({ ...initial, loading: true }, A.loadDashboardSuccess({ data }));
    expect(state.loading).toBeFalse();
    expect(state.loadError).toBeFalse();
    expect(state.upcomingBills).toEqual([]);
  });

  it('loadDashboardFailure should set loadError and stop loading', () => {
    const state = dashboardReducer({ ...initial, loading: true }, A.loadDashboardFailure({ error: 'boom' }));
    expect(state.loading).toBeFalse();
    expect(state.loadError).toBeTrue();
  });
});
