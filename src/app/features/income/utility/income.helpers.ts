import { Income } from '../models/income.model';
import { IncomeFrequency, IncomeSourceType } from '../models/income-source.model';
import { downloadCsv } from '../../../shared/utility/csv.util';

export { downloadCsv } from '../../../shared/utility/csv.util';

/** Human-readable frequency label */
export function formatFrequency(frequency?: IncomeFrequency): string {
  switch (frequency) {
    case 'WEEKLY': return 'Weekly';
    case 'BI_WEEKLY': return 'Bi-Weekly';
    case 'MONTHLY': return 'Monthly';
    case 'QUARTERLY': return 'Quarterly';
    case 'ANNUALLY': return 'Annually';
    case 'IRREGULAR': return 'Irregular / As Received';
    default: return frequency || 'One-time';
  }
}

/** Get background color for source type */
export function getSourceTypeColor(type?: IncomeSourceType): string {
  switch (type) {
    case 'Salary': return '#10B981';
    case 'Freelance': return '#3B82F6';
    case 'Business': return '#8B5CF6';
    case 'Rental': return '#6366F1';
    case 'Investment': return '#EC4899';
    case 'Dividend': return '#F59E0B';
    case 'Interest': return '#06B6D4';
    case 'Gift': return '#14B8A6';
    case 'Refund': return '#84CC16';
    default: return '#64748B';
  }
}

/** Get icon name for source type */
export function getSourceTypeIcon(type?: IncomeSourceType): string {
  switch (type) {
    case 'Salary': return 'fa-solid fa-briefcase';
    case 'Freelance': return 'fa-solid fa-laptop-code';
    case 'Business': return 'fa-solid fa-building';
    case 'Rental': return 'fa-solid fa-house-chimney';
    case 'Investment': return 'fa-solid fa-arrow-trend-up';
    case 'Dividend': return 'fa-solid fa-chart-pie';
    case 'Interest': return 'fa-solid fa-piggy-bank';
    case 'Gift': return 'fa-solid fa-gift';
    case 'Refund': return 'fa-solid fa-rotate-left';
    default: return 'fa-solid fa-wallet';
  }
}

/** Maps income items to CSV structure for download */
export function toIncomeCsv(incomes: Income[]): { headers: string[]; rows: (string | number)[][] } {
  const headers = ['Transaction ID', 'Date', 'Description', 'Source Name', 'Source Type', 'Destination Account', 'Amount (INR)', 'Taxable', 'Recurring', 'Status', 'Notes'];
  const rows = incomes.map((inc) => [
    `"${inc.id}"`,
    `"${inc.date}"`,
    `"${(inc.description || '').replace(/"/g, '""')}"`,
    `"${(inc.sourceName || '').replace(/"/g, '""')}"`,
    `"${inc.sourceType || 'Other'}"`,
    `"${(inc.accountName || '').replace(/"/g, '""')}"`,
    inc.amount,
    inc.taxable ? 'Yes' : 'No',
    inc.isRecurring ? 'Yes' : 'No',
    `"${inc.status || 'RECORDED'}"`,
    `"${(inc.notes || '').replace(/"/g, '""')}"`
  ]);
  return { headers, rows };
}

/** Exports income records to CSV */
export function exportIncomeToCsv(incomes: Income[], filenamePrefix: string = 'income-history'): void {
  const { headers, rows } = toIncomeCsv(incomes);
  downloadCsv(headers, rows, `${filenamePrefix}.csv`);
}
