import { Expense } from '../models/expense.model';
import { downloadCsv } from '../../../shared/utility/csv.util';

export { downloadCsv } from '../../../shared/utility/csv.util';

/** Human-readable label for a payment method code. */
export function formatPaymentMethod(method?: string): string {
  switch (method) {
    case 'DEBIT_CARD': return 'Debit Card';
    case 'CREDIT_CARD': return 'Credit Card';
    case 'BANK_TRANSFER': return 'Bank Transfer';
    case 'CASH': return 'Cash';
    default: return method || 'Card';
  }
}

/** Maps expenses to CSV headers + rows for export. */
export function toExpenseCsv(expenses: Expense[]): { headers: string[]; rows: (string | number)[][] } {
  const headers = ['Transaction ID', 'Date', 'Merchant', 'Category', 'Account', 'Payment Method', 'Amount (INR)', 'Status', 'Notes'];
  const rows = expenses.map((e) => [
    `"${e.id}"`,
    `"${e.date}"`,
    `"${(e.merchantName || '').replace(/"/g, '""')}"`,
    `"${(e.categoryName || '').replace(/"/g, '""')}"`,
    `"${(e.accountName || '').replace(/"/g, '""')}"`,
    `"${e.paymentMethod || 'DEBIT_CARD'}"`,
    e.amount,
    `"${e.status || 'CLEARED'}"`,
    `"${(e.notes || '').replace(/"/g, '""')}"`
  ]);
  return { headers, rows };
}

/** Exports expenses to a CSV file. filenamePrefix is suffixed with .csv. */
export function exportExpensesToCsv(expenses: Expense[], filenamePrefix: string): void {
  const { headers, rows } = toExpenseCsv(expenses);
  downloadCsv(headers, rows, `${filenamePrefix}.csv`);
}
