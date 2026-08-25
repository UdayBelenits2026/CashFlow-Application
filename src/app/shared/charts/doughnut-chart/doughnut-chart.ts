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
  readonly subtitle = input<string>('Distribution across expense categories');
  readonly total = input<number>(2650);
  readonly datasets = input<ChartConfiguration<'doughnut'>['data']['datasets']>([]);
  readonly labels = input<string[]>([]);
  // Opt-in flags: hide the built-in legend/header or drop the card chrome for compact embedding.
  readonly showLegend = input<boolean>(true);
  readonly showTitle = input<boolean>(true);
  readonly embedded = input<boolean>(false);

  private chart: Chart<'doughnut'> | null = null;

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

  private applyEnhancedDatasets(datasets: ChartConfiguration<'doughnut'>['data']['datasets']): ChartConfiguration<'doughnut'>['data']['datasets'] {
    return datasets.map((ds) => ({
      ...ds,
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
                    if (data.labels?.length && data.datasets.length) {
                      const dataset = data.datasets[0];
                      const totalSum = dataset.data.reduce((acc: number, val: any) => acc + Number(val), 0);
                      return data.labels.map((label, i) => {
                        const val = Number(dataset.data[i]) || 0;
                        const pct = totalSum > 0 ? Math.round((val / totalSum) * 100) : 0;
                        const fill = Array.isArray(dataset.backgroundColor) ? dataset.backgroundColor[i] : dataset.backgroundColor;
                        return {
                          text: `${label} (${pct}%)`,
                          fillStyle: fill as string,
                          strokeStyle: fill as string,
                          lineWidth: 0,
                          pointStyle: 'circle',
                          hidden: !chart.getDataVisibility(i),
                          index: i,
                        };
                      });
                    }
                    return [];
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
                titleFont: { size: 12, weight: 'bold', family: "'Roboto', sans-serif" },
                bodyFont: { size: 11.5, family: "'Roboto', sans-serif" },
                callbacks: {
                  label: (context: any) => {
                    const value = context.raw as number;
                    const ds = this.datasets()[0];
                    const sum = ds?.data ? ds.data.reduce((a: number, b: any) => Number(a) + Number(b), 0) : 0;
                    const percentage = sum > 0 ? Math.round((value / sum) * 100) : 0;
                    return `  ${context.label}: ${percentage}% (₹${Number(value).toFixed(2)})`;
                  },
                },
              },
            },
          },
          plugins: [
            {
              id: 'centerDoughnutText',
              afterDraw: (chart: any) => {
                if (this.embedded()) {
                  return;
                }
                const { top, bottom, left, right } = chart.chartArea;
                const canvasCtx = chart.ctx;
                canvasCtx.save();
                const centerX = (left + right) / 2;
                const centerY = (top + bottom) / 2;
                canvasCtx.textAlign = 'center';
                canvasCtx.textBaseline = 'middle';

                // Check for hovered slice
                const activeElements = chart.getActiveElements();
                let labelText = 'TOTAL SPENT';
                const ds = chart.config.data.datasets[0];
                const totalSum = ds?.data ? ds.data.reduce((a: number, b: any) => Number(a) + Number(b), 0) : totalVal;
                let amountText = '₹' + Number(totalSum).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

                if (activeElements && activeElements.length > 0) {
                  const activeIndex = activeElements[0].index;
                  const catLabel = chart.data.labels[activeIndex] as string;
                  const catVal = Number(ds.data[activeIndex]);
                  if (catLabel) {
                    labelText = catLabel.toUpperCase();
                    amountText = '₹' + Number(catVal).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                  }
                }

                // 'TOTAL SPENT' / Category Label
                canvasCtx.font = "700 10.5px 'Roboto', sans-serif";
                canvasCtx.fillStyle = '#64748B';
                canvasCtx.fillText(labelText.length > 18 ? labelText.slice(0, 16) + '...' : labelText, centerX, centerY - 10);

                // Amount label
                canvasCtx.font = "800 17px 'Roboto', sans-serif";
                canvasCtx.fillStyle = '#0F172A';
                canvasCtx.fillText(amountText, centerX, centerY + 10);
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


