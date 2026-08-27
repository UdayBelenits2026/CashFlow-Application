import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountsCategories } from './accounts-categories';
import { provideStore } from '@ngrx/store';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { accountReducer } from '../../store/reducers/accounts.reducer';
import { accountsFeatureKey } from '../../store/state/accounts.state';

describe('AccountsCategories', () => {
  let component: AccountsCategories;
  let fixture: ComponentFixture<AccountsCategories>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountsCategories],
      providers: [
        provideStore({ [accountsFeatureKey]: accountReducer }),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountsCategories);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
