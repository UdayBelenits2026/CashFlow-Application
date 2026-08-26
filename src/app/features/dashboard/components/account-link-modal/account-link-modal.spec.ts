import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountLinkModalComponent } from './account-link-modal';

describe('AccountLinkModalComponent', () => {
  let component: AccountLinkModalComponent;
  let fixture: ComponentFixture<AccountLinkModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountLinkModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountLinkModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component with empty errors initially', () => {
    expect(component).toBeTruthy();
    expect(component.isSubmitted()).toBeFalse();
    expect(Object.keys(component.errors()).length).toBe(0);
  });

  it('should validate bank account required fields on submit', () => {
    component.onSubmit();
    expect(component.isSubmitted()).toBeTrue();
    expect(component.errors().bankName).toBe('Bank name is required');
    expect(component.errors().accountType).toBe('Account type is required');
    expect(component.errors().routingNumber).toBe('Routing number is required');
  });

  it('should validate routing number format', () => {
    component.bankName.set('chase');
    component.accountType.set('checking');
    component.routingNumber.set('1234');
    component.onSubmit();
    expect(component.errors().routingNumber).toBe('Routing number must be 9 digits');
  });

  it('should validate nickname character limit', () => {
    component.bankNickname.set('A'.repeat(35));
    expect(component.isNicknameExceeded()).toBeTrue();
    component.onSubmit();
    expect(component.errors().nickname).toBe('Account nickname cannot exceed 30 characters');
  });

  it('should emit connectAccount payload when valid', () => {
    spyOn(component.connectAccount, 'emit');
    component.bankName.set('chase');
    component.accountType.set('checking');
    component.routingNumber.set('123456789');
    component.accountNumber.set('9876543210');
    component.bankNickname.set('Main Checking');

    component.onSubmit();

    expect(component.connectAccount.emit).toHaveBeenCalledWith({
      linkType: 'bank',
      bankAccount: {
        bankName: 'chase',
        accountType: 'checking',
        routingNumber: '123456789',
        accountNumber: '9876543210',
        nickname: 'Main Checking',
      },
    });
  });
});
