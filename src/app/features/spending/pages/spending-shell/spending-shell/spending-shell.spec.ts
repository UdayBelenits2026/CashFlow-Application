import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpendingShell } from './spending-shell';

describe('SpendingShell', () => {
  let component: SpendingShell;
  let fixture: ComponentFixture<SpendingShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpendingShell]
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
