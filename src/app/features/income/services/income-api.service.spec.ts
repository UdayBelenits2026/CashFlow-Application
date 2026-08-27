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

  it('getDashboardData should aggregate the income endpoints with the userId', () => {
    let result: any;
    service.getDashboardData().subscribe((r) => (result = r));

    httpMock.expectOne((r) => r.url.startsWith(`${base}/income/overview`)).flush({ data: { totalIncome: 1000 } });
    httpMock.expectOne((r) => r.url.startsWith(`${base}/income/sources?`)).flush({ data: [{ id: 's1', name: 'Job', type: 'Salary' }] });
    httpMock.expectOne((r) => r.url.startsWith(`${base}/income/trends`)).flush({ data: [{ xLabel: 'Jan', thisPeriod: 5 }] });
    httpMock.expectOne((r) => r.url.startsWith(`${base}/income/history`)).flush({ data: { content: [{ id: 'i1', amount: 50 }] } });
    httpMock.expectOne((r) => r.url.startsWith(`${base}/income/recurring`)).flush({ data: [{ id: 'r1' }] });
    httpMock.expectOne((r) => r.url.startsWith(`${base}/accounts`)).flush({ data: [{ id: 'a1', name: 'Checking' }] });

    expect(result.overview.totalIncome).toBe(1000);
    expect(result.sources.length).toBe(1);
  });

  it('getIncomes should GET income/history with pagination and userId', () => {
    let result: any;
    service.getIncomes().subscribe((r) => (result = r));
    const req = httpMock.expectOne((r) => r.url.startsWith(`${base}/income/history`));
    expect(req.request.url).toContain(`userId=${environment.defaultUserId}`);
    expect(req.request.url).toContain('size=500');
    req.flush({ data: { content: [{ id: 'i1', amount: 10 }] } });
    expect(result.length).toBe(1);
  });

  it('createIncome should POST to income with the userId param', () => {
    service.createIncome({ amount: 5 } as any).subscribe();
    const req = httpMock.expectOne((r) => r.method === 'POST' && r.url.startsWith(`${base}/income?`));
    expect(req.request.url).toContain(`userId=${environment.defaultUserId}`);
    req.flush({ data: { id: 'i9' } });
  });

  it('updateIncome should PUT to income/:numericId', () => {
    service.updateIncome('i1', { amount: 5 } as any).subscribe();
    const req = httpMock.expectOne((r) => r.method === 'PUT' && r.url.startsWith(`${base}/income/1`));
    req.flush({ data: { id: 'i1' } });
  });

  it('deleteIncome should DELETE income/:numericId with userId', () => {
    service.deleteIncome('a1', 'i1').subscribe();
    const req = httpMock.expectOne((r) => r.method === 'DELETE' && r.url.startsWith(`${base}/income/1`));
    expect(req.request.url).toContain(`userId=${environment.defaultUserId}`);
    req.flush(null);
  });

  it('patchSourceStatus should PATCH income/sources/:numericId/status', () => {
    service.patchSourceStatus('s1', 'INACTIVE').subscribe();
    const req = httpMock.expectOne((r) => r.method === 'PATCH' && r.url.startsWith(`${base}/income/sources/1/status`));
    req.flush({ data: { id: 's1', status: 'INACTIVE' } });
  });

  it('getIncomes should propagate HTTP errors', () => {
    let errored = false;
    service.getIncomes().subscribe({ error: () => (errored = true) });
    httpMock.expectOne((r) => r.url.startsWith(`${base}/income/history`)).flush('err', { status: 500, statusText: 'Error' });
    expect(errored).toBeTrue();
  });
});
