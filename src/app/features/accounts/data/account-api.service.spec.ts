import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { AccountApiService } from './account-api.service';
import { UserContextService } from '../../../core/services/user-context.service';
import { environment } from '../../../../environments/environment';
import { Account } from '../models/accounts.model';
import { AccountApiResponse, AccountDetailDto, AccountOverviewDto } from '../models/account-api.model';

describe('AccountApiService', () => {
  let service: AccountApiService;
  let httpMock: HttpTestingController;
  const base = environment.accountsApiBaseUrl;
  const userId = 1001;

  function envelope<T>(data: T): AccountApiResponse<T> {
    return { success: true, message: 'ok', correlationId: 'c', data };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UserContextService, useValue: { getUserId: () => userId } },
      ],
    });
    service = TestBed.inject(AccountApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAccountTypeNames should unwrap the envelope', () => {
    let result: unknown[] | undefined;
    service.getAccountTypeNames().subscribe((r) => (result = r));
    const req = httpMock.expectOne(`${base}/account-types/type-names`);
    expect(req.request.method).toBe('GET');
    req.flush(envelope([{ account_type_id: 1, typeCode: 'BANK', typeName: 'Bank Account', description: '' }]));
    expect(result?.length).toBe(1);
  });

  it('getSubtypes should pass accountTypeId and unwrap data', () => {
    service.getSubtypes(5).subscribe();
    const req = httpMock.expectOne((r) => r.url === `${base}/account-types/subtypes`);
    expect(req.request.params.get('accountTypeId')).toBe('5');
    req.flush(envelope([]));
  });

  it('getInstitutions should pass accountTypeId', () => {
    service.getInstitutions(3).subscribe();
    const req = httpMock.expectOne((r) => r.url === `${base}/account-types/institutions`);
    expect(req.request.params.get('accountTypeId')).toBe('3');
    req.flush(envelope([]));
  });

  it('getAccountTypeCounts should call the userId-scoped endpoint', () => {
    service.getAccountTypeCounts().subscribe();
    const req = httpMock.expectOne(`${base}/account-types/${userId}/counts`);
    expect(req.request.method).toBe('GET');
    req.flush(envelope([]));
  });

  it('getAccounts should map the overview accounts to the Account shape', () => {
    let result: Account[] | undefined;
    service.getAccounts().subscribe((r) => (result = r));
    const req = httpMock.expectOne(`${base}/accounts/${userId}/overview`);
    const overview: AccountOverviewDto = {
      totalBalance: 15000,
      totalAccounts: 1,
      accountsByType: [],
      accounts: [
        { accountId: 7, accountName: 'SBI', accountTypeName: 'Bank Account', balance: 15000, maskedIdentifier: '1234', status: 'ACTIVE' },
      ],
    };
    req.flush(envelope(overview));
    expect(result?.length).toBe(1);
    expect(result?.[0].id).toBe('7');
    expect(result?.[0].accountNumber).toBe('1234');
    expect(result?.[0].balance).toBe(15000);
  });

  it('getAccountById should map a bank detail into the Account shape', () => {
    let result: Account | undefined;
    service.getAccountById('1').subscribe((r) => (result = r));
    const req = httpMock.expectOne((r) => r.url === `${base}/accounts/1`);
    expect(req.request.params.get('userId')).toBe(String(userId));
    const detail: AccountDetailDto = {
      accountId: 1, accountName: 'Main Checking', accountTypeName: 'Bank Account', typeCode: 'BANK',
      institutionName: 'HDFC Bank', currencyCode: 'INR', currentBalance: 12450, availableBalance: 12300,
      status: 'ACTIVE', typeSpecificDetails: { accountNumberLast4: '1234', ifscCode: 'HDFC0001234' },
      recentTransactions: [], transactionsLoadFailed: false,
    };
    req.flush(envelope(detail));
    expect(result?.accountNumber).toBe('1234');
    expect(result?.ifscCode).toBe('HDFC0001234');
    expect(result?.balance).toBe(12450);
  });

  it('getTransactionsByAccountId should map recent transactions from the detail endpoint', () => {
    let result: unknown[] | undefined;
    service.getTransactionsByAccountId('1').subscribe((r) => (result = r));
    const req = httpMock.expectOne((r) => r.url === `${base}/accounts/1`);
    req.flush(envelope({
      accountId: 1, accountName: 'x', accountTypeName: 'Bank Account', typeCode: 'BANK', currencyCode: 'INR',
      currentBalance: 0, availableBalance: 0, status: 'ACTIVE',
      typeSpecificDetails: { accountNumberLast4: '', ifscCode: '' },
      recentTransactions: [{ date: '2026-07-30', description: 'Amazon', amount: -86.65 }],
      transactionsLoadFailed: false,
    }));
    expect(result?.length).toBe(1);
  });

  it('getAccountTypes should map to type names', () => {
    let result: string[] | undefined;
    service.getAccountTypes().subscribe((r) => (result = r));
    httpMock.expectOne(`${base}/account-types/type-names`).flush(
      envelope([
        { account_type_id: 1, typeCode: 'BANK', typeName: 'Bank Account', description: '' },
        { account_type_id: 2, typeCode: 'CREDIT_CARD', typeName: 'Credit Card', description: '' },
      ]),
    );
    expect(result).toEqual(['Bank Account', 'Credit Card']);
  });

  it('getCurrencies should return INR without an HTTP call', () => {
    let result: unknown;
    service.getCurrencies().subscribe((r) => (result = r));
    expect(result).toEqual([{ code: 'INR', label: 'INR' }]);
  });

  it('getAccountSubTypes should resolve the type id from the label', () => {
    let result: string[] | undefined;
    service.getAccountSubTypes('Loan').subscribe((r) => (result = r));
    const req = httpMock.expectOne((r) => r.url === `${base}/account-types/subtypes`);
    expect(req.request.params.get('accountTypeId')).toBe('5');
    req.flush(envelope([{ account_subtype_id: 15, subtypeCode: 'HOME_LOAN', subtypeName: 'Home Loan', description: '' }]));
    expect(result).toEqual(['Home Loan']);
  });

  it('createAccount should resolve ids then POST the typed bank payload', () => {
    let result: Account | undefined;
    service
      .createAccount({
        accountName: 'My SBI', accountType: 'Bank Account', accountSubType: 'Savings Account',
        accountNumber: '123456789012', ifscCode: 'SBIN0001234', bankName: 'State Bank of India',
        balance: 5000, availableBalance: 5000, currency: 'INR', openDate: '', status: 'Active',
      })
      .subscribe((r) => (result = r));

    httpMock.expectOne((r) => r.url === `${base}/account-types/subtypes`).flush(
      envelope([{ account_subtype_id: 5, subtypeCode: 'SAVINGS', subtypeName: 'Savings Account', description: '' }]),
    );
    httpMock.expectOne((r) => r.url === `${base}/account-types/institutions`).flush(
      envelope([{ institution_id: 1, institutionCode: 'SBI', institutionName: 'State Bank of India' }]),
    );

    const post = httpMock.expectOne(`${base}/accounts`);
    expect(post.request.method).toBe('POST');
    expect(post.request.body.accountTypeId).toBe(1);
    expect(post.request.body.accountSubtypeId).toBe(5);
    expect(post.request.body.institutionId).toBe(1);
    expect(post.request.body.bankDetails.accountNumber).toBe('123456789012');
    post.flush(
      envelope({
        accountId: 16, accountName: 'My SBI', accountTypeId: 1, accountTypeCode: 'BANK', accountTypeName: 'Bank Account',
        accountSubtypeId: 5, accountSubtypeCode: 'SAVINGS', accountSubtypeName: 'Savings Account', institutionId: 1,
        institutionName: 'State Bank of India', currencyCode: 'INR', openingBalance: 5000, currentBalance: 5000,
        availableBalance: 5000, status: 'ACTIVE', details: { accountNumberLast4: '9013', ifscCode: 'SBIN0001234' },
      }),
    );
    expect(result?.id).toBe('16');
    expect(result?.accountNumber).toBe('9013');
  });

  it('getSensitiveDetails should GET the sensitive-details endpoint', () => {
    service.getSensitiveDetails(14).subscribe();
    const req = httpMock.expectOne(`${base}/accounts/14/sensitive-details`);
    expect(req.request.method).toBe('GET');
    req.flush(envelope({ bankDetails: { accountNumber: '987654321012' } }));
  });

  it('should surface HTTP errors from the overview endpoint', () => {
    let errored = false;
    service.getAccounts().subscribe({ error: () => (errored = true) });
    httpMock.expectOne(`${base}/accounts/${userId}/overview`).flush('err', { status: 500, statusText: 'Error' });
    expect(errored).toBeTrue();
  });
});
