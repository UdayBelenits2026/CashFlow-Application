import {
  mapFormToUpdateRequest,
  mapTransactionFormToRequest,
  toApiDate
} from './transaction.mapper';
import {
  CreateExpenseTransactionRequest,
  CreateIncomeTransactionRequest
} from '../models/transaction-api.model';
import { TransactionFormModel, UpdateFormModel } from '../models/models.transaction';

describe('transaction.mapper', () => {
  it('toApiDate converts yyyy-MM-dd to MM/DD/YYYY', () => {
    expect(toApiDate('2026-08-26')).toBe('08/26/2026');
  });

  it('maps an Expense form to the exact EXPENSE DTO', () => {
    const model: TransactionFormModel = {
      type: 'Expense', accountId: 1, categoryId: 1003, merchantId: 1002,
      incomeSourceId: null, paymentMethod: 'UPI', date: '2026-08-26',
      amount: 200.01, description: 'FOOD', notes: 'FOOD'
    };
    expect(mapTransactionFormToRequest(model)).toEqual({
      accountId: 1, transactionType: 'EXPENSE', transactionDate: '08/26/2026',
      amount: 200.01, currency: 'INR', merchantId: 1002, categoryId: 1003,
      paymentMethod: 'UPI', description: 'FOOD', notes: 'FOOD'
    } as CreateExpenseTransactionRequest);
  });

  it('maps an Income form to the exact INCOME DTO (no merchantId/paymentMethod)', () => {
    const model: TransactionFormModel = {
      type: 'Income', accountId: 1, categoryId: 1001, merchantId: null,
      incomeSourceId: 1001, paymentMethod: '', date: '2026-08-26',
      amount: 75000, description: 'AUGUST SALARY', notes: 'MONTHLY SALARY'
    };
    const dto = mapTransactionFormToRequest(model);
    expect(dto).toEqual({
      accountId: 1, transactionType: 'INCOME', transactionDate: '08/26/2026',
      amount: 75000, currency: 'INR', incomeSourceId: 1001, categoryId: 1001,
      description: 'AUGUST SALARY', notes: 'MONTHLY SALARY'
    } as CreateIncomeTransactionRequest);
    expect((dto as unknown as Record<string, unknown>)['merchantId']).toBeUndefined();
    expect((dto as unknown as Record<string, unknown>)['paymentMethod']).toBeUndefined();
  });

  it('converts string ids/amount to numbers', () => {
    const model = {
      type: 'Expense', accountId: '1', categoryId: '1003', merchantId: '1002',
      incomeSourceId: null, paymentMethod: 'UPI', date: '2026-08-26',
      amount: '200.01', description: 'FOOD'
    } as unknown as TransactionFormModel;
    const dto = mapTransactionFormToRequest(model) as CreateExpenseTransactionRequest;
    expect(dto.accountId).toBe(1);
    expect(dto.merchantId).toBe(1002);
    expect(dto.categoryId).toBe(1003);
    expect(dto.amount).toBe(200.01);
    expect(typeof dto.accountId).toBe('number');
  });

  it('omits notes when empty', () => {
    const model: TransactionFormModel = {
      type: 'Expense', accountId: 1, categoryId: 1003, merchantId: 1002,
      incomeSourceId: null, paymentMethod: 'UPI', date: '2026-08-26',
      amount: 200.01, description: 'FOOD'
    };
    expect('notes' in mapTransactionFormToRequest(model)).toBe(false);
  });

  it('maps the edit form to the PUT contract (yyyy-MM-dd date, create-only fields excluded)', () => {
    const model: UpdateFormModel = {
      date: '2026-08-26', accountId: 2001, description: 'Updated', categoryId: 1,
      paymentMethod: 'UPI', referenceNumber: 'TXN123', notes: 'Monthly purchase',
      attachmentUrl: '', tagIds: [1, 2]
    };
    const dto = mapFormToUpdateRequest(model, 1001);
    expect(dto).toEqual({
      transactionDate: '2026-08-26', accountId: 2001, description: 'Updated', categoryId: 1,
      paymentMethod: 'UPI', referenceNumber: 'TXN123', notes: 'Monthly purchase', tagIds: [1, 2], updatedBy: 1001
    });
    const body = dto as unknown as Record<string, unknown>;
    expect(body['amount']).toBeUndefined();
    expect(body['merchantId']).toBeUndefined();
    expect(body['transactionType']).toBeUndefined();
    expect('attachmentUrl' in dto).toBe(false);
  });

  it('keeps the update date as yyyy-MM-dd (not MM/DD/YYYY)', () => {
    const model: UpdateFormModel = {
      date: '2026-08-26', accountId: 1, description: 'x', categoryId: 1,
      paymentMethod: 'Cash', tagIds: []
    };
    expect(mapFormToUpdateRequest(model, 1).transactionDate).toBe('2026-08-26');
  });
});