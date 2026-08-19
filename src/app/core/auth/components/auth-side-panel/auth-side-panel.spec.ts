import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthSidePanel } from './auth-side-panel';

describe('AuthSidePanel', () => {
  let component: AuthSidePanel;
  let fixture: ComponentFixture<AuthSidePanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthSidePanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthSidePanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
