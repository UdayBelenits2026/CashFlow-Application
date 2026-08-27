import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { ApiServices } from './api-services';
import { environment } from '../../../../environments/environment';
import { CreateTransactionRequest, Transaction } from '../models/models.transaction';

describe('ApiServices', () => {
  let service: ApiServices;
  let httpMock: HttpTestingController;
  const base = environment.apiBaseUrl;

  const tx: Transaction = {
    id: '1',
    date: '2026-01-01',
    description: 'Coffee',
    category: 'Food',
    accountId: 'acc-1'
  } as Transaction;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ApiServices);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getTransactions should GET the transactions collection', () => {
    let result: Transaction[] | undefined;
    service.getTransactions().subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${base}/transactions`);
    expect(req.request.method).toBe('GET');
    req.flush([tx]);
    expect(result).toEqual([tx]);
  });

  it('getTransaction should GET a single transaction by id', () => {
    service.getTransaction('1').subscribe();
    const req = httpMock.expectOne(`${base}/transactions/1`);
    expect(req.request.method).toBe('GET');
    req.flush(tx);
  });

  it('createTransaction should POST payload and attach idempotency key when provided', () => {
    const payload = { description: 'Coffee' } as CreateTransactionRequest;
    service.createTransaction(payload, 'key-123').subscribe();

    const req = httpMock.expectOne(`${base}/transactions`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    expect(req.request.headers.get('Idempotency-Key')).toBe('key-123');
    req.flush(tx);
  });

  it('createTransaction should omit idempotency header when not supplied', () => {
    service.createTransaction({} as CreateTransactionRequest).subscribe();
    const req = httpMock.expectOne(`${base}/transactions`);
    expect(req.request.headers.has('Idempotency-Key')).toBeFalse();
    req.flush(tx);
  });

  it('updateTransaction should PATCH the changes', () => {
    service.updateTransaction('1', { description: 'Tea' }).subscribe();
    const req = httpMock.expectOne(`${base}/transactions/1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ description: 'Tea' });
    req.flush(tx);
  });

  it('deleteTransaction should DELETE by id', () => {
    service.deleteTransaction('1').subscribe();
    const req = httpMock.expectOne(`${base}/transactions/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should propagate HTTP errors to the caller', () => {
    let errored = false;
    service.getTransactions().subscribe({ error: () => (errored = true) });
    httpMock.expectOne(`${base}/transactions`).flush('fail', { status: 500, statusText: 'Server Error' });
    expect(errored).toBeTrue();
  });
});
