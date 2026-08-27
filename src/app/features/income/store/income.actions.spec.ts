import * as A from './income.actions';

describe('income actions', () => {
  it('loadIncomeDashboard should have the correct type', () => {
    expect(A.loadIncomeDashboard().type).toBe('[Income] Load Dashboard');
  });

  it('loadIncomeDashboardSuccess should carry all datasets', () => {
    const payload = {
      overview: {} as any, sources: [], trendPoints: [], incomes: [], recurringIncomes: [], accounts: [],
    };
    const action = A.loadIncomeDashboardSuccess(payload);
    expect(action.type).toBe('[Income] Load Dashboard Success');
    expect(action.sources).toEqual([]);
  });

  it('loadIncomeDashboardFailure should carry the error', () => {
    expect(A.loadIncomeDashboardFailure({ error: 'e' }).error).toBe('e');
  });

  it('addIncome should carry the income payload', () => {
    const income = { amount: 5 };
    expect(A.addIncome({ income }).income).toBe(income);
  });

  it('updateIncome should carry id and income', () => {
    const action = A.updateIncome({ id: '1', income: { amount: 9 } });
    expect(action.id).toBe('1');
    expect(action.income).toEqual({ amount: 9 });
  });

  it('deleteIncome should carry the id', () => {
    expect(A.deleteIncome({ id: '3' }).id).toBe('3');
  });
});
