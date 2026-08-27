import { TestBed } from '@angular/core/testing';
import { Store, provideStore } from '@ngrx/store';

import { IncomeFacade } from './income.facade';
import { incomeReducer } from '../store/income.reducer';
import { incomeFeatureKey } from '../store/income.state';

describe('IncomeFacade', () => {
  let facade: IncomeFacade;
  let dispatchSpy: jasmine.Spy;

  function lastAction(): any {
    return dispatchSpy.calls.mostRecent().args[0];
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideStore({ [incomeFeatureKey]: incomeReducer })],
    });
    facade = TestBed.inject(IncomeFacade);
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
    expect(lastAction().type).toBe('[Income] Load Dashboard');
  });

  it('retry should re-trigger loadDashboard', () => {
    facade.retry();
    expect(lastAction().type).toBe('[Income] Load Dashboard');
  });

  it('addIncome should dispatch with the income payload', () => {
    facade.addIncome({ amount: 5 });
    expect(lastAction().income).toEqual({ amount: 5 });
  });

  it('updateIncome should dispatch with id and income', () => {
    facade.updateIncome('1', { amount: 9 });
    expect(lastAction().id).toBe('1');
    expect(lastAction().income).toEqual({ amount: 9 });
  });

  it('deleteIncome should dispatch with id', () => {
    facade.deleteIncome('3');
    expect(lastAction().id).toBe('3');
  });

  it('toggleSourceStatus should dispatch id and status', () => {
    facade.toggleSourceStatus('s1', 'INACTIVE');
    expect(lastAction().id).toBe('s1');
    expect(lastAction().status).toBe('INACTIVE');
  });

  it('setFilters should dispatch filters', () => {
    facade.setFilters({ searchTerm: 'abc' });
    expect(lastAction().filters).toEqual({ searchTerm: 'abc' });
  });

  it('setSelectedCalendarMonth should dispatch year and month', () => {
    facade.setSelectedCalendarMonth(2026, 3);
    expect(lastAction().year).toBe(2026);
    expect(lastAction().month).toBe(3);
  });

  it('clearFeedback should dispatch a feedback-clearing action', () => {
    facade.clearFeedback();
    expect(dispatchSpy).toHaveBeenCalled();
  });
});
