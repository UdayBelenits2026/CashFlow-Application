import { createAction, props } from '@ngrx/store';
import { DashboardApiResponse } from '../models/dashboard.models';
import { DashboardWidgetConfig } from '../utility/dashboard-widget-config';
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
