import * as S from './accounts.selectors';
import { Account, AccountState, DEFAULT_ACCOUNT, accountsFeatureKey, initialAccountState } from '../../models/accounts.model';

function acc(overrides: Partial<Account>): Account {
  return { ...DEFAULT_ACCOUNT, ...overrides };
}

function root(overrides: Partial<AccountState>): { [accountsFeatureKey]: AccountState } {
  return { [accountsFeatureKey]: { ...initialAccountState, ...overrides } };
}

describe('accounts selectors', () => {
  const accounts: Account[] = [
    acc({ id: '1', accountType: 'Bank Account', balance: 100 }),
    acc({ id: '2', accountType: 'Credit Card', balance: 50 }),
    acc({ id: '3', accountType: 'Cash / Wallet', balance: 25 }),
    acc({ id: '4', accountType: 'Investment', balance: 200 }),
    acc({ id: '5', accountType: 'Bank Account', balance: 75 }),
  ];

  it('selectAccounts should return the list', () => {
    expect(S.selectAccounts(root({ accounts }) as any).length).toBe(5);
  });

  it('selectTotalBalance should sum balances', () => {
    expect(S.selectTotalBalance(root({ accounts }) as any)).toBe(450);
  });

  it('selectAccountCount should count all accounts', () => {
    expect(S.selectAccountCount(root({ accounts }) as any)).toBe(5);
  });

  it('type-specific counts should be correct', () => {
    expect(S.selectBankAccountCount(root({ accounts }) as any)).toBe(2);
    expect(S.selectCreditCardCount(root({ accounts }) as any)).toBe(1);
    expect(S.selectCashWalletCount(root({ accounts }) as any)).toBe(1);
    expect(S.selectInvestmentCount(root({ accounts }) as any)).toBe(1);
  });

  it('selectSelectedAccount should resolve the selected account or null', () => {
    expect(S.selectSelectedAccount(root({ accounts, selectedAccountId: '2' }) as any)?.id).toBe('2');
    expect(S.selectSelectedAccount(root({ accounts, selectedAccountId: null }) as any)).toBeNull();
    expect(S.selectSelectedAccount(root({ accounts, selectedAccountId: 'nope' }) as any)).toBeNull();
  });

  it('form option selectors should read from formOptions', () => {
    const state = root({
      formOptions: { accountTypes: ['T'], banks: ['B'], currencies: [{ code: 'INR', label: 'Rupee' }], subTypes: ['S'] },
    });
    expect(S.selectAccountTypeOptions(state as any)).toEqual(['T']);
    expect(S.selectBankOptions(state as any)).toEqual(['B']);
    expect(S.selectCurrencyOptions(state as any)).toEqual([{ code: 'INR', label: 'Rupee' }]);
    expect(S.selectAccountSubTypeOptions(state as any)).toEqual(['S']);
  });

  it('selectError and selectSuccessMessage should read feedback', () => {
    expect(S.selectError(root({ error: 'e' }) as any)).toBe('e');
    expect(S.selectSuccessMessage(root({ successMessage: 's' }) as any)).toBe('s');
  });
});
