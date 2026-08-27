import * as A from './transactions.actions';
import { Transaction } from '../models/models.transaction';

describe('transactions actions', () => {
  it('loadTransactions should have the correct type', () => {
    expect(A.loadTransactions().type).toBe('[Transactions] Load');
  });

  it('loadTransactionsSuccess should carry the transactions payload', () => {
    const transactions = [{ id: '1' } as Transaction];
    const action = A.loadTransactionsSuccess({ transactions });
    expect(action.type).toBe('[Transactions API] Load Success');
    expect(action.transactions).toBe(transactions);
  });

  it('loadTransactionsFailure should carry the error', () => {
    const action = A.loadTransactionsFailure({ error: 'boom' });
    expect(action.type).toBe('[Transactions API] Load Failure');
    expect(action.error).toBe('boom');
  });

  it('setTransactionFilters should carry filters', () => {
    const action = A.setTransactionFilters({ filters: { category: 'Food' } });
    expect(action.type).toBe('[Transactions] Set Filters');
    expect(action.filters).toEqual({ category: 'Food' });
  });

  it('setTransactionSearch should carry the search term', () => {
    expect(A.setTransactionSearch({ search: 'x' }).search).toBe('x');
  });

  it('setTransactionPage / setTransactionPageSize should carry values', () => {
    expect(A.setTransactionPage({ page: 2 }).page).toBe(2);
    expect(A.setTransactionPageSize({ pageSize: 50 }).pageSize).toBe(50);
  });

  it('deleteTransaction should carry the id', () => {
    expect(A.deleteTransaction({ id: '7' }).id).toBe('7');
  });

  it('clearTransactionFilters / clearTransactionFeedback should be simple actions', () => {
    expect(A.clearTransactionFilters().type).toBe('[Transactions] Clear Filters');
    expect(A.clearTransactionFeedback().type).toBe('[Transactions] Clear Feedback');
  });

  it('loadTransaction should carry the id', () => {
    expect(A.loadTransaction({ id: '9' }).id).toBe('9');
  });
});
