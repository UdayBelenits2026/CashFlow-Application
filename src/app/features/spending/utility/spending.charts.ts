import { ChartConfiguration } from 'chart.js';
import { CHART_DEFAULT_SLICE_COLOR, CHART_BORDER_COLOR } from './spending.constants';

/** View-model for a doughnut chart card (labels, datasets and the center total). */
export type DoughnutChartVm = {
  labels: string[];
  datasets: ChartConfiguration<'doughnut'>['data']['datasets'];
  total: number;
};

/** Builds a doughnut dataset from category amounts and colors. */
export function buildDoughnutDataset(
  amounts: number[],
  colors: string[]
): ChartConfiguration<'doughnut'>['data']['datasets'] {
  return [
    {
      data: amounts,
      backgroundColor: colors.map((c) => c || CHART_DEFAULT_SLICE_COLOR),
      borderWidth: 2,
      borderColor: CHART_BORDER_COLOR
    }
  ];
}
