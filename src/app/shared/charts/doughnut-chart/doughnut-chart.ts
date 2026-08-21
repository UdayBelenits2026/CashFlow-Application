import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  effect,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ArcElement,
  Chart,
  ChartConfiguration,
  DoughnutController,
  Legend,
  Tooltip,
} from 'chart.js';

Chart.register(DoughnutController, ArcElement, Legend, Tooltip);

@Component({
  selector: 'app-cf-doughnut-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doughnut-chart.html',
  styleUrl: './doughnut-chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoughnutChart implements AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas')
  chartCanvas!: ElementRef<HTMLCanvasElement>;

  readonly title = input<string>('');
  readonly subtitle = input<string>('');
  readonly showTitle = input<boolean>(true);
  readonly embedded = input<boolean>(false);
  readonly total = input<number>(2650);
  readonly showLegend = input<boolean>(true);
  readonly datasets =
    input<ChartConfiguration<'doughnut'>['data']['datasets']>([]);
  readonly labels = input<string[]>([]);

  private chart: Chart<'doughnut'> | null = null;

  constructor() {
    effect(() => {
      const labels = this.labels();
      const datasets = this.datasets();

      if (!this.chart) {
        return;
      }

      this.chart.data.labels = labels;
      this.chart.data.datasets = this.applyEnhancedDatasets(datasets);
      this.chart.update();
    });
  }

  private applyEnhancedDatasets(
    datasets: ChartConfiguration<'doughnut'>['data']['datasets']
  ): ChartConfiguration<'doughnut'>['data']['datasets'] {
    return datasets.map((dataset) => ({
      ...dataset,
      borderWidth: 2.5,
      borderColor: '#ffffff',
      hoverBorderColor: '#ffffff',
      hoverBorderWidth: 3,
      hoverOffset: 6,
      borderRadius: 5,
      spacing: 2,
    }));
  }

  ngAfterViewInit(): void {
    const canvas = this.chartCanvas?.nativeElement;

    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    const totalVal = this.total();

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',

      data: {
        labels: this.labels(),
        datasets: this.applyEnhancedDatasets(this.datasets()),
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,

        cutout: '72%',

        animation: {
          animateScale: true,
          animateRotate: true,
          duration: 800,
        },

        plugins: {
          legend: {
            display: this.showLegend(),
            position: 'right',
            align: 'center',

            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              boxWidth: 8,
              boxHeight: 8,
              padding: 12,

              font: {
                size: 11.5,
                family: "'Roboto', sans-serif",
                weight: 500,
              },

              color: '#334155',

              generateLabels: (chart) => {
                const data = chart.data;

                if (!data.labels?.length || !data.datasets.length) {
                  return [];
                }

                const dataset = data.datasets[0];

                const totalSum = dataset.data.reduce(
                  (sum: number, value: unknown) =>
                    sum + Number(value),
                  0
                );

                return data.labels.map((label, index) => {
                  const value = Number(dataset.data[index]) || 0;

                  const percentage =
                    totalSum > 0
                      ? Math.round((value / totalSum) * 100)
                      : 0;

                  const backgroundColor = Array.isArray(
                    dataset.backgroundColor
                  )
                    ? dataset.backgroundColor[index]
                    : dataset.backgroundColor;

                  return {
                    text: `${label} (${percentage}%)`,
                    fillStyle: backgroundColor as string,
                    strokeStyle: backgroundColor as string,
                    lineWidth: 0,
                    pointStyle: 'circle',
                    hidden: !chart.getDataVisibility(index),
                    index,
                  };
                });
              },
            },
          },

          tooltip: {
            enabled: true,
            backgroundColor: '#0f172a',
            titleColor: '#ffffff',
            bodyColor: '#f1f5f9',
            borderColor: '#1e293b',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8,
            boxPadding: 4,
            usePointStyle: true,

            titleFont: {
              size: 12,
              weight: 'bold',
              family: "'Roboto', sans-serif",
            },

            bodyFont: {
              size: 11.5,
              family: "'Roboto', sans-serif",
            },

            callbacks: {
              label: (context: any) => {
                const value = Number(context.raw);

                const dataset = this.datasets()[0];

                const sum = dataset?.data
                  ? dataset.data.reduce(
                      (total: number, item: any) =>
                        total + Number(item),
                      0
                    )
                  : 0;

                const percentage =
                  sum > 0
                    ? Math.round((value / sum) * 100)
                    : 0;

                return `  ${context.label}: ${percentage}% (${value.toFixed(2)})`;
              },
            },
          },
        },
      },
    };

    this.chart = new Chart(ctx, config);
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
    this.chart = null;
  }
}