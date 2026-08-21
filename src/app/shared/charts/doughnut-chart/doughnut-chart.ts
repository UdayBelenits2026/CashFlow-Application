import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  OnDestroy,
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
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  readonly title = input<string>('Spending by Category');
  readonly total = input<number>(2650);
  readonly datasets = input<ChartConfiguration<'doughnut'>['data']['datasets']>([]);
  readonly labels = input<string[]>([]);
  readonly isLoading = input<boolean>(false);
  readonly hasError = input<boolean>(false);
  readonly retry = output<void>();
  private chart: Chart<'doughnut'> | null = null;

  ngAfterViewInit(): void {
    if (this.chartCanvas?.nativeElement) {
      const ctx = this.chartCanvas.nativeElement.getContext('2d');
      if (ctx) {
        const config: ChartConfiguration<'doughnut'> = {
          type: 'doughnut',
          data: {
            labels: this.labels(),
            datasets: this.datasets(),
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
              legend: {
                display: false,
                labels: {
                  usePointStyle: true,
                  pointStyle: 'circle',
                  padding: 16,
                  font: { size: 12, family: "'Inter', sans-serif" },
                },
              },
              tooltip: {
                backgroundColor: '#1e293b',
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                  label: (context) => {
                    const value = context.raw as number;
                    const total = this.datasets()[0].data.reduce(
                      (a, b) => (a as number) + (b as number),
                      0,
                    ) as number;
                    const percentage = Math.round((value / total) * 100);
                    return ` ${context.label}: ${percentage}% ($${value.toFixed(2)})`;
                  },
                },
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

  onRetry(): void {
    this.retry.emit();
  }

  legendColor(index: number): string {
    const backgroundColor = this.datasets()?.[0]?.backgroundColor;
    if (Array.isArray(backgroundColor) && typeof backgroundColor[index] === 'string') {
      return backgroundColor[index] as string;
    }
    return '#94a3b8';
  }
}
