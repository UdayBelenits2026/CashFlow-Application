import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mainnavbar } from './mainnavbar';

describe('Mainnavbar', () => {
  let component: Mainnavbar;
  let fixture: ComponentFixture<Mainnavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mainnavbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Mainnavbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
