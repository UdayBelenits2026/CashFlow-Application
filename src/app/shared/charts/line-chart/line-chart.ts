import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CategoryScale,
  Chart,
  ChartConfiguration,
  Filler,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  Title,
} from 'chart.js';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler,
);

@Component({
  selector: 'app-cf-line-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './line-chart.html',
  styleUrl: './line-chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineChart implements AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  readonly title = input<string>('Cash Flow Trend');
  readonly labels = input<string[]>([]);
  readonly datasets =
    input<ChartConfiguration<'line'>['data']['datasets']>([]);
  readonly emptyState = input<boolean>(false);

  private chart: Chart<'line'> | null = null;

  constructor() {
    effect(() => {
      const labels = this.labels();
      const datasets = this.datasets();

      if (this.chart) {
        this.chart.data.labels = labels;
        this.chart.data.datasets = datasets;
        this.chart.update();
      }
    });
  }

  ngAfterViewInit(): void {
    if (!this.chartCanvas?.nativeElement) {
      return;
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');

    if (!ctx) {
      return;
    }

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: this.labels(),
        datasets: this.datasets(),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              boxWidth: 6,
              boxHeight: 6,
              padding: 14,
              font: {
                size: 11,
                family:
                  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                weight: 500,
              },
              color: '#475569',
            },
          },
          tooltip: {
            backgroundColor: '#0f172a',
            padding: 10,
            cornerRadius: 8,
            titleFont: {
              size: 11.5,
              weight: 'bold',
            },
            bodyFont: {
              size: 12,
              weight: 'bold',
            },
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            grid: {
              color: '#f1f5f9',
            },
            ticks: {
              font: {
                size: 10.5,
                family:
                  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              },
              color: '#64748b',
              callback: (value: string | number) => {
                const num = Number(value);

                if (num >= 1000 || num <= -1000) {
                  return `$${num / 1000}K`;
                }

                return `$${num}`;
              },
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: {
                size: 10.5,
                family:
                  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              },
              color: '#64748b',
            },
          },
        },
        elements: {
          line: {
            tension: 0.4,
            borderWidth: 2,
          },
          point: {
            radius: 3.5,
            hoverRadius: 5.5,
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