import { TestBed } from '@angular/core/testing';
import { provideStore, Store } from '@ngrx/store';
import { firstValueFrom } from 'rxjs';
import { AuthFacade } from './auth.facade';
import { authReducer } from '../store/reducer/auth.reducer';
import { SessionService } from '../services/session.service';
import * as AuthActions from '../store/actions/auth.actions';
import { ResetPasswordRequest } from '../models/auth.models';

describe('AuthFacade', () => {
  let facade: AuthFacade;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthFacade,
        provideStore({ auth: authReducer }),
        {
          provide: SessionService,
          useValue: jasmine.createSpyObj<SessionService>('SessionService', [
            'isAuthenticated',
            'getUser',
          ]),
        },
      ],
    });

    facade = TestBed.inject(AuthFacade);
    store = TestBed.inject(Store);
  });

  it('should dispatch resetPassword action', () => {
    const dispatchSpy = spyOn(store, 'dispatch');
    const request: ResetPasswordRequest = {
      email: 'user@example.com',
      newPassword: 'Password@123',
      confirmPassword: 'Password@123',
    };

    facade.resetPassword(request);

    expect(dispatchSpy).toHaveBeenCalledWith(AuthActions.resetPassword({ request }));
  });

  it('should dispatch clearResetPasswordState action', () => {
    const dispatchSpy = spyOn(store, 'dispatch');

    facade.clearResetPasswordState();

    expect(dispatchSpy).toHaveBeenCalledWith(AuthActions.clearResetPasswordState());
  });

  it('should expose reset-password observables from the store', async () => {
    store.dispatch(
      AuthActions.resetPasswordSuccess({
        message: 'Password reset successfully.',
        data: { publicId: 'pub-1', email: 'user@example.com' },
      }),
    );

    await expectAsync(firstValueFrom(facade.resetPasswordSuccess$)).toBeResolvedTo(true);
    await expectAsync(firstValueFrom(facade.resetPasswordMessage$)).toBeResolvedTo(
      'Password reset successfully.',
    );
    await expectAsync(firstValueFrom(facade.resetPasswordLoading$)).toBeResolvedTo(false);
  });
});
