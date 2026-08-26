import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthApiService } from './auth-api.service';
import { environment } from '../../../../environments/environment';
import { ResetPasswordRequest, ResetPasswordResponse } from '../models/auth.models';

describe('AuthApiService', () => {
  let service: AuthApiService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiBaseUrl}/auth`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthApiService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AuthApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should POST reset-password to the correct endpoint with the request body', () => {
    const request: ResetPasswordRequest = {
      email: 'user@example.com',
      newPassword: 'Password@123',
      confirmPassword: 'Password@123',
    };
    const response: ResetPasswordResponse = {
      success: true,
      code: 'OK',
      message: 'Password reset successfully.',
      data: { publicId: 'pub-1', email: 'user@example.com' },
      correlationId: 'corr-1',
    };

    let actual: ResetPasswordResponse | undefined;
    service.resetPassword(request).subscribe((res) => (actual = res));

    const req = httpMock.expectOne(`${baseUrl}/reset-password`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);

    req.flush(response);
    expect(actual).toEqual(response);
  });
});
