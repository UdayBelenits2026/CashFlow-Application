import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthSidePanelComponent } from './auth-side-panel';
import { sidePanelConfig } from '../../data/auth-page.data';

describe('AuthSidePanelComponent', () => {
  let component: AuthSidePanelComponent;
  let fixture: ComponentFixture<AuthSidePanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthSidePanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthSidePanelComponent);
    component = fixture.componentInstance;
    component.config = sidePanelConfig;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
