import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { AccountFormComponent } from './account-form-component';
import { AccountFacade } from '../../facades/account.facade';

describe('AccountFormComponent', () => {
  let component: AccountFormComponent;
  let fixture: ComponentFixture<AccountFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountFormComponent],
      providers: [
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate')
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              routeConfig: { path: 'accounts/add' },
              paramMap: {
                get: () => null
              }
            }
          }
        },
        {
          provide: AccountFacade,
          useValue: {
            accounts$: of([]),
            loading$: of(false),
            error$: of(null),
            loadAccounts: jasmine.createSpy('loadAccounts'),
            createAccount: jasmine.createSpy('createAccount'),
            updateAccount: jasmine.createSpy('updateAccount')
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
