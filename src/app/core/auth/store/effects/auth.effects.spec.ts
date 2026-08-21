import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { AuthEffects } from './auth.effects';
import { AuthApiService } from '../../services/auth-api.service';
import { AuthTokenService } from '../../services/auth-token.service';

describe('AuthEffects', () => {
  let actions$: Observable<Action>;
  let effects: AuthEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthEffects,
        provideMockActions(() => actions$),
        {
          provide: AuthApiService,
          useValue: jasmine.createSpyObj<AuthApiService>('AuthApiService', ['login', 'register']),
        },
        {
          provide: AuthTokenService,
          useValue: jasmine.createSpyObj<AuthTokenService>('AuthTokenService', ['hydrateSession', 'setSession', 'clear']),
        },
        {
          provide: Router,
          useValue: jasmine.createSpyObj<Router>('Router', ['navigate']),
        },
      ],
    });

    actions$ = of({ type: '[Test] Init' });
    effects = TestBed.inject(AuthEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
