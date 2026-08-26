import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  ChartDataset,
  ChartOptions,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  Title,
} from 'chart.js';

export type BarChartDataset = (ChartDataset<'bar'> | ChartDataset<'line'>) & {
  type?: 'bar' | 'line';
};

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
);

@Component({
  selector: 'app-cf-bar-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bar-chart.html',
  styleUrl: './bar-chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarChart implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  readonly title = input<string>('Chart');
  readonly labels = input<string[]>([]);
  readonly datasets = input<BarChartDataset[]>([]);
  readonly stacked = input<boolean>(false);
  readonly horizontal = input<boolean>(false);
  readonly currency = input<boolean>(true);
  readonly emptyState = input<boolean>(false);

  private chart: Chart<'bar'> | null = null;

  readonly isEmpty = computed(() => {
    if (this.emptyState()) {
      return true;
    }
    const ds = this.datasets();
    const lbls = this.labels();
    return (
      !ds ||
      ds.length === 0 ||
      !lbls ||
      lbls.length === 0 ||
      ds.every((d) => !d.data || d.data.length === 0 || d.data.every((v) => v === 0))
    );
  });

  constructor() {
    effect(() => {
      this.labels();
      this.datasets();
      this.stacked();
      this.horizontal();
      this.currency();
      if (this.chart) {
        this.updateChart();
      }
    });
  }

  ngAfterViewInit(): void {
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      this.chart &&
      (changes['labels'] || changes['datasets'] || changes['stacked'] || changes['horizontal'])
    ) {
      this.updateChart();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private renderChart(): void {
    const canvas = this.chartCanvas?.nativeElement;
    const context = canvas?.getContext('2d');
    if (!context) {
      return;
    }

    this.chart = new Chart(context, {
      type: 'bar',
      data: {
        labels: this.labels(),
        datasets: this.datasets() as ChartDataset<'bar'>[],
      },
      options: this.buildOptions(),
    });
  }

  private updateChart(): void {
    if (!this.chart) {
      return;
    }

    this.chart.data.labels = this.labels();
    this.chart.data.datasets = this.datasets() as ChartDataset<'bar'>[];
    this.chart.options = this.buildOptions();
    this.chart.update();
  }

  private buildOptions(): ChartOptions<'bar'> {
    const axis = this.horizontal() ? 'y' : 'x';
    const valueAxis = this.horizontal() ? 'x' : 'y';

    return {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: axis,
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: {
          stacked: this.stacked(),
          grid: { display: !this.horizontal(), color: '#edf1f7' },
          ticks: { color: '#64748b', font: { size: 11 } },
        },
        y: {
          stacked: this.stacked(),
          beginAtZero: true,
          grid: { display: this.horizontal(), color: '#edf1f7' },
          ticks: {
            color: '#64748b',
            font: { size: 11 },
            callback: (value) => this.formatValue(value),
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: { usePointStyle: true, padding: 16, color: '#17264b', font: { size: 11 } },
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: (context) => ` ${context.dataset.label ?? ''}: ${this.formatValue(context.raw)}`,
          },
        },
      },
      elements: {
        bar: { borderRadius: 1, borderSkipped: false },
        line: { tension: 0.35, borderWidth: 2 },
        point: { radius: 3, hoverRadius: 5 },
      },
    };
  }

  private formatValue(value: unknown): string {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
      return String(value);
    }

    return this.currency()
      ? `₹${numericValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
      : numericValue.toLocaleString('en-IN');
  }
}
