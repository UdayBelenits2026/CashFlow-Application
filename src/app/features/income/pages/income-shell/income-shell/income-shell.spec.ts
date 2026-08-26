import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeShell } from './income-shell';

describe('IncomeShell', () => {
  let component: IncomeShell;
  let fixture: ComponentFixture<IncomeShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncomeShell]
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
