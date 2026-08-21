import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { AccountListComponent } from './account-list';
import { AccountFacade } from '../../facades/account.facade';

describe('AccountListComponent', () => {
  let component: AccountListComponent;
  let fixture: ComponentFixture<AccountListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountListComponent],
      providers: [
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate')
          }
        },
        {
          provide: AccountFacade,
          useValue: {
            accounts$: of([]),
            totalBalance$: of(0),
            accountCount$: of(0),
            loading$: of(false),
            error$: of(null),
            loadAccounts: jasmine.createSpy('loadAccounts')
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
