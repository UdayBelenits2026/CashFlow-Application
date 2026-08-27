import { TestBed } from '@angular/core/testing';
import { DashboardCustomizationService } from './dashboard-customization.service';
import { DASHBOARD_WIDGET_DEFAULT_CONFIG } from '../utility/dashboard-widget-config';

describe('DashboardCustomizationService', () => {
  let service: DashboardCustomizationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardCustomizationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getDefaultConfig', () => {
    it('should return a clone of the default config, not the same reference', () => {
      const config = service.getDefaultConfig();
      expect(config).toEqual(DASHBOARD_WIDGET_DEFAULT_CONFIG);
      expect(config).not.toBe(DASHBOARD_WIDGET_DEFAULT_CONFIG);
    });
  });

  describe('normalizeConfig', () => {
    it('should return all default widgets when given an empty config', () => {
      const result = service.normalizeConfig([]);
      expect(result.length).toBe(DASHBOARD_WIDGET_DEFAULT_CONFIG.length);
    });

    it('should reindex order sequentially from zero', () => {
      const result = service.normalizeConfig([]);
      expect(result.map((r) => r.order)).toEqual(result.map((_, i) => i));
    });

    it('should ignore unknown widget ids', () => {
      const result = service.normalizeConfig([
        { id: 'unknownWidget' as any, selected: true, layout: 'wide', order: 0 },
      ]);
      expect(result.some((r) => (r.id as string) === 'unknownWidget')).toBeFalse();
    });

    it('should apply saved values for known widgets and coerce invalid layout', () => {
      const result = service.normalizeConfig([
        { id: 'savingsGoal', selected: true, layout: 'invalid' as any, order: 99 },
      ]);
      const savings = result.find((r) => r.id === 'savingsGoal')!;
      expect(savings.selected).toBeTrue();
      expect(savings.layout).toBe('medium'); // invalid coerced to medium
    });

    it('should coerce non-finite order to 0 before reindexing', () => {
      const result = service.normalizeConfig([
        { id: 'cashBalance', selected: true, layout: 'wide', order: NaN as any },
      ]);
      // still present and reindexed
      expect(result.find((r) => r.id === 'cashBalance')).toBeTruthy();
    });
  });
});
