import {
  DASHBOARD_WIDGET_DEFINITIONS,
  DASHBOARD_WIDGET_DEFAULT_CONFIG,
  cloneWidgetConfig,
  sortWidgetConfig,
} from './dashboard-widget-config';

describe('dashboard-widget-config', () => {
  it('every default config entry should map to a known definition', () => {
    const defIds = new Set(DASHBOARD_WIDGET_DEFINITIONS.map((d) => d.id));
    for (const cfg of DASHBOARD_WIDGET_DEFAULT_CONFIG) {
      expect(defIds.has(cfg.id)).toBeTrue();
    }
  });

  it('definition ids and default config ids should be unique', () => {
    const defIds = DASHBOARD_WIDGET_DEFINITIONS.map((d) => d.id);
    const cfgIds = DASHBOARD_WIDGET_DEFAULT_CONFIG.map((c) => c.id);
    expect(new Set(defIds).size).toBe(defIds.length);
    expect(new Set(cfgIds).size).toBe(cfgIds.length);
  });

  describe('cloneWidgetConfig', () => {
    it('should return a new array with new item objects', () => {
      const original = DASHBOARD_WIDGET_DEFAULT_CONFIG;
      const clone = cloneWidgetConfig(original);
      expect(clone).not.toBe(original);
      expect(clone[0]).not.toBe(original[0]);
      expect(clone[0]).toEqual(original[0]);
    });
  });

  describe('sortWidgetConfig', () => {
    it('should sort ascending by order without mutating input', () => {
      const input = [
        { id: 'netWorth', selected: true, layout: 'medium', order: 2 },
        { id: 'cashBalance', selected: true, layout: 'medium', order: 0 },
        { id: 'savingsGoal', selected: true, layout: 'medium', order: 1 },
      ] as any;
      const sorted = sortWidgetConfig(input);
      expect(sorted.map((s: any) => s.order)).toEqual([0, 1, 2]);
      expect(input[0].order).toBe(2); // original untouched
    });
  });
});
