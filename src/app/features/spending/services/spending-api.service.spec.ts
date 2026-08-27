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

  function flushDashboard(overrides: Partial<Record<string, unknown>> = {}) {
    httpMock.expectOne(`${base}/spending/overview`).flush((overrides['overview'] as any) ?? { totalSpending: 500 });
    httpMock.expectOne(`${base}/spending/categories`).flush((overrides['categories'] as any) ?? []);
    httpMock.expectOne(`${base}/expenses?size=500`).flush((overrides['expenses'] as any) ?? { content: [{ id: 'e1', amount: 10 }] });
    httpMock.expectOne(`${base}/tags`).flush((overrides['tags'] as any) ?? [{ id: 't1', name: 'Food' }]);
    httpMock.expectOne(`${base}/recurring-expenses`).flush((overrides['recurring'] as any) ?? []);
    httpMock.expectOne(`${base}/spending-alerts`).flush((overrides['alerts'] as any) ?? []);
  }

  it('getDashboardData should aggregate and map datasets', () => {
    let result: any;
    service.getDashboardData().subscribe((r) => (result = r));
    flushDashboard();
    expect(result.overview.totalSpending).toBe(500);
    expect(result.expenses.length).toBe(1);
    expect(result.tags.length).toBe(1);
  });

  it('getDashboardData should degrade failing endpoints to empty', () => {
    let result: any;
    service.getDashboardData().subscribe((r) => (result = r));
    httpMock.expectOne(`${base}/spending/overview`).flush('err', { status: 500, statusText: 'Error' });
    httpMock.expectOne(`${base}/spending/categories`).flush([]);
    httpMock.expectOne(`${base}/expenses?size=500`).flush({ content: [] });
    httpMock.expectOne(`${base}/tags`).flush([]);
    httpMock.expectOne(`${base}/recurring-expenses`).flush([]);
    httpMock.expectOne(`${base}/spending-alerts`).flush([]);
    expect(result.expenses).toEqual([]);
    expect(result.overview).toBeTruthy();
  });

  it('getExpenses should map and hide zero-amount placeholder rows', () => {
    let result: any;
    service.getExpenses().subscribe((r) => (result = r));
    httpMock.expectOne(`${base}/expenses?size=500`).flush({
      content: [
        { id: 'e1', amount: 10, merchantName: 'Shop' },
        { id: 'e2', amount: 0, merchantName: '—' },
      ],
    });
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('e1');
  });

  it('createExpense should POST and return an entity with an id', () => {
    let result: any;
    service.createExpense({ amount: 5 } as any).subscribe((r) => (result = r));
    const req = httpMock.expectOne(`${base}/expenses`);
    expect(req.request.method).toBe('POST');
    req.flush({ transactionId: 99 });
    expect(result.id).toBe('99');
  });

  it('deleteExpense should DELETE by id', () => {
    service.deleteExpense('5').subscribe();
    const req = httpMock.expectOne(`${base}/expenses/5`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('getTags should GET and map tags', () => {
    let result: any;
    service.getTags().subscribe((r) => (result = r));
    httpMock.expectOne(`${base}/tags`).flush([{ id: 't1', name: 'Food' }]);
    expect(result.length).toBe(1);
  });

  it('getExpenses should propagate HTTP errors (no mock fallback)', () => {
    let errored = false;
    service.getExpenses().subscribe({ error: () => (errored = true) });
    httpMock.expectOne(`${base}/expenses?size=500`).flush('err', { status: 500, statusText: 'Error' });
    expect(errored).toBeTrue();
  });
});
