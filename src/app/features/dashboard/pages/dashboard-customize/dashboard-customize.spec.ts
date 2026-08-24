import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardCustomize } from './dashboard-customize';

describe('DashboardCustomize', () => {
  let component: DashboardCustomize;
  let fixture: ComponentFixture<DashboardCustomize>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardCustomize]
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
