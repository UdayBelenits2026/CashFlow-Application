import { TestBed } from '@angular/core/testing';
import { Store, provideStore } from '@ngrx/store';

import { AccountFacade } from './account.facade';
import { accountReducer } from '../store/reducers/accounts.reducer';
import { accountsFeatureKey } from '../models/accounts.model';
import * as A from '../store/actions/accounts.actions';
import { Account, CreateAccountRequest } from '../models/accounts.model';

describe('AccountFacade', () => {
  let facade: AccountFacade;
  let dispatchSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideStore({ [accountsFeatureKey]: accountReducer })],
    });
    facade = TestBed.inject(AccountFacade);
    dispatchSpy = spyOn(TestBed.inject(Store), 'dispatch');
  });

  it('should expose read streams', (done) => {
    facade.accounts$.subscribe((accounts) => {
      expect(accounts).toEqual([]);
      done();
    });
  });

  it('loadAccounts should dispatch loadAccounts', () => {
    facade.loadAccounts();
    expect(dispatchSpy).toHaveBeenCalledWith(A.loadAccounts());
  });

  it('createAccount and addAccount should both dispatch createAccount', () => {
    const account = { accountName: 'A' } as CreateAccountRequest;
    facade.createAccount(account);
    facade.addAccount(account);
    expect(dispatchSpy).toHaveBeenCalledWith(A.createAccount({ account }));
    expect(dispatchSpy).toHaveBeenCalledTimes(2);
  });

  it('updateAccount should dispatch updateAccount', () => {
    const account = { id: '1' } as Account;
    facade.updateAccount(account);
    expect(dispatchSpy).toHaveBeenCalledWith(A.updateAccount({ account }));
  });

  it('deleteAccount should dispatch deleteAccount', () => {
    facade.deleteAccount('3');
    expect(dispatchSpy).toHaveBeenCalledWith(A.deleteAccount({ id: '3' }));
  });

  it('selectAccount should dispatch selectAccount', () => {
    facade.selectAccount('5');
    expect(dispatchSpy).toHaveBeenCalledWith(A.selectAccount({ id: '5' }));
  });

  it('loadTransactions should dispatch loadAccountTransactions', () => {
    facade.loadTransactions('9');
    expect(dispatchSpy).toHaveBeenCalledWith(A.loadAccountTransactions({ accountId: '9' }));
  });

  it('loadFormOptions / loadSubTypes / loadCategories should dispatch their actions', () => {
    facade.loadFormOptions();
    facade.loadSubTypes('Bank Account');
    facade.loadCategories();
    expect(dispatchSpy).toHaveBeenCalledWith(A.loadAccountFormOptions());
    expect(dispatchSpy).toHaveBeenCalledWith(A.loadAccountSubTypes({ accountType: 'Bank Account' }));
    expect(dispatchSpy).toHaveBeenCalledWith(A.loadAccountCategories());
  });

  it('createCategory should dispatch createAccountCategory', () => {
    const category = { accountType: 'Bank Account', name: 'Savings' };
    facade.createCategory(category);
    expect(dispatchSpy).toHaveBeenCalledWith(A.createAccountCategory({ category }));
  });

  it('clearFeedback should dispatch clearAccountFeedback', () => {
    facade.clearFeedback();
    expect(dispatchSpy).toHaveBeenCalledWith(A.clearAccountFeedback());
  });
});
