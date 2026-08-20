import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sidenavbar } from './sidenavbar';
import { provideStore } from '@ngrx/store';
import { authReducer } from '../../auth/store/auth.reducer';
import { provideRouter } from '@angular/router';

describe('Sidenavbar', () => {
  let component: Sidenavbar;
  let fixture: ComponentFixture<Sidenavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sidenavbar],
      providers: [provideStore({ auth: authReducer }), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sidenavbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
