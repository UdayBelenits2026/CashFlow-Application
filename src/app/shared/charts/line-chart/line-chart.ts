import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
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
  readonly datasets = input<ChartConfiguration<'line'>['data']['datasets']>([]);
  readonly emptyState = input<boolean>(false);
  private chart: Chart<'line'> | null = null;

  ngAfterViewInit(): void {
    if (this.chartCanvas?.nativeElement) {
      const ctx = this.chartCanvas.nativeElement.getContext('2d');
      if (ctx) {
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
                  padding: 20,
                  font: { size: 12, family: "'Inter', sans-serif" },
                },
              },
              tooltip: {
                backgroundColor: '#1e293b',
                padding: 12,
                cornerRadius: 8,
                titleFont: { size: 12 },
                bodyFont: { size: 13, weight: 'bold' },
              },
            },
            scales: {
              y: {
                beginAtZero: false,
                grid: {
                  color: '#f1f5f9',
                },
                ticks: {
                  font: { size: 11, family: "'Inter', sans-serif" },
                  color: '#64748b',
                  callback: (value: any) => '$' + value / 1000 + 'K',
                },
              },
              x: {
                grid: {
                  display: false,
                },
                ticks: {
                  font: { size: 11, family: "'Inter', sans-serif" },
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
  }
}
