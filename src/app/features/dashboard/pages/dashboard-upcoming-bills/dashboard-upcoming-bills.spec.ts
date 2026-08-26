import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardUpcomingBills } from './dashboard-upcoming-bills';

describe('DashboardUpcomingBills', () => {
  let component: DashboardUpcomingBills;
  let fixture: ComponentFixture<DashboardUpcomingBills>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardUpcomingBills]
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
