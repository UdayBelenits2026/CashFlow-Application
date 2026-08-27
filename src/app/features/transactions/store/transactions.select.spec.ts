import * as S from './transactions.select';
import { transactionsReducer, TransactionsState, transactionsFeatureKey } from './transactions.reducers';
import { Transaction } from '../models/models.transaction';

function tx(p: Partial<Transaction>): Transaction {
  return {
    id: '1', date: '2026-01-01', description: 'd', category: 'Food',
    accountId: 'a1', accountName: 'Checking', amount: 10, type: 'Expense',
    ...p,
  } as Transaction;
}

function root(overrides: Partial<TransactionsState>): { [transactionsFeatureKey]: TransactionsState } {
  const base = transactionsReducer(undefined, { type: '@@init' } as any);
  return { [transactionsFeatureKey]: { ...base, ...overrides } };
}

describe('transactions selectors', () => {
  const sample: Transaction[] = [
    tx({ id: '1', accountId: 'a1', accountName: 'Bravo', category: 'Food', amount: 30, date: '2026-01-02', description: 'Lunch' }),
    tx({ id: '2', accountId: 'a2', accountName: 'Alpha', category: 'Travel', amount: 10, date: '2026-01-01', description: 'Taxi' }),
    tx({ id: '3', accountId: 'a1', accountName: 'Bravo', category: 'Food', amount: 20, date: '2026-01-03', description: 'Dinner' }),
  ];

  it('selectAccountOptions should return distinct accounts sorted by name', () => {
    const options = S.selectAccountOptions(root({ transactions: sample }) as any);
    expect(options).toEqual([
      { id: 'a2', name: 'Alpha' },
      { id: 'a1', name: 'Bravo' },
    ]);
  });

  it('selectCategoryOptions should return distinct sorted categories', () => {
    const options = S.selectCategoryOptions(root({ transactions: sample }) as any);
    expect(options).toEqual(['Food', 'Travel']);
  });

  it('selectFilteredTransactions should filter by category', () => {
    const result = S.selectFilteredTransactions(
      root({ transactions: sample, filters: { ...transactionsReducer(undefined, { type: '' } as any).filters, category: 'Food' } }) as any
    );
    expect(result.length).toBe(2);
    expect(result.every((t) => t.category === 'Food')).toBeTrue();
  });

  it('selectFilteredTransactions should apply text search (min 2 chars)', () => {
    const result = S.selectFilteredTransactions(root({ transactions: sample, search: 'taxi' }) as any);
    expect(result.map((t) => t.id)).toEqual(['2']);
  });

  it('selectFilteredTransactions should sort by amount ascending', () => {
    const result = S.selectFilteredTransactions(
      root({ transactions: sample, sort: { field: 'amount', direction: 'asc' } }) as any
    );
    expect(result.map((t) => t.amount)).toEqual([10, 20, 30]);
  });

  it('selectFilteredCount should count filtered results', () => {
    const count = S.selectFilteredCount(root({ transactions: sample }) as any);
    expect(count).toBe(3);
  });

  it('selectPagedTransactions should return only the current page slice', () => {
    const result = S.selectPagedTransactions(
      root({ transactions: sample, page: 1, pageSize: 2 }) as any
    );
    expect(result.length).toBe(2);
  });

  it('selectTransactionPageInfo should compute pagination metadata', () => {
    const info = S.selectTransactionPageInfo(
      root({ transactions: sample, page: 1, pageSize: 2 }) as any
    );
    expect(info.total).toBe(3);
    expect(info.totalPages).toBe(2);
    expect(info.from).toBe(1);
    expect(info.to).toBe(2);
    expect(info.pages).toEqual([1, 2]);
  });

  it('selectTransactionPageInfo should handle an empty list', () => {
    const info = S.selectTransactionPageInfo(root({ transactions: [], page: 1, pageSize: 10 }) as any);
    expect(info.total).toBe(0);
    expect(info.from).toBe(0);
    expect(info.to).toBe(0);
    expect(info.totalPages).toBe(1);
  });
});
