import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IncomeApiService } from './income-api.service';
import { environment } from '../../../../environments/environment';

describe('IncomeApiService', () => {
  let service: IncomeApiService;
  let httpMock: HttpTestingController;
  const base = environment.incomeApiBaseUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(IncomeApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getDashboardData should aggregate and map all datasets', () => {
    let result: any;
    service.getDashboardData().subscribe((r) => (result = r));

    httpMock.expectOne(`${base}/income-overview`).flush({ totalIncome: 1000 });
    httpMock.expectOne(`${base}/income-sources`).flush([{ id: 's1', name: 'Job', type: 'Salary' }]);
    httpMock.expectOne(`${base}/income-trend-points`).flush([{ xLabel: 'Jan', thisPeriod: 5 }]);
    httpMock.expectOne(`${base}/incomes`).flush([{ id: 'i1', amount: 50 }]);
    httpMock.expectOne(`${base}/recurring-income`).flush([{ id: 'r1' }]);
    httpMock.expectOne(`${base}/accounts`).flush([{ id: 'a1', name: 'Checking' }]);

    expect(result.overview.totalIncome).toBe(1000);
    expect(result.sources.length).toBe(1);
    expect(result.trendPoints.length).toBe(1);
    expect(result.incomes.length).toBe(1);
    expect(result.accounts.length).toBe(1);
  });

  it('getDashboardData should degrade a failing endpoint to empty data', () => {
    let result: any;
    service.getDashboardData().subscribe((r) => (result = r));

    httpMock.expectOne(`${base}/income-overview`).flush('err', { status: 500, statusText: 'Error' });
    httpMock.expectOne(`${base}/income-sources`).flush([]);
    httpMock.expectOne(`${base}/income-trend-points`).flush([]);
    httpMock.expectOne(`${base}/incomes`).flush([]);
    httpMock.expectOne(`${base}/recurring-income`).flush([]);
    httpMock.expectOne(`${base}/accounts`).flush([]);

    expect(result.sources).toEqual([]);
    expect(result.overview).toBeTruthy();
  });

  it('getIncomes should GET and map incomes', () => {
    let result: any;
    service.getIncomes().subscribe((r) => (result = r));
    httpMock.expectOne(`${base}/incomes`).flush([{ id: 'i1', amount: 10 }]);
    expect(result.length).toBe(1);
    expect(result[0].amount).toBe(10);
  });

  it('createIncome should POST to incomes', () => {
    service.createIncome({ amount: 5 } as any).subscribe();
    const req = httpMock.expectOne(`${base}/incomes`);
    expect(req.request.method).toBe('POST');
    req.flush({ id: 'i9' });
  });

  it('updateIncome should PUT to incomes/:id', () => {
    service.updateIncome('i1', { amount: 5 } as any).subscribe();
    const req = httpMock.expectOne(`${base}/incomes/i1`);
    expect(req.request.method).toBe('PUT');
    req.flush({ id: 'i1' });
  });

  it('deleteIncome should DELETE incomes/:id', () => {
    service.deleteIncome('i1').subscribe();
    const req = httpMock.expectOne(`${base}/incomes/i1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('patchSourceStatus should PATCH the source status', () => {
    service.patchSourceStatus('s1', 'INACTIVE').subscribe();
    const req = httpMock.expectOne(`${base}/income-sources/s1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'INACTIVE' });
    req.flush({ id: 's1', status: 'INACTIVE' });
  });

  it('getIncomes should propagate HTTP errors (no mock fallback)', () => {
    let errored = false;
    service.getIncomes().subscribe({ error: () => (errored = true) });
    httpMock.expectOne(`${base}/incomes`).flush('err', { status: 500, statusText: 'Error' });
    expect(errored).toBeTrue();
  });
});
