import {
  INCOME_TYPE_OPTIONS,
  CURRENCY_SYMBOL,
  MONTHS_PER_YEAR,
  WEEKS_PER_MONTH,
  MS_PER_DAY,
  MAIN_ACCOUNT_LABEL,
  CHART_COLORS
} from './income.constants';

describe('income.constants', () => {
  it('should expose expected scalar constants', () => {
    expect(CURRENCY_SYMBOL).toBe('₹');
    expect(MONTHS_PER_YEAR).toBe(12);
    expect(WEEKS_PER_MONTH).toBeCloseTo(4.33);
    expect(MS_PER_DAY).toBe(86_400_000);
    expect(MAIN_ACCOUNT_LABEL).toBe('Main Account');
    expect(CHART_COLORS.primary).toBe('#2563EB');
  });

  it('should provide a full catalog of income type options', () => {
    expect(INCOME_TYPE_OPTIONS.length).toBeGreaterThanOrEqual(9);
    const types = INCOME_TYPE_OPTIONS.map((o) => o.type);
    expect(types).toContain('Salary');
    expect(types).toContain('Other');
  });

  it('every option should have color, label, icon and taxable flag', () => {
    for (const opt of INCOME_TYPE_OPTIONS) {
      expect(opt.color).toMatch(/^#/);
      expect(opt.label.length).toBeGreaterThan(0);
      expect(opt.icon.length).toBeGreaterThan(0);
      expect(typeof opt.defaultTaxable).toBe('boolean');
    }
  });

  it('option types should be unique', () => {
    const types = INCOME_TYPE_OPTIONS.map((o) => o.type);
    expect(new Set(types).size).toBe(types.length);
  });
});
