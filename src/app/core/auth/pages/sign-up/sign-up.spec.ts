import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignUp } from './sign-up';
import { provideStore } from '@ngrx/store';
import { authReducer } from '../../store/reducer/auth.reducer';
import { provideRouter } from '@angular/router';

describe('SignUp', () => {
  let component: SignUp;
  let fixture: ComponentFixture<SignUp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignUp],
      providers: [provideStore({ auth: authReducer }), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignUp);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
