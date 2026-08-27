import { TestBed } from '@angular/core/testing';
import { Store, provideStore } from '@ngrx/store';

import { TransactionsFacade } from './transactions.facade';
import { transactionsReducer, transactionsFeatureKey } from '../store/transactions.reducers';
import * as A from '../store/transactions.actions';
import { Transaction } from '../models/models.transaction';

describe('TransactionsFacade', () => {
  let facade: TransactionsFacade;
  let dispatchSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideStore({ [transactionsFeatureKey]: transactionsReducer })],
    });
    facade = TestBed.inject(TransactionsFacade);
    dispatchSpy = spyOn(TestBed.inject(Store), 'dispatch');
  });

  it('should expose read streams', (done) => {
    facade.loading$.subscribe((loading) => {
      expect(loading).toBeFalse();
      done();
    });
  });

  it('loadTransactions should dispatch load', () => {
    facade.loadTransactions();
    expect(dispatchSpy).toHaveBeenCalledWith(A.loadTransactions());
  });

  it('setFilters should dispatch setTransactionFilters', () => {
    facade.setFilters({ category: 'Food' });
    expect(dispatchSpy).toHaveBeenCalledWith(A.setTransactionFilters({ filters: { category: 'Food' } }));
  });

  it('setSearch should dispatch setTransactionSearch', () => {
    facade.setSearch('coffee');
    expect(dispatchSpy).toHaveBeenCalledWith(A.setTransactionSearch({ search: 'coffee' }));
  });

  it('setPage / setPageSize should dispatch pagination actions', () => {
    facade.setPage(3);
    facade.setPageSize(25);
    expect(dispatchSpy).toHaveBeenCalledWith(A.setTransactionPage({ page: 3 }));
    expect(dispatchSpy).toHaveBeenCalledWith(A.setTransactionPageSize({ pageSize: 25 }));
  });

  it('deleteTransaction should dispatch delete', () => {
    facade.deleteTransaction('7');
    expect(dispatchSpy).toHaveBeenCalledWith(A.deleteTransaction({ id: '7' }));
  });

  it('loadTransaction / clearSelected should dispatch form actions', () => {
    facade.loadTransaction('9');
    facade.clearSelected();
    expect(dispatchSpy).toHaveBeenCalledWith(A.loadTransaction({ id: '9' }));
    expect(dispatchSpy).toHaveBeenCalledWith(A.clearSelectedTransaction());
  });

  it('createTransaction should dispatch create with idempotency key', () => {
    const payload = { description: 'x' } as any;
    facade.createTransaction(payload, 'key-1');
    expect(dispatchSpy).toHaveBeenCalledWith(A.createTransaction({ transaction: payload, idempotencyKey: 'key-1' }));
  });

  it('updateTransaction should dispatch update', () => {
    const changes: Partial<Transaction> = { amount: 5 };
    facade.updateTransaction('1', changes);
    expect(dispatchSpy).toHaveBeenCalledWith(A.updateTransaction({ id: '1', changes }));
  });

  it('clearFeedback should dispatch clearTransactionFeedback', () => {
    facade.clearFeedback();
    expect(dispatchSpy).toHaveBeenCalledWith(A.clearTransactionFeedback());
  });
});
