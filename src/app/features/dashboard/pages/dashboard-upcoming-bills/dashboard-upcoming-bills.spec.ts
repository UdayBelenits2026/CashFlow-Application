import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardUpcomingBills } from './dashboard-upcoming-bills';
import { provideStore } from '@ngrx/store';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { dashboardReducer } from '../../store/dashboard.reducer';

describe('DashboardUpcomingBills', () => {
  let component: DashboardUpcomingBills;
  let fixture: ComponentFixture<DashboardUpcomingBills>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardUpcomingBills],
      providers: [
        provideStore({ dashboard: dashboardReducer }),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardUpcomingBills);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
