import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardCustomize } from './dashboard-customize';
import { provideStore } from '@ngrx/store';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { dashboardReducer } from '../../store/dashboard.reducer';

describe('DashboardCustomize', () => {
  let component: DashboardCustomize;
  let fixture: ComponentFixture<DashboardCustomize>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardCustomize],
      providers: [
        provideStore({ dashboard: dashboardReducer }),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardCustomize);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
