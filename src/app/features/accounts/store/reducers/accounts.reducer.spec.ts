import { accountReducer } from './accounts.reducer';
import * as A from '../actions/accounts.actions';
import { Account, DEFAULT_ACCOUNT, initialAccountState } from '../../models/accounts.model';

function acc(overrides: Partial<Account>): Account {
  return { ...DEFAULT_ACCOUNT, ...overrides };
}

describe('accountReducer', () => {
  const initial = accountReducer(undefined, { type: '@@init' } as any);

  it('should expose the initial state', () => {
    expect(initial).toEqual(initialAccountState);
  });

  it('loadAccounts should set loading', () => {
    const state = accountReducer({ ...initial, error: 'x' }, A.loadAccounts());
    expect(state.loading).toBeTrue();
    expect(state.error).toBeNull();
  });

  it('loadAccountsSuccess should store accounts', () => {
    const accounts = [acc({ id: '1' })];
    const state = accountReducer(initial, A.loadAccountsSuccess({ accounts }));
    expect(state.accounts).toEqual(accounts);
    expect(state.loading).toBeFalse();
  });

  it('loadAccountsFailure should record error', () => {
    const state = accountReducer(initial, A.loadAccountsFailure({ error: 'boom' }));
    expect(state.error).toBe('boom');
  });

  it('createAccountSuccess should set a success message', () => {
    const state = accountReducer(initial, A.createAccountSuccess({ accounts: [acc({ id: '1' })] }));
    expect(state.successMessage).toContain('created');
  });

  it('deleteAccountSuccess should remove the account and clear selection if it was selected', () => {
    const withData = { ...initial, accounts: [acc({ id: '1' }), acc({ id: '2' })], selectedAccountId: '1' };
    const state = accountReducer(withData, A.deleteAccountSuccess({ id: '1' }));
    expect(state.accounts.map((a) => a.id)).toEqual(['2']);
    expect(state.selectedAccountId).toBeNull();
    expect(state.successMessage).toContain('deleted');
  });

  it('selectAccount should track the selected id', () => {
    const state = accountReducer(initial, A.selectAccount({ id: '5' }));
    expect(state.selectedAccountId).toBe('5');
  });

  it('loadAccountTransactionsSuccess should store transactions', () => {
    const txs = [{ id: 't1', accountId: '1', date: '2026-01-01', description: 'd', amount: 5, currency: 'USD' }];
    const state = accountReducer(initial, A.loadAccountTransactionsSuccess({ transactions: txs }));
    expect(state.transactions).toEqual(txs);
  });

  it('loadAccountTransactionsFailure should clear transactions and set error', () => {
    const withTx = { ...initial, transactions: [{ id: 't1' } as any] };
    const state = accountReducer(withTx, A.loadAccountTransactionsFailure({ error: 'e' }));
    expect(state.transactions).toEqual([]);
    expect(state.error).toBe('e');
  });

  it('clearAccountFeedback should clear error and success message', () => {
    const dirty = { ...initial, error: 'e', successMessage: 's' };
    const state = accountReducer(dirty, A.clearAccountFeedback());
    expect(state.error).toBeNull();
    expect(state.successMessage).toBeNull();
  });

  it('loadAccountFormOptionsSuccess should merge form options', () => {
    const state = accountReducer(initial, A.loadAccountFormOptionsSuccess({
      accountTypes: ['Bank Account'], banks: ['HDFC'], currencies: [{ code: 'INR', label: 'Rupee' }],
    }));
    expect(state.formOptions.accountTypes).toEqual(['Bank Account']);
    expect(state.formOptions.banks).toEqual(['HDFC']);
  });

  it('loadAccountSubTypes should clear existing sub-types', () => {
    const withSub = { ...initial, formOptions: { ...initial.formOptions, subTypes: ['old'] } };
    const state = accountReducer(withSub, A.loadAccountSubTypes({ accountType: 'Bank Account' }));
    expect(state.formOptions.subTypes).toEqual([]);
  });

  it('createAccountCategorySuccess should store categories with feedback', () => {
    const state = accountReducer(initial, A.createAccountCategorySuccess({
      categories: [{ id: 'c1', accountType: 'Bank Account', name: 'Savings' }],
    }));
    expect(state.categories.length).toBe(1);
    expect(state.successMessage).toContain('added');
  });
});
