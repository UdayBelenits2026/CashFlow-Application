import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountsCategories } from './accounts-categories';

describe('AccountsCategories', () => {
  let component: AccountsCategories;
  let fixture: ComponentFixture<AccountsCategories>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountsCategories]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountsCategories);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
