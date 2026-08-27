import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { SpendingApiService } from './spending-api.service';
import { environment } from '../../../../environments/environment';

describe('SpendingApiService', () => {
  let service: SpendingApiService;
  let httpMock: HttpTestingController;
  const base = environment.spendingApiBaseUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SpendingApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getDashboardData should call overview, categories and expenses with the userId', () => {
    let result: any;
    service.getDashboardData().subscribe((r) => (result = r));

    const overview = httpMock.expectOne((r) => r.url.startsWith(`${base}/spending/overview`));
    expect(overview.request.url).toContain(`userId=${environment.defaultUserId}`);
    expect(overview.request.url).toContain('period=this_month');
    overview.flush({ data: { totalSpending: 500 } });

    const categories = httpMock.expectOne((r) => r.url.startsWith(`${base}/spending/categories`));
    categories.flush({ data: [] });

    const expenses = httpMock.expectOne((r) => r.url.startsWith(`${base}/expenses`));
    expect(expenses.request.url).toContain('size=500');
    expenses.flush({ data: { content: [{ transactionId: 1, amount: 10, merchantName: 'Shop' }] } });

    expect(result.overview).toBeTruthy();
  });

  it('getExpenses should GET expenses with userId and size, hiding placeholder rows', () => {
    let result: any;
    service.getExpenses().subscribe((r) => (result = r));
    const req = httpMock.expectOne((r) => r.url.startsWith(`${base}/expenses`));
    expect(req.request.method).toBe('GET');
    expect(req.request.url).toContain(`userId=${environment.defaultUserId}`);
    expect(req.request.url).toContain('size=500');
    req.flush({ data: { content: [
      { transactionId: 1, amount: 10, merchantName: 'Shop' },
      { transactionId: 2, amount: 0, merchantName: '—' },
    ] } });
    expect(result.length).toBe(1);
  });

  it('createExpense should POST to expenses with the userId param', () => {
    let result: any;
    service.createExpense({ amount: 5 } as any).subscribe((r) => (result = r));
    const req = httpMock.expectOne((r) => r.method === 'POST' && r.url.startsWith(`${base}/expenses`));
    expect(req.request.url).toContain(`userId=${environment.defaultUserId}`);
    req.flush({ data: { transactionId: 99 } });
    expect(result.id).toBe('99');
  });

  it('deleteExpense should DELETE expenses/:id with the userId param', () => {
    service.deleteExpense('5').subscribe();
    const req = httpMock.expectOne((r) => r.method === 'DELETE' && r.url.startsWith(`${base}/expenses/5`));
    expect(req.request.url).toContain(`userId=${environment.defaultUserId}`);
    req.flush(null);
  });

  it('getTags should resolve locally without an HTTP call', () => {
    let result: any;
    service.getTags().subscribe((r) => (result = r));
    expect(result).toEqual([]);
  });

  it('getExpenses should propagate HTTP errors', () => {
    let errored = false;
    service.getExpenses().subscribe({ error: () => (errored = true) });
    httpMock.expectOne((r) => r.url.startsWith(`${base}/expenses`)).flush('err', { status: 500, statusText: 'Error' });
    expect(errored).toBeTrue();
  });
});
