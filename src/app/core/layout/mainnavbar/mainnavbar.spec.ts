import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideStore } from '@ngrx/store';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { Mainnavbar } from './mainnavbar';
import { authReducer } from '../../auth/store/reducer/auth.reducer';
import { dashboardReducer } from '../../../features/dashboard/store/dashboard.reducer';

describe('Mainnavbar', () => {
  let component: Mainnavbar;
  let fixture: ComponentFixture<Mainnavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mainnavbar],
      providers: [
        provideStore({ auth: authReducer, dashboard: dashboardReducer }),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Mainnavbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
