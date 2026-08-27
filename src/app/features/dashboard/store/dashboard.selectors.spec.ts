import * as S from './dashboard.selectors';
import { initialDashboardState, DashboardState } from '../models/dashboard.models';

function root(overrides: Partial<DashboardState>) {
  return { dashboard: { ...initialDashboardState, ...overrides } as DashboardState };
}

describe('dashboard selectors', () => {
  it('selectSummaryCards should return cards unchanged for existing users', () => {
    const cards = [{ id: 'income', amount: 500, selectedMonthAmount: 500, percentage: 10 }] as any;
    const result = S.selectSummaryCards(root({ summaryCards: cards, isNewUser: false }) as any);
    expect(result[0].amount).toBe(500);
  });

  it('selectSummaryCards should zero out amounts for new users', () => {
    const cards = [{ id: 'income', amount: 500, selectedMonthAmount: 500, percentage: 10 }] as any;
    const result = S.selectSummaryCards(root({ summaryCards: cards, isNewUser: true }) as any);
    expect(result[0].amount).toBe(0);
    expect(result[0].selectedMonthAmount).toBe(0);
    expect(result[0].percentage).toBe(0);
  });

  it('selectIsNewUser should read the flag', () => {
    expect(S.selectIsNewUser(root({ isNewUser: true }) as any)).toBeTrue();
  });

  it('slice selectors should read their state slices', () => {
    const bills = [{ id: 'b1' }] as any;
    expect(S.selectUpcomingBills(root({ upcomingBills: bills }) as any)).toBe(bills);
    expect(S.selectDashboardLoading(root({ loading: true }) as any)).toBeTrue();
    expect(S.selectDashboardLoadError(root({ loadError: true }) as any)).toBeTrue();
  });

  it('selectActiveFilters should read the active filters', () => {
    const filters = { merchant: 'A' } as any;
    expect(S.selectActiveFilters(root({ activeFilters: filters }) as any)).toBe(filters);
  });
});
