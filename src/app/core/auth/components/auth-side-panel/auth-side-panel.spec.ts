import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthSidePanelComponent } from './auth-side-panel';
import { sidePanelConfig } from '../../data/auth-page.data';
import { AuthSidePanelConfig } from '../../models/auth.models';

describe('AuthSidePanelComponent', () => {
  let component: AuthSidePanelComponent;
  let fixture: ComponentFixture<AuthSidePanelComponent>;

  const html = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthSidePanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthSidePanelComponent);
    component = fixture.componentInstance;
    component.config = sidePanelConfig;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the brand name and tagline', () => {
    expect(html().querySelector('.brand-name')?.textContent).toContain('CashFlow');
    expect(html().querySelector('.brand-tagline')?.textContent).toContain('Manage Your Money');
  });

  it('binds the illustration image to the config image', () => {
    const img = html().querySelector('.illustration') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe(sidePanelConfig.image);
  });

  it('renders the config title and description', () => {
    expect(html().querySelector('.side-content h1')?.textContent).toContain(
      sidePanelConfig.title,
    );
    expect(html().querySelector('.side-content p')?.textContent).toContain(
      sidePanelConfig.description,
    );
  });

  it('renders the security list when showSecurityPoints is true', () => {
    expect(html().querySelector('.security-list')).toBeTruthy();
    expect(html().querySelectorAll('.security-item').length).toBe(3);
  });

  it('hides the security list when showSecurityPoints is false', () => {
    const config: AuthSidePanelConfig = {
      image: '/assets/images/sign-in.png',
      title: 'Title',
      description: 'Description',
      showSecurityPoints: false,
    };
    fixture.componentRef.setInput('config', config);
    fixture.detectChanges();

    expect(html().querySelector('.security-list')).toBeNull();
  });

  it('updates the rendered title when the config changes', () => {
    fixture.componentRef.setInput('config', {
      image: '/assets/images/sign-up.png',
      title: 'A New Title',
      description: 'A new description',
    });
    fixture.detectChanges();

    expect(html().querySelector('.side-content h1')?.textContent).toContain('A New Title');
  });
});
