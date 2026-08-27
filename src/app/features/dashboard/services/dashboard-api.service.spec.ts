import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { DashboardApiService } from './dashboard-api.service';
import { environment } from '../../../../environments/environment';
import { DashboardApiResponse, DashboardItem } from '../models/dashboard.models';

describe('DashboardApiService', () => {
  let service: DashboardApiService;
  let httpMock: HttpTestingController;
  const base = environment.apiBaseUrl;

  const emptyResponse = {
    summaryCards: [],
    upcomingBills: [],
    recentTransactions: [],
    recentIncome: [],
    recentExpenses: [],
  } as unknown as DashboardApiResponse;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DashboardApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getDashboard should GET the dashboard endpoint and return data unchanged without filters', () => {
    let result: DashboardApiResponse | undefined;
    service.getDashboard().subscribe((r) => (result = r));
    const req = httpMock.expectOne((r) => r.url === `${base}/dashboard`);
    expect(req.request.method).toBe('GET');
    req.flush(emptyResponse);
    expect(result).toEqual(emptyResponse);
  });

  it('getDashboard should forward filters as query params', () => {
    service.getDashboard({ merchant: 'Amazon' }).subscribe();
    const req = httpMock.expectOne((r) => r.url === `${base}/dashboard`);
    expect(req.request.params.get('merchant')).toBe('Amazon');
    req.flush(emptyResponse);
  });

  it('addUpcomingBill should read then patch upcoming bills', () => {
    const item = { id: 'b1', title: 'Rent', amount: 100, date: '2026-01-01', icon: 'fa-home', type: 'bill' } as DashboardItem;
    let result: DashboardItem | undefined;
    service.addUpcomingBill(item).subscribe((r) => (result = r));

    httpMock.expectOne(`${base}/dashboard`).flush({ upcomingBills: [] });
    const patch = httpMock.expectOne(`${base}/dashboard`);
    expect(patch.request.method).toBe('PATCH');
    expect(patch.request.body.upcomingBills[0]).toEqual(item);
    patch.flush({});
    expect(result).toEqual(item);
  });

  it('deleteUpcomingBill should remove the bill and return the id', () => {
    let result: number | string | undefined;
    service.deleteUpcomingBill('b1').subscribe((r) => (result = r));

    httpMock.expectOne(`${base}/dashboard`).flush({
      upcomingBills: [{ id: 'b1' }, { id: 'b2' }],
    });
    const patch = httpMock.expectOne(`${base}/dashboard`);
    expect(patch.request.body.upcomingBills.map((b: any) => b.id)).toEqual(['b2']);
    patch.flush({});
    expect(result).toBe('b1');
  });

  it('updateWidgetConfig should PATCH the widget config', () => {
    const config = [{ id: 'cashBalance', selected: true, layout: 'medium', order: 0 }] as any;
    let result: any;
    service.updateWidgetConfig(config).subscribe((r) => (result = r));
    const req = httpMock.expectOne(`${base}/dashboard`);
    expect(req.request.method).toBe('PATCH');
    req.flush({});
    expect(result).toEqual(config);
  });

  it('connectAccount should POST to accounts', () => {
    const payload = { accountType: 'bank' } as any;
    service.connectAccount(payload).subscribe();
    const req = httpMock.expectOne(`${base}/accounts`);
    expect(req.request.method).toBe('POST');
    req.flush(payload);
  });

  it('connectAccount should fall back to patching onboarding on POST failure', () => {
    const payload = { accountType: 'bank' } as any;
    let result: any;
    service.connectAccount(payload).subscribe((r) => (result = r));
    httpMock.expectOne(`${base}/accounts`).flush('err', { status: 500, statusText: 'Error' });
    const patch = httpMock.expectOne(`${base}/dashboard`);
    expect(patch.request.method).toBe('PATCH');
    patch.flush({});
    expect(result).toEqual(payload);
  });

  it('saveProfile should POST to profile', () => {
    const payload = { fullName: 'Jo' } as any;
    service.saveProfile(payload).subscribe();
    const req = httpMock.expectOne(`${base}/profile`);
    expect(req.request.method).toBe('POST');
    req.flush(payload);
  });
});
