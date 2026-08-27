import { TestBed } from '@angular/core/testing';
import { Store, provideStore } from '@ngrx/store';

import { SpendingFacade } from './spending.facade';
import { spendingReducer } from '../store/spending.reducer';
import { spendingFeatureKey } from '../store/spending.state';

describe('SpendingFacade', () => {
  let facade: SpendingFacade;
  let dispatchSpy: jasmine.Spy;

  function lastAction(): any {
    return dispatchSpy.calls.mostRecent().args[0];
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideStore({ [spendingFeatureKey]: spendingReducer })],
    });
    facade = TestBed.inject(SpendingFacade);
    dispatchSpy = spyOn(TestBed.inject(Store), 'dispatch');
  });

  it('should expose read streams', (done) => {
    facade.isLoading$.subscribe((loading) => {
      expect(loading).toBeFalse();
      done();
    });
  });

  it('loadDashboard should dispatch the load action', () => {
    facade.loadDashboard();
    expect(lastAction().type).toBe('[Spending] Load Dashboard');
  });

  it('addExpense should dispatch with the expense payload', () => {
    facade.addExpense({ amount: 5 });
    expect(lastAction().expense).toEqual({ amount: 5 });
  });

  it('updateExpense should dispatch with id and expense', () => {
    facade.updateExpense('1', { amount: 9 });
    expect(lastAction().id).toBe('1');
    expect(lastAction().expense).toEqual({ amount: 9 });
  });

  it('deleteExpense should dispatch with id', () => {
    facade.deleteExpense('3');
    expect(lastAction().id).toBe('3');
  });

  it('setFilters should dispatch filters', () => {
    facade.setFilters({ searchTerm: 'abc' });
    expect(lastAction().filters).toEqual({ searchTerm: 'abc' });
  });

  it('toggleRecurringExpense should dispatch id and isActive', () => {
    facade.toggleRecurringExpense('r1', true);
    expect(lastAction().id).toBe('r1');
    expect(lastAction().isActive).toBeTrue();
  });

  it('markAlertAsRead / dismissAlert should dispatch with id', () => {
    facade.markAlertAsRead('a1');
    expect(lastAction().id).toBe('a1');
    facade.dismissAlert('a2');
    expect(lastAction().id).toBe('a2');
  });

  it('clearFeedback should dispatch a feedback-clearing action', () => {
    facade.clearFeedback();
    expect(dispatchSpy).toHaveBeenCalled();
  });
});
