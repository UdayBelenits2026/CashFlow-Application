import * as A from './spending.actions';

describe('spending actions', () => {
  it('loadSpendingDashboard should have the correct type', () => {
    expect(A.loadSpendingDashboard().type).toBe('[Spending] Load Dashboard');
  });

  it('loadSpendingDashboardSuccess should carry all datasets', () => {
    const payload = {
      overview: {} as any, categories: [], trendPoints: [], expenses: [], tags: [], recurringExpenses: [], alerts: [],
    };
    const action = A.loadSpendingDashboardSuccess(payload);
    expect(action.type).toBe('[Spending] Load Dashboard Success');
    expect(action.expenses).toEqual([]);
  });

  it('loadSpendingDashboardFailure should carry the error', () => {
    expect(A.loadSpendingDashboardFailure({ error: 'e' }).error).toBe('e');
  });

  it('addExpense should carry the expense payload', () => {
    const expense = { amount: 5 };
    expect(A.addExpense({ expense }).expense).toBe(expense);
  });

  it('updateExpense should carry id and expense', () => {
    const action = A.updateExpense({ id: '1', expense: { amount: 9 } });
    expect(action.id).toBe('1');
    expect(action.expense).toEqual({ amount: 9 });
  });
});
