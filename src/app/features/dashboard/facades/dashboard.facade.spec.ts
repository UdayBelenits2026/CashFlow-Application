import { TestBed } from '@angular/core/testing';
import { Store, provideStore } from '@ngrx/store';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { DashboardFacade } from './dashboard.facade';
import { dashboardReducer } from '../store/dashboard.reducer';
import { DashboardItem } from '../models/dashboard.models';

describe('DashboardFacade', () => {
  let facade: DashboardFacade;
  let dispatchSpy: jasmine.Spy;

  function lastAction(): any {
    return dispatchSpy.calls.mostRecent().args[0];
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideStore({ dashboard: dashboardReducer }),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    facade = TestBed.inject(DashboardFacade);
    dispatchSpy = spyOn(TestBed.inject(Store), 'dispatch');
  });

  it('should expose reactive signals with fallback values', () => {
    expect(facade.summaryCards()).toBeDefined();
    expect(Array.isArray(facade.upcomingBills())).toBeTrue();
  });

  it('loadDashboard should dispatch loadDashboard with filters', () => {
    facade.loadDashboard({ merchant: 'A' } as any);
    expect(lastAction().type).toBe('[Dashboard] Load Dashboard');
    expect(lastAction().filters).toEqual({ merchant: 'A' } as any);
  });

  it('applyFilters should dispatch setDashboardFilters', () => {
    facade.applyFilters({ merchant: 'B' } as any);
    expect(lastAction().type).toBe('[Dashboard] Set Filters');
  });

  it('selectQuickAction should dispatch with actionId', () => {
    facade.selectQuickAction('x');
    expect(lastAction().actionId).toBe('x');
  });

  it('viewAll should dispatch with section', () => {
    facade.viewAll('bills');
    expect(lastAction().section).toBe('bills');
  });

  it('addReminder should dispatch the reminder action', () => {
    facade.addReminder();
    expect(lastAction().type).toBe('[Dashboard] Add Reminder');
  });

  it('updateUpcomingBill should dispatch the item', () => {
    const item = { id: 'b1' } as DashboardItem;
    facade.updateUpcomingBill(item);
    expect(lastAction().item).toBe(item);
  });

  it('deleteUpcomingBill should dispatch the id', () => {
    facade.deleteUpcomingBill('b1');
    expect(lastAction().id).toBe('b1');
  });

  it('saveWidgetConfig should dispatch the widget config', () => {
    const config = [{ id: 'cashBalance', selected: true, layout: 'medium', order: 0 }] as any;
    facade.saveWidgetConfig(config);
    expect(lastAction().widgetConfig).toBe(config);
  });
});
