import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ApiServices } from './api-services';
import { UserContextService } from '../../../core/services/user-context.service';
import { environment } from '../../../../environments/environment';
import {
  ApiResponse,
  CreateExpenseTransactionRequest,
  CreateIncomeTransactionRequest,
  CreateTransactionResponse,
  DeleteTransactionData,
  EditTransactionData,
  PagedResult,
  TransactionDetail,
  TransactionListItem,
  UpdateTransactionRequest
} from '../models/transaction-api.model';

// Contract tests for the real backend endpoints (HttpTestingController; backend is offline).
describe('ApiServices - transactions backend contract', () => {
  let service: ApiServices;
  let httpMock: HttpTestingController;
  const base = environment.transactionsApiBaseUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApiServices,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UserContextService, useValue: { getUserId: () => 1001 } }
      ]
    });
    service = TestBed.inject(ApiServices);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('Create Expense: POST exact payload, no userId param, no incomeSourceId', () => {
    const request: CreateExpenseTransactionRequest = {
      accountId: 1, transactionType: 'EXPENSE', transactionDate: '08/26/2026', amount: 200.01,
      currency: 'INR', merchantId: 1002, categoryId: 1003, paymentMethod: 'UPI', description: 'FOOD', notes: 'FOOD'
    };
    let result: CreateTransactionResponse | undefined;
    service.createTransaction(request).subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${base}/transactions`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    expect((req.request.body as Record<string, unknown>)['incomeSourceId']).toBeUndefined();
    expect(req.request.params.keys().length).toBe(0);

    const response: ApiResponse<CreateTransactionResponse> = {
      success: true, message: 'Transaction created successfully',
      data: { transactionId: 1025, transactionType: 'EXPENSE', amount: 200.01, transactionDate: '2026-08-26', category: 'Groceries', status: 'POSTED' },
      correlationId: 'CF-6f87c7d1'
    };
    req.flush(response);
    expect(result).toEqual(response.data);
  });

  it('Create Income: POST exact payload, no merchantId/paymentMethod', () => {
    const request: CreateIncomeTransactionRequest = {
      accountId: 1, transactionType: 'INCOME', transactionDate: '08/26/2026', amount: 75000,
      currency: 'INR', incomeSourceId: 1001, categoryId: 1001, description: 'AUGUST SALARY', notes: 'MONTHLY SALARY'
    };
    let result: CreateTransactionResponse | undefined;
    service.createTransaction(request).subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${base}/transactions`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    expect((req.request.body as Record<string, unknown>)['merchantId']).toBeUndefined();
    expect((req.request.body as Record<string, unknown>)['paymentMethod']).toBeUndefined();

    req.flush({ success: true, message: 'ok', data: { transactionId: 1025, transactionType: 'INCOME', amount: 75000, transactionDate: '2026-08-26', category: 'Salary', status: 'POSTED' }, correlationId: 'CF-x' } as ApiResponse<CreateTransactionResponse>);
    expect(result?.transactionId).toBe(1025);
  });

  it('Get list: GET with userId/accountId/page/size/sort and maps content', () => {
    let result: PagedResult<TransactionListItem> | undefined;
    service.getTransactions({ accountId: 1, page: 0, size: 20, sort: 'transactiondate,desc' }).subscribe((r) => (result = r));

    const req = httpMock.expectOne((r) => r.method === 'GET' && r.url === `${base}/transactions`);
    expect(req.request.params.get('userId')).toBe('1001');
    expect(req.request.params.get('accountId')).toBe('1');
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('20');
    expect(req.request.params.get('sort')).toBe('transactiondate,desc');

    const response: ApiResponse<PagedResult<TransactionListItem>> = {
      success: true, message: 'Transactions retrieved successfully',
      data: {
        content: [{ transactionId: 1, date: '2026-08-26', description: 'Monthly grocery shopping at DMart', type: 'EXPENSE', amount: 2450.75, currency: 'INR', category: 'Groceries', merchant: 'DMart', accountName: 'Account #2001', status: 'POSTED' }],
        page: 0, size: 20, totalElements: 2, totalPages: 1
      },
      correlationId: 'CF-25fb94a7'
    };
    req.flush(response);
    expect(result?.content.length).toBe(1);
    expect(result?.totalElements).toBe(2);
    expect(result?.content[0].transactionId).toBe(1);
  });

  it('Get single: GET /{id}?userId and maps detail', () => {
    let result: TransactionDetail | undefined;
    service.getTransactionById(1).subscribe((r) => (result = r));

    const req = httpMock.expectOne((r) => r.method === 'GET' && r.url === `${base}/transactions/1`);
    expect(req.request.params.get('userId')).toBe('1001');

    const response: ApiResponse<TransactionDetail> = {
      success: true, message: 'ok',
      data: { transactionId: 1, accountId: 2001, transactionType: 'EXPENSE', transactionDate: '2026-08-26', postingDate: '2026-08-20', amount: 2450.75, currency: 'INR', merchantId: 1, categoryId: 1, paymentMethod: 'UPI', description: 'Monthly grocery shopping at DMart', notes: 'Monthly purchase', tags: [{ tagId: 1, tagName: 'Essential' }], status: 'POSTED' },
      correlationId: 'CF-b9c8d1b9'
    };
    req.flush(response);
    expect(result?.categoryId).toBe(1);
    expect(result?.tags[0].tagName).toBe('Essential');
  });

  it('Get edit: GET /{id}/edit?userId and maps accountEditable/readOnlyFieldNames', () => {
    let result: EditTransactionData | undefined;
    service.getTransactionForEdit(1).subscribe((r) => (result = r));

    const req = httpMock.expectOne((r) => r.method === 'GET' && r.url === `${base}/transactions/1/edit`);
    expect(req.request.params.get('userId')).toBe('1001');

    const response: ApiResponse<EditTransactionData> = {
      success: true, message: 'ok',
      data: { transactionId: 1, accountId: 2001, transactionDate: '2026-08-26', postingDate: '2026-08-20', amount: 2450.75, currency: 'INR', merchantId: 1, merchantName: 'DMart', categoryId: 1, description: 'Monthly grocery shopping at DMart', paymentMethod: 'UPI', referenceNumber: 'TXN123', notes: 'Monthly purchase', attachmentUrl: '', tags: [{ tagId: 1, tagName: 'Essential' }], bankSynced: false, readOnlyFieldNames: [], accountEditable: true },
      correlationId: 'CF-3441617e'
    };
    req.flush(response);
    expect(result?.accountEditable).toBe(true);
    expect(result?.readOnlyFieldNames).toEqual([]);
    expect(result?.merchantName).toBe('DMart');
  });

  it('Update: PUT /{id}/edit?userId with exact PUT body (not the CREATE payload)', () => {
    const request: UpdateTransactionRequest = {
      transactionDate: '2026-08-26', accountId: 2001, description: 'Updated', categoryId: 1,
      paymentMethod: 'UPI', referenceNumber: 'TXN123', notes: 'Monthly purchase', attachmentUrl: '', tagIds: [1], updatedBy: 1001
    };
    let result: CreateTransactionResponse | undefined;
    service.updateTransaction(900, request).subscribe((r) => (result = r));

    const req = httpMock.expectOne((r) => r.method === 'PUT' && r.url === `${base}/transactions/900/edit`);
    expect(req.request.params.get('userId')).toBe('1001');
    expect(req.request.body).toEqual(request);
    expect((req.request.body as Record<string, unknown>)['transactionType']).toBeUndefined();
    expect((req.request.body as Record<string, unknown>)['amount']).toBeUndefined();
    expect((req.request.body as Record<string, unknown>)['merchantId']).toBeUndefined();

    req.flush({ success: true, message: 'ok', data: { transactionId: 900, transactionType: 'EXPENSE', amount: 0, transactionDate: '2026-08-26', category: 'Groceries', status: 'POSTED' }, correlationId: 'CF-x' } as ApiResponse<CreateTransactionResponse>);
    expect(result?.transactionId).toBe(900);
  });

  it('Delete: DELETE /{id} with NO userId param; maps CANCELLED status', () => {
    let result: DeleteTransactionData | undefined;
    service.deleteTransaction(4).subscribe((r) => (result = r));

    const req = httpMock.expectOne((r) => r.method === 'DELETE' && r.url === `${base}/transactions/4`);
    expect(req.request.params.keys().length).toBe(0);

    const response: ApiResponse<DeleteTransactionData> = {
      success: true, message: 'Transaction deleted successfully.',
      data: { transactionId: 4, status: 'CANCELLED' }, correlationId: 'CF-6f87c7d1'
    };
    req.flush(response);
    expect(result?.status).toBe('CANCELLED');
    expect(result?.transactionId).toBe(4);
  });
});
