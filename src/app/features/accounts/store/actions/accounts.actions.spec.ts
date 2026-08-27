import * as A from './accounts.actions';

describe('accounts actions', () => {
  it('loadAccounts should have the correct type', () => {
    expect(A.loadAccounts().type).toBe('[Account] Load Accounts');
  });

  it('loadAccountsSuccess should carry accounts', () => {
    const action = A.loadAccountsSuccess({ accounts: [] });
    expect(action.type).toBe('[Account API] Load Accounts Success');
    expect(action.accounts).toEqual([]);
  });

  it('createAccount should carry the account request', () => {
    const account = { accountName: 'A' } as any;
    expect(A.createAccount({ account }).account).toBe(account);
  });

  it('deleteAccount should carry the id', () => {
    expect(A.deleteAccount({ id: '3' }).id).toBe('3');
  });

  it('selectAccount should carry the id (or null)', () => {
    expect(A.selectAccount({ id: '3' }).id).toBe('3');
    expect(A.selectAccount({ id: null }).id).toBeNull();
  });

  it('loadAccountTransactions should carry the accountId', () => {
    expect(A.loadAccountTransactions({ accountId: '9' }).accountId).toBe('9');
  });

  it('loadAccountFormOptionsSuccess should carry option lists', () => {
    const action = A.loadAccountFormOptionsSuccess({ accountTypes: ['T'], banks: ['B'], currencies: [] });
    expect(action.accountTypes).toEqual(['T']);
    expect(action.banks).toEqual(['B']);
  });

  it('loadAccountSubTypes should carry the account type', () => {
    expect(A.loadAccountSubTypes({ accountType: 'Bank Account' }).accountType).toBe('Bank Account');
  });

  it('clearAccountFeedback should be a simple action', () => {
    expect(A.clearAccountFeedback().type).toBe('[Account] Clear Feedback');
  });
});
