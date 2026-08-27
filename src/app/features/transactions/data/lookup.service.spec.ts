import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { LookupService } from './lookup.service';
import { environment } from '../../../../environments/environment';
import { ApiResponse, LookupItem } from '../models/transaction-api.model';

// Contract tests for the (assumed) master-data lookup endpoints; backend is offline.
describe('LookupService', () => {
  let service: LookupService;
  let httpMock: HttpTestingController;
  const base = environment.transactionsApiBaseUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LookupService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(LookupService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  const cases: { path: string; method: () => ReturnType<LookupService['getAccounts']> }[] = [
    { path: 'accounts', method: () => service.getAccounts() },
    { path: 'categories', method: () => service.getCategories() },
    { path: 'merchants', method: () => service.getMerchants() },
    { path: 'income-sources', method: () => service.getIncomeSources() },
    { path: 'tags', method: () => service.getTags() }
  ];

  cases.forEach(({ path, method }) => {
    it(`GET /${path} unwraps the ApiResponse envelope`, () => {
      let result: LookupItem[] | undefined;
      method().subscribe((items) => (result = items));

      const req = httpMock.expectOne(`${base}/${path}`);
      expect(req.request.method).toBe('GET');

      const data: LookupItem[] = [
        { id: 1, name: 'One' },
        { id: 2, name: 'Two' }
      ];
      req.flush({ success: true, message: 'ok', data, correlationId: 'CF-x' } as ApiResponse<LookupItem[]>);
      expect(result).toEqual(data);
    });
  });
});
