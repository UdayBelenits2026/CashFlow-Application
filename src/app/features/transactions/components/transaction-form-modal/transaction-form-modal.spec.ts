import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionFormModal } from './transaction-form-modal';

describe('TransactionFormModal', () => {
  let component: TransactionFormModal;
  let fixture: ComponentFixture<TransactionFormModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionFormModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionFormModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
