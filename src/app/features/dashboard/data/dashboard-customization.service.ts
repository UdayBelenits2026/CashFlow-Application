import { Injectable } from '@angular/core';
import {
  cloneWidgetConfig,
  DASHBOARD_WIDGET_DEFAULT_CONFIG,
  DASHBOARD_WIDGET_DEFINITIONS,
  DashboardWidgetConfig,
  DashboardWidgetId,
  sortWidgetConfig,
} from '../utility/dashboard-widget-config';

@Injectable({
  providedIn: 'root',
})
export class DashboardCustomizationService {
  getDefaultConfig(): DashboardWidgetConfig[] {
    return cloneWidgetConfig(DASHBOARD_WIDGET_DEFAULT_CONFIG);
  }

  normalizeConfig(config: DashboardWidgetConfig[]): DashboardWidgetConfig[] {
    const byId = new Map<DashboardWidgetId, DashboardWidgetConfig>();

    for (const item of config) {
      if (DASHBOARD_WIDGET_DEFINITIONS.some((definition) => definition.id === item.id)) {
        byId.set(item.id, {
          id: item.id,
          selected: Boolean(item.selected),
          layout: item.layout === 'wide' ? 'wide' : 'medium',
          order: Number.isFinite(item.order) ? item.order : 0,
        });
      }
    }

    const merged = DASHBOARD_WIDGET_DEFAULT_CONFIG.map((defaultItem) => {
      const existing = byId.get(defaultItem.id);
      return existing ? existing : { ...defaultItem };
    });

    const sorted = sortWidgetConfig(merged);
    return sorted.map((item, index) => ({ ...item, order: index }));
  }
}
