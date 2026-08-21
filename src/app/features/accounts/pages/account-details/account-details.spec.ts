import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { AccountDetails } from './account-details';
import { AccountServices } from '../../../../shared/services/account.service';

describe('AccountDetails', () => {
  let component: AccountDetails;
  let fixture: ComponentFixture<AccountDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountDetails],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => 'ACC001'
              }
            }
          }
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate')
          }
        },
        {
          provide: AccountServices,
          useValue: {
            getAccountById: jasmine.createSpy('getAccountById').and.returnValue(of({
              id: 'ACC001',
              accountName: 'Main Checking',
              accountType: 'Bank Account',
              accountNumber: '1234567890',
              balance: 1000,
              availableBalance: 1000,
              currency: 'USD',
              openDate: '2026-01-01',
              status: 'Active'
            })),
            getTransactionsByAccountId: jasmine.createSpy('getTransactionsByAccountId').and.returnValue(of([]))
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
