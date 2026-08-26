import { ComponentFixture, TestBed } from '@angular/core';
import { ProfileSetupModalComponent } from './profile-setup-modal';

describe('ProfileSetupModalComponent', () => {
  let component: ProfileSetupModalComponent;
  let fixture: ComponentFixture<ProfileSetupModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileSetupModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileSetupModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should validate full name and email format', () => {
    component.fullName.set('');
    component.email.set('invalid-email');
    component.onSubmit();
    expect(component.errors().fullName).toBe('Full name is required');
    expect(component.errors().email).toBe('Please enter a valid email address');
  });

  it('should emit saveProfile when valid', () => {
    spyOn(component.saveProfile, 'emit');
    component.fullName.set('John Doe');
    component.email.set('john@example.com');
    component.financialGoal.set('track_spending');
    component.monthlyIncomeGoal.set(5000);

    component.onSubmit();

    expect(component.saveProfile.emit).toHaveBeenCalledWith({
      fullName: 'John Doe',
      email: 'john@example.com',
      currency: 'INR',
      financialGoal: 'track_spending',
      monthlyIncomeGoal: 5000,
    });
  });
});
