import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="module-page">
      <div class="module-header">
        <h1 class="module-title">{{ title }}</h1>
        <p class="module-subtitle">Generate exportable financial reports and statements</p>
      </div>
      <div class="module-card">
        <div class="placeholder-content">
          <i class="fa-solid fa-chart-column module-icon"></i>
          <h2>{{ title }} Module</h2>
          <p>Monthly summaries, tax reports, and downloadable PDF/CSV statements will appear here.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .module-page { padding: 1.5rem 2rem; }
    .module-header { margin-bottom: 1.5rem; }
    .module-title { font-size: 1.5rem; font-weight: 700; color: #0f172a; margin: 0; }
    .module-subtitle { font-size: 0.875rem; color: #64748b; margin-top: 0.25rem; margin-bottom: 0; }
    .module-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 3rem 2rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); }
    .placeholder-content { text-align: center; max-width: 420px; margin: 0 auto; }
    .module-icon { font-size: 2.5rem; color: #8b5cf6; margin-bottom: 1rem; }
    .placeholder-content h2 { font-size: 1.25rem; font-weight: 600; color: #1e293b; margin-bottom: 0.5rem; }
    .placeholder-content p { font-size: 0.875rem; color: #64748b; margin: 0; }
  `]
})
export class ReportsComponent {
  title = 'Reports';
}
