import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { AccountApiService } from './account-api.service';
import { environment } from '../../../../environments/environment';
import { Account } from '../models/accounts.model';

describe('AccountApiService', () => {
  let service: AccountApiService;
  let httpMock: HttpTestingController;
  const base = environment.apiBaseUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AccountApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAccounts should GET the accounts collection', () => {
    let result: Account[] | undefined;
    service.getAccounts().subscribe((r) => (result = r));
    const req = httpMock.expectOne(`${base}/accounts`);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: '1' } as unknown as Account]);
    expect(result?.length).toBe(1);
  });

  it('getAccountById should GET a single account', () => {
    service.getAccountById('7').subscribe();
    const req = httpMock.expectOne(`${base}/accounts/7`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: '7' });
  });

  it('createAccount should POST the payload', () => {
    service.createAccount({ name: 'New' } as any).subscribe();
    const req = httpMock.expectOne(`${base}/accounts`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'New' });
    req.flush({ id: '1', name: 'New' });
  });

  it('updateAccount should PUT to the account id', () => {
    service.updateAccount({ id: '3', name: 'X' } as unknown as Account).subscribe();
    const req = httpMock.expectOne(`${base}/accounts/3`);
    expect(req.request.method).toBe('PUT');
    req.flush({ id: '3', name: 'X' });
  });

  it('deleteAccount should DELETE by id', () => {
    service.deleteAccount('9').subscribe();
    const req = httpMock.expectOne(`${base}/accounts/9`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('getTransactionsByAccountId should pass the accountId query param', () => {
    service.getTransactionsByAccountId('42').subscribe();
    const req = httpMock.expectOne((r) => r.url === `${base}/transactions`);
    expect(req.request.params.get('accountId')).toBe('42');
    req.flush([]);
  });

  it('getAccountTypes should map to a list of names', () => {
    let result: string[] | undefined;
    service.getAccountTypes().subscribe((r) => (result = r));
    httpMock.expectOne(`${base}/accountTypes`).flush([
      { id: '1', name: 'Savings' },
      { id: '2', name: 'Checking' },
    ]);
    expect(result).toEqual(['Savings', 'Checking']);
  });

  it('getBanks should map to a list of names', () => {
    let result: string[] | undefined;
    service.getBanks().subscribe((r) => (result = r));
    httpMock.expectOne(`${base}/banks`).flush([{ id: '1', name: 'HDFC' }]);
    expect(result).toEqual(['HDFC']);
  });

  it('getCurrencies should map to code/label options', () => {
    let result: any;
    service.getCurrencies().subscribe((r) => (result = r));
    httpMock.expectOne(`${base}/currencies`).flush([{ id: '1', code: 'INR', label: 'Rupee' }]);
    expect(result).toEqual([{ code: 'INR', label: 'Rupee' }]);
  });

  it('getAccountSubTypes should filter by accountType and map to names', () => {
    let result: string[] | undefined;
    service.getAccountSubTypes('Savings').subscribe((r) => (result = r));
    const req = httpMock.expectOne((r) => r.url === `${base}/accountSubTypes`);
    expect(req.request.params.get('accountType')).toBe('Savings');
    req.flush([{ id: '1', accountType: 'Savings', name: 'High Yield' }]);
    expect(result).toEqual(['High Yield']);
  });

  it('createAccountCategory should POST to accountSubTypes', () => {
    service.createAccountCategory({ name: 'Cat' } as any).subscribe();
    const req = httpMock.expectOne(`${base}/accountSubTypes`);
    expect(req.request.method).toBe('POST');
    req.flush({ id: '1', name: 'Cat' });
  });

  it('should surface HTTP errors', () => {
    let errored = false;
    service.getAccounts().subscribe({ error: () => (errored = true) });
    httpMock.expectOne(`${base}/accounts`).flush('err', { status: 500, statusText: 'Error' });
    expect(errored).toBeTrue();
  });
});
