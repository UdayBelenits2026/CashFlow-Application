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
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  readonly title = input<string>('Spending by Category');
  readonly total = input<number>(2650);
  readonly datasets = input<ChartConfiguration<'doughnut'>['data']['datasets']>([]);
  readonly labels = input<string[]>([]);

  private chart: Chart<'doughnut'> | null = null;

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

    const totalVal = this.total();

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: this.labels(),
        datasets: this.datasets(),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'right',
            align: 'center',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              boxWidth: 7,
              boxHeight: 7,
              padding: 10,
              font: {
                size: 11,
                family:
                  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                weight: 500,
              },
              color: '#334155',
            },
          },
          tooltip: {
            backgroundColor: '#0f172a',
            padding: 10,
            cornerRadius: 8,
            titleFont: {
              size: 12,
              weight: 'bold',
            },
            bodyFont: {
              size: 11.5,
            },
            callbacks: {
              label: (context: any) => {
                const value = Number(context.raw);
                const ds = this.datasets()[0];

                const sum = ds?.data
                  ? ds.data.reduce(
                      (a: number, b: any) => Number(a) + Number(b),
                      0,
                    )
                  : 0;

                const percentage =
                  sum > 0 ? Math.round((value / sum) * 100) : 0;

                return ` ${context.label}: ${percentage}% ($${value.toFixed(2)})`;
              },
            },
          },
        },
      },
      plugins: [
        {
          id: 'centerDoughnutText',
          beforeDraw: (chart: any) => {
            const { top, bottom, left, right } = chart.chartArea;
            const canvasCtx = chart.ctx;

            canvasCtx.save();

            const centerX = (left + right) / 2;
            const centerY = (top + bottom) / 2;

            canvasCtx.textAlign = 'center';
            canvasCtx.textBaseline = 'middle';

            canvasCtx.font =
              "600 10.5px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
            canvasCtx.fillStyle = '#64748B';

            canvasCtx.fillText('Total', centerX, centerY - 9);

            canvasCtx.font =
              "800 14.5px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
            canvasCtx.fillStyle = '#0F172A';

            const ds = chart.config.data.datasets[0];

            const sum = ds?.data
              ? ds.data.reduce(
                  (a: number, b: any) => Number(a) + Number(b),
                  0,
                )
              : totalVal;

            const formatted =
              '$' +
              Number(sum).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              });

            canvasCtx.fillText(formatted, centerX, centerY + 9);

            canvasCtx.restore();
          },
        },
      ],
    };

    this.chart = new Chart(ctx, config);
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
    this.chart = null;
  }
}