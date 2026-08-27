import * as A from './dashboard.actions';
import { DashboardItem } from '../models/dashboard.models';

describe('dashboard actions', () => {
  it('loadDashboard should carry optional filters', () => {
    expect(A.loadDashboard({}).type).toBe('[Dashboard] Load Dashboard');
    expect(A.loadDashboard({ filters: { merchant: 'A' } as any }).filters).toEqual({ merchant: 'A' } as any);
  });

  it('loadDashboardSuccess should carry data', () => {
    const data = { summaryCards: [] } as any;
    expect(A.loadDashboardSuccess({ data }).data).toBe(data);
  });

  it('loadDashboardFailure should carry an optional error', () => {
    expect(A.loadDashboardFailure({ error: 'e' }).error).toBe('e');
  });

  it('selectQuickAction should carry the actionId', () => {
    expect(A.selectQuickAction({ actionId: 'x' }).actionId).toBe('x');
  });

  it('add/update/delete upcoming bill should carry payloads', () => {
    const item = { id: 'b1' } as DashboardItem;
    expect(A.addUpcomingBill({ item }).item).toBe(item);
    expect(A.updateUpcomingBill({ item }).item).toBe(item);
    expect(A.deleteUpcomingBill({ id: 'b1' }).id).toBe('b1');
  });

  it('addReminder should be a simple action', () => {
    expect(A.addReminder().type).toBe('[Dashboard] Add Reminder');
  });
});
