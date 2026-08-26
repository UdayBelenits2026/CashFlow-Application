import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  OnDestroy,
  output,
  signal,
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
  // Opt-in flags: hide the built-in legend/header or drop the card chrome for compact embedding.
  readonly showLegend = input<boolean>(true);
  readonly showTitle = input<boolean>(true);
  readonly embedded = input<boolean>(false);
  // Caps the doughnut plot so the ring renders smaller inside larger tiles.
  readonly compact = input<boolean>(false);

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

  private resizeObserver: ResizeObserver | null = null;

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

  // Percentages + colors for the HTML legend rendered outside the canvas.
  readonly legendItems = computed(() => {
    const labels = this.labels() ?? [];
    const dataset = this.datasets()?.[0];
    const data = dataset?.data ?? [];
    const background = dataset?.backgroundColor;
    const hidden = this.hiddenIndices();

    const originalTotal = data.reduce(
      (acc: number, value: unknown) => acc + Number(value),
      0,
    );
    // Visible total drives active percentages so remaining segments sum to 100%.
    const visibleTotal = data.reduce(
      (acc: number, value: unknown, index: number) =>
        acc + (hidden.has(index) ? 0 : Number(value)),
      0,
    );

    return labels.map((label, index) => {
      const value = Number(data[index]) || 0;
      const isHidden = hidden.has(index);
      const base = isHidden ? originalTotal : visibleTotal;
      const percentage =
        base > 0 ? Math.round((value / base) * 100) : 0;
      const color = Array.isArray(background)
        ? (background[index] as string)
        : (background as string);

      return {
        index,
        label: String(label),
        value,
        percentage,
        color: color ?? '#94a3b8',
        hidden: isHidden,
      };
    });
  });

  // Toggles side-by-side vs stacked layout based on available width.
  readonly isVertical = signal(false);

  // Indices the user toggled off; kept separate so the source data is untouched.
  readonly hiddenIndices = signal<ReadonlySet<number>>(new Set<number>());

  // ---------------------------------------------------------------------------
  // Constructor
  // ---------------------------------------------------------------------------

  constructor(private readonly host: ElementRef<HTMLElement>) {
    effect(() => {
      const labels = this.labels();
      const datasets = this.datasets();

      if (this.chart) {
        this.chart.data.labels = labels;
        this.chart.data.datasets = this.applyEnhancedDatasets(datasets);
        // Fresh data starts with every category visible again.
        this.hiddenIndices.set(new Set<number>());
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

          // Legend is rendered as HTML outside the canvas (see template) so it
          // never overlaps the doughnut and can handle long labels gracefully.
          legend: {
            display: false,
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

                const chart = context.chart;
                const data =
                  context.dataset?.data ?? [];

                // Percentage reflects only the currently visible segments.
                const sum = data.reduce(
                  (acc: number, item: unknown, index: number) =>
                    acc +
                    (chart.getDataVisibility(index)
                      ? Number(item)
                      : 0),
                  0,
                );

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

            // Scale the center text to the doughnut's inner radius so it stays
            // legible from tiny widgets up to full-width dashboards.
            const centerMeta = chart.getDatasetMeta(0);
            const centerArc: any = centerMeta?.data?.[0];
            const innerRadius: number =
              centerArc?.innerRadius ??
              ((bottom - top) / 2) * 0.6;

            const labelFontSize = Math.max(
              7,
              Math.min(13, innerRadius * 0.2),
            );
            const amountFontSize = Math.max(
              11,
              Math.min(22, innerRadius * 0.34),
            );
            const textGap = amountFontSize * 0.62;

            // Default center text
            let labelText = 'TOTAL SPENT';

            const dataset =
              chart.config.data.datasets[0];

            // Center total counts only the segments still visible on the ring.
            const totalSum = dataset?.data
              ? dataset.data.reduce(
                  (acc: number, value: unknown, index: number) =>
                    acc +
                    (chart.getDataVisibility(index)
                      ? Number(value)
                      : 0),
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

            canvasCtx.font = `700 ${labelFontSize}px 'Roboto', sans-serif`;

            canvasCtx.fillStyle = '#64748B';

            canvasCtx.fillText(
              labelText.length > 18
                ? labelText.slice(0, 16) + '...'
                : labelText,
              centerX,
              centerY - textGap,
            );

            // ---------------------------------------------------------------
            // Center amount
            // ---------------------------------------------------------------

            canvasCtx.font = `800 ${amountFontSize}px 'Roboto', sans-serif`;

            canvasCtx.fillStyle = '#0F172A';

            canvasCtx.fillText(
              amountText,
              centerX,
              centerY + textGap,
            );

            canvasCtx.restore();
          },
        },
      ],
    };

    this.chart = new Chart(ctx, config);

    this.setupResponsiveLayout();
  }

  // ---------------------------------------------------------------------------
  // Responsive layout
  // ---------------------------------------------------------------------------

  private setupResponsiveLayout(): void {
    this.updateResponsiveLayout();

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    this.resizeObserver = new ResizeObserver(() => {
      this.updateResponsiveLayout();
    });

    this.resizeObserver.observe(this.host.nativeElement);
  }

  private updateResponsiveLayout(): void {
    // Stack the legend beneath the doughnut when the container is too narrow
    // to place them side by side without crowding.
    const width = this.host.nativeElement.clientWidth;
    this.isVertical.set(width < 360);
    this.chart?.resize();
  }

  // ---------------------------------------------------------------------------
  // Destroy chart
  // ---------------------------------------------------------------------------

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
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
  // Interactive legend
  // ---------------------------------------------------------------------------

  // Show/hide a category's segment without mutating the source data.
  toggleCategory(index: number): void {
    if (!this.chart) {
      return;
    }

    this.chart.toggleDataVisibility(index);
    this.chart.update();

    const next = new Set(this.hiddenIndices());

    if (this.chart.getDataVisibility(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }

    this.hiddenIndices.set(next);
  }
}