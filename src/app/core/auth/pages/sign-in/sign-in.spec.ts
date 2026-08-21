import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignInComponent } from './sign-in';
import { provideStore } from '@ngrx/store';
import { authReducer } from '../../store/reducer/auth.reducer';
import { provideRouter } from '@angular/router';

describe('SignIn', () => {
  let component: SignInComponent;
  let fixture: ComponentFixture<SignInComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignInComponent],
      providers: [provideStore({ auth: authReducer }), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
