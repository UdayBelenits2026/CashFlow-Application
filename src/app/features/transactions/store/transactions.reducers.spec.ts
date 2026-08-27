import { transactionsReducer } from './transactions.reducers';
import * as A from './transactions.actions';
import { Transaction } from '../models/models.transaction';

function tx(partial: Partial<Transaction>): Transaction {
  return {
    id: '1', date: '2026-01-01', description: 'd', category: 'Food',
    accountId: 'a1', accountName: 'Checking', amount: 10, type: 'Expense',
    ...partial,
  } as Transaction;
}

describe('transactionsReducer', () => {
  const initial = transactionsReducer(undefined, { type: '@@init' } as any);

  it('should return a well-formed initial state', () => {
    expect(initial.transactions).toEqual([]);
    expect(initial.page).toBe(1);
    expect(initial.pageSize).toBe(10);
    expect(initial.loading).toBeFalse();
  });

  it('loadTransactions should set loading and clear error', () => {
    const state = transactionsReducer({ ...initial, error: 'x' }, A.loadTransactions());
    expect(state.loading).toBeTrue();
    expect(state.error).toBeNull();
  });

  it('loadTransactionsSuccess should store transactions and stop loading', () => {
    const list = [{ ...tx({}), id: '1' }];
    const state = transactionsReducer(initial, A.loadTransactionsSuccess({ transactions: list }));
    expect(state.transactions).toEqual(list);
    expect(state.loading).toBeFalse();
  });

  it('loadTransactionsFailure should record the error', () => {
    const state = transactionsReducer(initial, A.loadTransactionsFailure({ error: 'boom' }));
    expect(state.error).toBe('boom');
    expect(state.loading).toBeFalse();
  });

  it('setTransactionFilters should merge filters and reset to page 1', () => {
    const state = transactionsReducer(
      { ...initial, page: 5 },
      A.setTransactionFilters({ filters: { category: 'Food' } })
    );
    expect(state.filters.category).toBe('Food');
    expect(state.page).toBe(1);
  });

  it('clearTransactionFilters should reset filters, search and page', () => {
    const dirty = { ...initial, search: 'abc', page: 3, filters: { ...initial.filters, category: 'X' } };
    const state = transactionsReducer(dirty, A.clearTransactionFilters());
    expect(state.search).toBe('');
    expect(state.page).toBe(1);
    expect(state.filters.category).toBe('');
  });

  it('setTransactionSearch should update search and reset page', () => {
    const state = transactionsReducer({ ...initial, page: 4 }, A.setTransactionSearch({ search: 'coffee' }));
    expect(state.search).toBe('coffee');
    expect(state.page).toBe(1);
  });

  it('setTransactionPage should update page without resetting', () => {
    const state = transactionsReducer(initial, A.setTransactionPage({ page: 3 }));
    expect(state.page).toBe(3);
  });

  it('setTransactionPageSize should update page size and reset page', () => {
    const state = transactionsReducer({ ...initial, page: 4 }, A.setTransactionPageSize({ pageSize: 25 }));
    expect(state.pageSize).toBe(25);
    expect(state.page).toBe(1);
  });

  it('deleteTransactionSuccess should remove the transaction and set a success message', () => {
    const withData = { ...initial, transactions: [{ ...tx({}), id: '1' }, { ...tx({}), id: '2' }] };
    const state = transactionsReducer(withData, A.deleteTransactionSuccess({ id: '1' }));
    expect(state.transactions.map((t) => t.id)).toEqual(['2']);
    expect(state.successMessage).toContain('deleted');
  });

  it('loadTransaction should reset selected form state to loading', () => {
    const state = transactionsReducer(initial, A.loadTransaction({ id: '9' }));
    expect(state.selectedLoading).toBeTrue();
    expect(state.selectedTransaction).toBeNull();
  });

  it('loadTransactionSuccess should store the selected transaction', () => {
    const t = { ...tx({}), id: '9' };
    const state = transactionsReducer(initial, A.loadTransactionSuccess({ transaction: t }));
    expect(state.selectedTransaction).toEqual(t);
    expect(state.selectedLoading).toBeFalse();
  });

  it('clearSelectedTransaction should null out the selected transaction', () => {
    const withSel = { ...initial, selectedTransaction: { ...tx({}), id: '9' }, selectedError: 'e' };
    const state = transactionsReducer(withSel, A.clearSelectedTransaction());
    expect(state.selectedTransaction).toBeNull();
    expect(state.selectedError).toBeNull();
  });

  it('clearTransactionFeedback should clear error and success message', () => {
    const dirty = { ...initial, error: 'e', successMessage: 's' };
    const state = transactionsReducer(dirty, A.clearTransactionFeedback());
    expect(state.error).toBeNull();
    expect(state.successMessage).toBeNull();
  });
});
