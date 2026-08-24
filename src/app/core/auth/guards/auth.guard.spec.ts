import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { authGuard } from './auth.guard';
import { TokenService } from '../services/token.service';

describe('authGuard', () => {
  let tokenSpy: jasmine.SpyObj<TokenService>;

  const run = () =>
    TestBed.runInInjectionContext(() =>
      authGuard(
        {} as ActivatedRouteSnapshot,
        { url: '/dashboard' } as RouterStateSnapshot,
      ),
    );

  beforeEach(() => {
    tokenSpy = jasmine.createSpyObj<TokenService>('TokenService', ['hasAccessToken']);
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: TokenService, useValue: tokenSpy }],
    });
  });

  it('allows activation when an access token exists', () => {
    tokenSpy.hasAccessToken.and.returnValue(true);
    expect(run()).toBeTrue();
  });

  it('redirects to sign in when there is no access token', () => {
    tokenSpy.hasAccessToken.and.returnValue(false);
    expect(run() instanceof UrlTree).toBeTrue();
  });
});
