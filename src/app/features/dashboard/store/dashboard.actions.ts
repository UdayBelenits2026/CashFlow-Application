import { createAction, props } from '@ngrx/store';
import { DashboardApiResponse, DashboardItem } from '../models/dashboard.models';
import { DashboardWidgetConfig } from '../utility/dashboard-widget-config';
// Action definitions for dashboard loading and user actions
export const loadDashboard = createAction('[Dashboard] Load Dashboard');
export const loadDashboardSuccess = createAction(
  '[Dashboard] Load Dashboard Success',
  props<{ data: DashboardApiResponse }>(),
);
export const loadDashboardFailure = createAction(
  '[Dashboard] Load Dashboard Failure',
  props<{ error?: string }>(),
);
export const selectQuickAction = createAction(
  '[Dashboard] Select Quick Action',
  props<{ actionId: string }>(),
);
export const viewAllItems = createAction(
  '[Dashboard] View All Items',
  props<{ section: string }>(),
);
export const addReminder = createAction('[Dashboard] Add Reminder');
export const addUpcomingBill = createAction(
  '[Dashboard] Add Upcoming Bill',
  props<{ item: DashboardItem }>(),
);
export const addUpcomingBillSuccess = createAction(
  '[Dashboard] Add Upcoming Bill Success',
  props<{ item: DashboardItem }>(),
);
export const addUpcomingBillFailure = createAction(
  '[Dashboard] Add Upcoming Bill Failure',
  props<{ error?: string }>(),
);
export const updateUpcomingBill = createAction(
  '[Dashboard] Update Upcoming Bill',
  props<{ item: DashboardItem }>(),
);
export const updateUpcomingBillSuccess = createAction(
  '[Dashboard] Update Upcoming Bill Success',
  props<{ item: DashboardItem }>(),
);
export const updateUpcomingBillFailure = createAction(
  '[Dashboard] Update Upcoming Bill Failure',
  props<{ error?: string }>(),
);
export const deleteUpcomingBill = createAction(
  '[Dashboard] Delete Upcoming Bill',
  props<{ id: number | string }>(),
);
export const deleteUpcomingBillSuccess = createAction(
  '[Dashboard] Delete Upcoming Bill Success',
  props<{ id: number | string }>(),
);
export const deleteUpcomingBillFailure = createAction(
  '[Dashboard] Delete Upcoming Bill Failure',
  props<{ error?: string }>(),
);
export const saveDashboardWidgetConfig = createAction(
  '[Dashboard] Save Widget Config',
  props<{ widgetConfig: DashboardWidgetConfig[] }>(),
);
export const saveDashboardWidgetConfigSuccess = createAction(
  '[Dashboard] Save Widget Config Success',
  props<{ widgetConfig: DashboardWidgetConfig[] }>(),
);
export const saveDashboardWidgetConfigFailure = createAction(
  '[Dashboard] Save Widget Config Failure',
  props<{ error?: string }>(),
);
