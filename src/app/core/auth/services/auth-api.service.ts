import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoginRequest, LoginResponse, LogoutResponse, RefreshTokenRequest, RefreshTokenResponse, RegisterRequest, RegisterResponse, ResetPasswordRequest, ResetPasswordResponse } from '../models/auth.models';
import { SKIP_AUTH } from '../../interceptors/auth.interceptor';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, request, {
      context: new HttpContext().set(SKIP_AUTH, true),
    });
  }

  register(request: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.baseUrl}/register`, request, {
      context: new HttpContext().set(SKIP_AUTH, true),
    });
  }

  // Authorization header is added automatically by the auth interceptor.
  logout(): Observable<LogoutResponse> {
    return this.http.post<LogoutResponse>(`${this.baseUrl}/logout`, {});
  }

  resetPassword(request: ResetPasswordRequest): Observable<ResetPasswordResponse> {
    return this.http.post<ResetPasswordResponse>(`${this.baseUrl}/reset-password`, request, {
      context: new HttpContext().set(SKIP_AUTH, true),
    });
  }

  // Uses the refresh token in the body; the expired access token is not attached.
  refreshToken(request: RefreshTokenRequest): Observable<RefreshTokenResponse> {
    return this.http.post<RefreshTokenResponse>(`${this.baseUrl}/refresh`, request, {
      context: new HttpContext().set(SKIP_AUTH, true),
    });
  }
}
