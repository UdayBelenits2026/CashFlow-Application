import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { spendingDevUserInterceptor } from './spending-dev-user.interceptor';
import { environment } from '../../../environments/environment';

describe('spendingDevUserInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([spendingDevUserInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should attach X-User-Id to spending requests only when a dev id is configured', () => {
    http.get(`${environment.spendingApiBaseUrl}/expenses`).subscribe();
    const req = httpMock.expectOne(`${environment.spendingApiBaseUrl}/expenses`);
    if (environment.spendingDevUserId) {
      expect(req.request.headers.get('X-User-Id')).toBe(environment.spendingDevUserId);
    } else {
      expect(req.request.headers.has('X-User-Id')).toBeFalse();
    }
    req.flush([]);
  });

  it('should NOT attach the header to non-spending requests', () => {
    http.get(`${environment.apiBaseUrl}/dashboard`).subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/dashboard`);
    expect(req.request.headers.has('X-User-Id')).toBeFalse();
    req.flush({});
  });
});
