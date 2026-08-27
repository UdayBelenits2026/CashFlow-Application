import { DashboardWidgetConfig } from '../models/dashboard-widget.model';
import {
  DashboardConfigurationDto,
  WIDGET_CODE_TO_ID,
  WIDGET_ID_TO_CODE,
} from '../models/dashboard-api.dto';
import {
  cloneWidgetConfig,
  DASHBOARD_WIDGET_DEFAULT_CONFIG,
  sortWidgetConfig,
} from './dashboard-widget-config';

// Merges the backend widget configuration over the full default set so every widget stays present
export function mapConfiguration(dto: DashboardConfigurationDto): DashboardWidgetConfig[] {
  const byId = new Map(cloneWidgetConfig(DASHBOARD_WIDGET_DEFAULT_CONFIG).map((w) => [w.id, w]));
  for (const widget of dto.widgets ?? []) {
    const id = WIDGET_CODE_TO_ID[widget.code];
    const existing = id ? byId.get(id) : undefined;
    if (existing) {
      byId.set(id, {
        ...existing,
        order: widget.position,
        selected: widget.visible,
        layout: widget.layout ?? existing.layout,
      });
    }
  }
  return sortWidgetConfig([...byId.values()]);
}

// Maps the internal widget config into the backend configuration payload
export function toConfigurationDto(config: DashboardWidgetConfig[]): DashboardConfigurationDto {
  return {
    layout: 'CUSTOM',
    widgets: config.map((c) => ({
      code: WIDGET_ID_TO_CODE[c.id],
      position: c.order,
      visible: c.selected,
      layout: c.layout,
    })),
  };
}
