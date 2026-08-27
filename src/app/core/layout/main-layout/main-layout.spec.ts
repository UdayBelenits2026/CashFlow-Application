import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainLayout } from './main-layout';
import { provideStore } from '@ngrx/store';
import { authReducer } from '../../auth/store/reducer/auth.reducer';
import { dashboardReducer } from '../../../features/dashboard/store/dashboard.reducer';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('MainLayout', () => {
  let component: MainLayout;
  let fixture: ComponentFixture<MainLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLayout],
      providers: [
        provideStore({ auth: authReducer, dashboard: dashboardReducer }),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
