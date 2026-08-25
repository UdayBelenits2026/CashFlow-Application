import { Income } from '../models/income.model';
import { IncomeFrequency, IncomeSourceType } from '../models/income-source.model';
import { AccountRef } from '../models/account-ref.model';
import { INCOME_TYPE_OPTIONS, MAIN_ACCOUNT_LABEL } from './income.constants';
import { downloadCsv } from '../../../shared/utility/csv.util';

export { downloadCsv } from '../../../shared/utility/csv.util';

/** Source type → brand color, derived from the single INCOME_TYPE_OPTIONS catalog. */
const SOURCE_TYPE_COLOR_MAP: Record<string, string> = INCOME_TYPE_OPTIONS.reduce(
  (map, opt) => ({ ...map, [opt.type]: opt.color }),
  {} as Record<string, string>
);

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

/** Human-readable "next occurrence" label from a whole-day countdown (negative = overdue). */
export function getRecurringNextLabel(days: number | null): string {
  if (days === null) return '—';
  if (days === 0) return 'Due today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return '1 day overdue';
  if (days > 1) return `In ${days} days`;
  return `${Math.abs(days)} days overdue`;
}

/** Get background color for source type */
export function getSourceTypeColor(type?: IncomeSourceType): string {
  return (type && SOURCE_TYPE_COLOR_MAP[type]) || '#64748B';
}

/** Masked account label, e.g. "Chase Checking ••••1234". */
export function formatAccountLabel(acc?: AccountRef | null): string {
  return acc ? `${acc.name} ••••${acc.accountNumberLast4}` : MAIN_ACCOUNT_LABEL;
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
