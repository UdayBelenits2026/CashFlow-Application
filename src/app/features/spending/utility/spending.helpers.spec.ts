import { formatPaymentMethod, toExpenseCsv, exportExpensesToCsv } from './spending.helpers';
import { Expense } from '../models/expense.model';

describe('spending.helpers', () => {
  describe('formatPaymentMethod', () => {
    it('should map known payment codes to labels', () => {
      expect(formatPaymentMethod('DEBIT_CARD')).toBe('Debit Card');
      expect(formatPaymentMethod('CREDIT_CARD')).toBe('Credit Card');
      expect(formatPaymentMethod('BANK_TRANSFER')).toBe('Bank Transfer');
      expect(formatPaymentMethod('CASH')).toBe('Cash');
    });

    it('should fall back to Card when missing', () => {
      expect(formatPaymentMethod(undefined)).toBe('Card');
      expect(formatPaymentMethod('UNKNOWN')).toBe('UNKNOWN');
    });
  });

  describe('toExpenseCsv', () => {
    const expense: Expense = {
      id: '1',
      date: '2026-01-01',
      merchantName: 'Shop "A"',
      categoryName: 'Food',
      accountName: 'Checking',
      paymentMethod: 'CASH',
      amount: 42,
      status: 'CLEARED',
      notes: 'lunch'
    } as Expense;

    it('should produce headers and rows', () => {
      const { headers, rows } = toExpenseCsv([expense]);
      expect(headers).toContain('Merchant');
      expect(rows.length).toBe(1);
      expect(rows[0]).toContain(42);
    });

    it('should escape quotes in merchant names', () => {
      const { rows } = toExpenseCsv([expense]);
      expect(rows[0][2]).toBe('"Shop ""A"""');
    });
  });

  describe('exportExpensesToCsv', () => {
    it('should trigger a CSV download for non-empty data', () => {
      const createUrl = spyOn(URL, 'createObjectURL').and.returnValue('blob:mock');
      spyOn(URL, 'revokeObjectURL');
      const anchor = document.createElement('a');
      spyOn(anchor, 'click');
      spyOn(document, 'createElement').and.returnValue(anchor);

      exportExpensesToCsv([{ id: '1', date: '2026-01-01', amount: 5 } as Expense], 'my-expenses');

      expect(createUrl).toHaveBeenCalledTimes(1);
      expect(anchor.getAttribute('download')).toBe('my-expenses.csv');
    });
  });
});
