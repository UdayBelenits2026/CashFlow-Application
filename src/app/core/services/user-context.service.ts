import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { TokenService } from '../auth/services/token.service';

// Central source of the numeric backend userId required by the transaction/account APIs.
// Reads the authenticated userId from the JWT; falls back to the dev id when unauthenticated.
@Injectable({ providedIn: 'root' })
export class UserContextService {
  private readonly tokenService = inject(TokenService);

  getUserId(): number {
    return this.tokenService.getUserId() ?? environment.apiUserId;
  }
}