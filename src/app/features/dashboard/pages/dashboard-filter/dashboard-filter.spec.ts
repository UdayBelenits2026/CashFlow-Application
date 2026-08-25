import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { DashboardFilter } from './dashboard-filter';

describe('DashboardFilter', () => {
  let component: DashboardFilter;
  let fixture: ComponentFixture<DashboardFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardFilter],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardFilter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
