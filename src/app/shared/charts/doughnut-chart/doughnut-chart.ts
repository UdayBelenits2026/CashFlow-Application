import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  computed,
  effect,
  ElementRef,
  input,
  OnDestroy,
  output,
  output,
  ViewChild,
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

  // ---------------------------------------------------------------------------
  // Inputs
  // ---------------------------------------------------------------------------

  readonly title = input<string>('Spending by Category');

  readonly subtitle = input<string>(
    'Distribution across expense categories',
  );

  readonly total = input<number>(2650);

  readonly datasets =
    input<ChartConfiguration<'doughnut'>['data']['datasets']>([]);

  readonly labels = input<string[]>([]);

  readonly isLoading = input<boolean>(false);

  readonly hasError = input<boolean>(false);

  // ---------------------------------------------------------------------------
  // Outputs
  // ---------------------------------------------------------------------------

  readonly retry = output<void>();

  // ---------------------------------------------------------------------------
  // Chart
  // ---------------------------------------------------------------------------

  private chart: Chart<'doughnut'> | null = null;

  // ---------------------------------------------------------------------------
  // Computed state
  // ---------------------------------------------------------------------------

  readonly isEmpty = computed(() => {
    const datasets = this.datasets();
    const labels = this.labels();

    return (
      !datasets ||
      datasets.length === 0 ||
      !labels ||
      labels.length === 0 ||
      datasets.every(
        (dataset) =>
          !dataset.data ||
          dataset.data.length === 0 ||
          dataset.data.every((value) => Number(value) === 0),
      )
    );
  });

  // ---------------------------------------------------------------------------
  // Constructor
  // ---------------------------------------------------------------------------

  constructor() {
    effect(() => {
      const labels = this.labels();
      const datasets = this.datasets();

      if (this.chart) {
        this.chart.data.labels = labels;
        this.chart.data.datasets = this.applyEnhancedDatasets(datasets);
        this.chart.update();
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Enhanced dataset styling
  // ---------------------------------------------------------------------------

  private applyEnhancedDatasets(
    datasets: ChartConfiguration<'doughnut'>['data']['datasets'],
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

  // ---------------------------------------------------------------------------
  // Chart initialization
  // ---------------------------------------------------------------------------

  ngAfterViewInit(): void {
    if (!this.chartCanvas?.nativeElement) {
      return;
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');

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

        // More space in the center for the total amount
        cutout: '72%',

        animation: {
          animateScale: true,
          animateRotate: true,
          duration: 800,
        },

        plugins: {
          // -----------------------------------------------------------------
          // Legend
          // -----------------------------------------------------------------

          legend: {
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
                  (acc: number, value: unknown) =>
                    acc + Number(value),
                  0,
                );

                return data.labels.map((label, index) => {
                  const value =
                    Number(dataset.data[index]) || 0;

                  const percentage =
                    totalSum > 0
                      ? Math.round((value / totalSum) * 100)
                      : 0;

                  const backgroundColor =
                    dataset.backgroundColor;

                  const fill = Array.isArray(backgroundColor)
                    ? backgroundColor[index]
                    : backgroundColor;

                  return {
                    text: `${label} (${percentage}%)`,

                    fillStyle: fill as string,

                    strokeStyle: fill as string,

                    lineWidth: 0,

                    pointStyle: 'circle',

                    hidden:
                      !chart.getDataVisibility(index),

                    index,
                  };
                });
              },
            },
          },

          // -----------------------------------------------------------------
          // Tooltip
          // -----------------------------------------------------------------

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
              label: (context) => {
                const value = Number(context.raw);

                const dataset = this.datasets()[0];

                const sum = dataset?.data
                  ? dataset.data.reduce(
                      (acc: number, item: unknown) =>
                        acc + Number(item),
                      0,
                    )
                  : 0;

                const percentage =
                  sum > 0
                    ? Math.round((value / sum) * 100)
                    : 0;

                return `  ${context.label}: ${percentage}% (₹${value.toFixed(2)})`;
              },
            },
          },
        },
      },

      // ---------------------------------------------------------------------
      // Custom center text plugin
      // ---------------------------------------------------------------------

      plugins: [
        {
          id: 'centerDoughnutText',

          afterDraw: (chart: any) => {
            const { top, bottom, left, right } =
              chart.chartArea;

            const canvasCtx = chart.ctx;

            canvasCtx.save();

            const centerX = (left + right) / 2;
            const centerY = (top + bottom) / 2;

            canvasCtx.textAlign = 'center';
            canvasCtx.textBaseline = 'middle';

            // Default center text
            let labelText = 'TOTAL SPENT';

            const dataset =
              chart.config.data.datasets[0];

            const totalSum = dataset?.data
              ? dataset.data.reduce(
                  (acc: number, value: unknown) =>
                    acc + Number(value),
                  0,
                )
              : totalVal;

            let amountText =
              '₹' +
              Number(totalSum).toLocaleString('en-IN', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              });

            // ---------------------------------------------------------------
            // Show selected category when hovering
            // ---------------------------------------------------------------

            const activeElements =
              chart.getActiveElements();

            if (
              activeElements &&
              activeElements.length > 0
            ) {
              const activeIndex =
                activeElements[0].index;

              const categoryLabel =
                chart.data.labels?.[activeIndex] as
                  | string
                  | undefined;

              const categoryValue =
                Number(
                  dataset?.data?.[activeIndex],
                ) || 0;

              if (categoryLabel) {
                labelText =
                  categoryLabel.toUpperCase();

                amountText =
                  '₹' +
                  categoryValue.toLocaleString(
                    'en-IN',
                    {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    },
                  );
              }
            }

            // ---------------------------------------------------------------
            // Center label
            // ---------------------------------------------------------------

            canvasCtx.font =
              "700 10.5px 'Roboto', sans-serif";

            canvasCtx.fillStyle = '#64748B';

            canvasCtx.fillText(
              labelText.length > 18
                ? labelText.slice(0, 16) + '...'
                : labelText,
              centerX,
              centerY - 10,
            );

            // ---------------------------------------------------------------
            // Center amount
            // ---------------------------------------------------------------

            canvasCtx.font =
              "800 17px 'Roboto', sans-serif";

            canvasCtx.fillStyle = '#0F172A';

            canvasCtx.fillText(
              amountText,
              centerX,
              centerY + 10,
            );

            canvasCtx.restore();
          },
        },
      ],
    };

    this.chart = new Chart(ctx, config);
  }

  // ---------------------------------------------------------------------------
  // Destroy chart
  // ---------------------------------------------------------------------------

  ngOnDestroy(): void {
    this.chart?.destroy();
    this.chart = null;
  }

  // ---------------------------------------------------------------------------
  // Retry handler
  // ---------------------------------------------------------------------------

  onRetry(): void {
    this.retry.emit();
  }

  // ---------------------------------------------------------------------------
  // External legend color support
  // ---------------------------------------------------------------------------

  legendColor(index: number): string {
    const backgroundColor =
      this.datasets()?.[0]?.backgroundColor;

    if (
      Array.isArray(backgroundColor) &&
      typeof backgroundColor[index] === 'string'
    ) {
      return backgroundColor[index] as string;
    }

    return '#94a3b8';
  }
}