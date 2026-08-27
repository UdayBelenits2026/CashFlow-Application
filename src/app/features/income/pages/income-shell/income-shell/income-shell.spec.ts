import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeShell } from './income-shell';
import { provideStore } from '@ngrx/store';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { incomeReducer } from '../../../store/income.reducer';
import { incomeFeatureKey } from '../../../store/income.state';

describe('IncomeShell', () => {
  let component: IncomeShell;
  let fixture: ComponentFixture<IncomeShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncomeShell],
      providers: [
        provideStore({ [incomeFeatureKey]: incomeReducer }),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomeShell);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
