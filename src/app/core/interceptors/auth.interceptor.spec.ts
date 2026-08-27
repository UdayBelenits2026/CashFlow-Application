import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Store } from '@ngrx/store';
import { of, throwError } from 'rxjs';

import { authInterceptor, SKIP_AUTH } from './auth.interceptor';
import { TokenService } from '../auth/services/token.service';
import { SessionService } from '../auth/services/session.service';
import { TokenRefreshService } from '../auth/services/token-refresh.service';
import { environment } from '../../../environments/environment';
import { HttpContext } from '@angular/common/http';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let tokenService: jasmine.SpyObj<TokenService>;
  let sessionService: jasmine.SpyObj<SessionService>;
  let tokenRefresh: jasmine.SpyObj<TokenRefreshService>;
  let store: jasmine.SpyObj<Store>;

  const apiUrl = `${environment.apiBaseUrl}/dashboard`;

  beforeEach(() => {
    tokenService = jasmine.createSpyObj('TokenService', [
      'getAuthorizationHeader', 'getTokenType', 'hasRefreshToken', 'getUserId',
    ]);
    sessionService = jasmine.createSpyObj('SessionService', ['isAuthenticated', 'getCorrelationId']);
    tokenRefresh = jasmine.createSpyObj('TokenRefreshService', ['refreshAccessToken']);
    store = jasmine.createSpyObj('Store', ['dispatch']);

    tokenService.getAuthorizationHeader.and.returnValue('Bearer token-123');
    tokenService.getTokenType.and.returnValue('Bearer');
    tokenService.hasRefreshToken.and.returnValue(false);
    tokenService.getUserId.and.returnValue(4);
    sessionService.isAuthenticated.and.returnValue(true);
    sessionService.getCorrelationId.and.returnValue('corr-1');

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: TokenService, useValue: tokenService },
        { provide: SessionService, useValue: sessionService },
        { provide: TokenRefreshService, useValue: tokenRefresh },
        { provide: Store, useValue: store },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should add the Authorization header to API requests', () => {
    http.get(apiUrl).subscribe();
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-123');
    req.flush({});
  });

  it('should add userId and correlationId headers to API requests', () => {
    http.get(apiUrl).subscribe();
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.headers.get('userId')).toBe('4');
    expect(req.request.headers.get('correlationId')).toBe('corr-1');
    req.flush({});
  });

  it('should not add the header to non-API requests', () => {
    http.get('https://other.example.com/data').subscribe();
    const req = httpMock.expectOne('https://other.example.com/data');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    expect(req.request.headers.has('userId')).toBeFalse();
    expect(req.request.headers.has('correlationId')).toBeFalse();
    req.flush({});
  });

  it('should skip auth headers when SKIP_AUTH context is set', () => {
    http.get(apiUrl, { context: new HttpContext().set(SKIP_AUTH, true) }).subscribe();
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.headers.has('Authorization')).toBeFalse();
    expect(req.request.headers.has('userId')).toBeFalse();
    req.flush({});
  });

  it('should refresh and retry once on 401 when a refresh token exists', () => {
    tokenService.hasRefreshToken.and.returnValue(true);
    tokenRefresh.refreshAccessToken.and.returnValue(of('new-token'));

    let succeeded = false;
    http.get(apiUrl).subscribe(() => (succeeded = true));

    const first = httpMock.expectOne(apiUrl);
    first.flush('unauth', { status: 401, statusText: 'Unauthorized' });

    const retry = httpMock.expectOne(apiUrl);
    expect(retry.request.headers.get('Authorization')).toBe('Bearer new-token');
    retry.flush({});

    expect(tokenRefresh.refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(succeeded).toBeTrue();
  });

  it('should dispatch sessionExpired when refresh fails', () => {
    tokenService.hasRefreshToken.and.returnValue(true);
    tokenRefresh.refreshAccessToken.and.returnValue(throwError(() => new Error('refresh failed')));

    let errored = false;
    http.get(apiUrl).subscribe({ error: () => (errored = true) });
    httpMock.expectOne(apiUrl).flush('unauth', { status: 401, statusText: 'Unauthorized' });

    expect(store.dispatch).toHaveBeenCalled();
    expect(errored).toBeTrue();
  });

  it('should dispatch sessionExpired on 401 when no refresh token is available', () => {
    tokenService.hasRefreshToken.and.returnValue(false);

    let errored = false;
    http.get(apiUrl).subscribe({ error: () => (errored = true) });
    httpMock.expectOne(apiUrl).flush('unauth', { status: 401, statusText: 'Unauthorized' });

    expect(store.dispatch).toHaveBeenCalled();
    expect(errored).toBeTrue();
  });

  it('should propagate non-401 errors without dispatching sessionExpired', () => {
    let errored = false;
    http.get(apiUrl).subscribe({ error: () => (errored = true) });
    httpMock.expectOne(apiUrl).flush('server', { status: 500, statusText: 'Server Error' });

    expect(store.dispatch).not.toHaveBeenCalled();
    expect(errored).toBeTrue();
  });
});
