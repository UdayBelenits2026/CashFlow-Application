import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpendingShell } from './spending-shell';
import { provideStore } from '@ngrx/store';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { spendingReducer } from '../../../store/spending.reducer';
import { spendingFeatureKey } from '../../../store/spending.state';

describe('SpendingShell', () => {
  let component: SpendingShell;
  let fixture: ComponentFixture<SpendingShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpendingShell],
      providers: [
        provideStore({ [spendingFeatureKey]: spendingReducer }),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpendingShell);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
