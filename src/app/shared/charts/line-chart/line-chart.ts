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
  readonly title = input<string>('Spending Trend');
  readonly subtitle = input<string>('Trajectory comparing current and previous periods');
  readonly badge = input<string>('');
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
        this.chart.data.datasets = this.applyEnhancedStyling(datasets);
        this.chart.update();
      }
    });
  }

  private applyEnhancedStyling(datasets: ChartConfiguration<'line'>['data']['datasets']): ChartConfiguration<'line'>['data']['datasets'] {
    if (!this.chartCanvas?.nativeElement) return datasets;
    const ctx = this.chartCanvas.nativeElement.getContext('2d');

    return datasets.map((ds, index) => {
      if (ctx && (index === 0 || ds.fill)) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 240);
        gradient.addColorStop(0, 'rgba(37, 99, 235, 0.22)');
        gradient.addColorStop(0.65, 'rgba(37, 99, 235, 0.05)');
        gradient.addColorStop(1, 'rgba(37, 99, 235, 0.0)');

        return {
          ...ds,
          backgroundColor: gradient,
          borderColor: ds.borderColor || '#2563EB',
          borderWidth: 2.5,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#2563EB',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointHoverBorderWidth: 3,
        };
      }
      return {
        ...ds,
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 3.5,
        pointHoverRadius: 5.5,
      };
    });
  }

  ngAfterViewInit(): void {
    if (this.chartCanvas?.nativeElement) {
      const ctx = this.chartCanvas.nativeElement.getContext('2d');
      if (ctx) {
        const enhancedDatasets = this.applyEnhancedStyling(this.datasets());

        const config: ChartConfiguration<'line'> = {
          type: 'line',
          data: {
            labels: this.labels(),
            datasets: enhancedDatasets,
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
              padding: {
                top: 24,
                right: 12,
                bottom: 6,
                left: 6,
              },
            },
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
                  boxWidth: 8,
                  boxHeight: 8,
                  padding: 16,
                  font: {
                    size: 11.5,
                    family: "'Roboto', sans-serif",
                    weight: 500,
                  },
                  color: '#475569',
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
                caretPadding: 6,
                boxPadding: 4,
                usePointStyle: true,
                titleFont: { size: 12, weight: 'bold', family: "'Roboto', sans-serif" },
                bodyFont: { size: 11.5, weight: 'normal', family: "'Roboto', sans-serif" },
                callbacks: {
                  label: (context: any) => {
                    const label = context.dataset.label || '';
                    const val = Number(context.raw);
                    return `  ${label}: ₹${val.toFixed(2)}`;
                  },
                },
              },
            },
            scales: {
              y: {
                beginAtZero: false,
                grace: '20%',
                grid: {
                  color: '#f1f5f9',
                },
                ticks: {
                  font: { size: 11, family: "'Roboto', sans-serif" },
                  color: '#94a3b8',
                  padding: 8,
                  callback: (value: any) => {
                    const num = Number(value);
                    return num >= 1000 ? '₹' + (num / 1000) + 'K' : '₹' + num;
                  },
                },
                border: {
                  dash: [4, 4],
                  display: false,
                },
              },
              x: {
                grid: {
                  display: false,
                },
                ticks: {
                  font: { size: 11, family: "'Roboto', sans-serif" },
                  color: '#94a3b8',
                  padding: 8,
                },
                border: {
                  display: false,
                },
              },
            },
            elements: {
              line: {
                tension: 0.4,
                borderWidth: 2.5,
              },
              point: {
                radius: 4,
                hoverRadius: 6,
              },
            },
          },
        };
        this.chart = new Chart(ctx, config);
      }
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
    this.chart = null;
  }
}


