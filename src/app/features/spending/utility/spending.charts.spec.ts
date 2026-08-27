import { buildDoughnutDataset } from './spending.charts';
import { CHART_DEFAULT_SLICE_COLOR, CHART_BORDER_COLOR } from './spending.constants';

describe('spending.charts', () => {
  describe('buildDoughnutDataset', () => {
    it('should build a single dataset from amounts and colors', () => {
      const ds = buildDoughnutDataset([10, 20], ['#111', '#222']) as any[];
      expect(ds.length).toBe(1);
      expect(ds[0].data).toEqual([10, 20]);
      expect(ds[0].backgroundColor).toEqual(['#111', '#222']);
      expect(ds[0].borderColor).toBe(CHART_BORDER_COLOR);
      expect(ds[0].borderWidth).toBe(2);
    });

    it('should substitute the default slice color for empty colors', () => {
      const ds = buildDoughnutDataset([1, 2], ['', '']) as any[];
      expect(ds[0].backgroundColor).toEqual([CHART_DEFAULT_SLICE_COLOR, CHART_DEFAULT_SLICE_COLOR]);
    });

    it('should handle empty inputs', () => {
      const ds = buildDoughnutDataset([], []) as any[];
      expect(ds[0].data).toEqual([]);
      expect(ds[0].backgroundColor).toEqual([]);
    });
  });
});
