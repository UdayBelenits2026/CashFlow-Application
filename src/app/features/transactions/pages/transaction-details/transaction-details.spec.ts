import { ComponentFixture, TestBed } from '@angular/core/testing';
<<<<<<< HEAD
import { ActivatedRoute, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideStore } from '@ngrx/store';

import { TransactionDetails } from './transaction-details';
import { transactionsReducer, transactionsFeatureKey } from '../../store/transactions.reducers';
=======
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { provideStore } from '@ngrx/store';

import { TransactionDetails } from './transaction-details';
import { transactionsFeatureKey, transactionsReducer } from '../../store/transactions.reducers';
>>>>>>> origin/transactions-list

describe('TransactionDetails', () => {
  let component: TransactionDetails;
  let fixture: ComponentFixture<TransactionDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionDetails],
      providers: [
        provideStore({ [transactionsFeatureKey]: transactionsReducer }),
<<<<<<< HEAD
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => 'tx-1' } } }
        }
=======
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } }
>>>>>>> origin/transactions-list
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with no transaction loaded', () => {
    expect(component.transaction).toBeNull();
    expect(component.confirmDeleteOpen).toBeFalse();
  });
});
