import {
  DEFAULT_CATEGORIES,
  CURRENCY_SYMBOL,
  MONTHS_PER_YEAR,
  WEEKS_PER_MONTH,
  CHART_DEFAULT_SLICE_COLOR,
  CHART_BORDER_COLOR,
  CHART_LINE_COLOR,
  CHART_LINE_FILL
} from './spending.constants';

describe('spending.constants', () => {
  it('should expose expected scalar constants', () => {
    expect(CURRENCY_SYMBOL).toBe('₹');
    expect(MONTHS_PER_YEAR).toBe(12);
    expect(WEEKS_PER_MONTH).toBeCloseTo(4.33);
    expect(CHART_DEFAULT_SLICE_COLOR).toBe('#3B82F6');
    expect(CHART_BORDER_COLOR).toBe('#ffffff');
    expect(CHART_LINE_COLOR).toBe('#2563EB');
    expect(CHART_LINE_FILL).toContain('rgba');
  });

  it('should provide a non-empty default category palette', () => {
    expect(DEFAULT_CATEGORIES.length).toBeGreaterThan(0);
    for (const cat of DEFAULT_CATEGORIES) {
      expect(cat.id).toBeTruthy();
      expect(cat.name).toBeTruthy();
      expect(cat.color).toMatch(/^#/);
      expect(cat.amount).toBe(0);
      expect(cat.percentage).toBe(0);
    }
  });

  it('default category ids should be unique', () => {
    const ids = DEFAULT_CATEGORIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
