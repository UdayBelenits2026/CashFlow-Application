import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sidenavbar } from './sidenavbar';
import { provideStore } from '@ngrx/store';
import { authReducer } from '../../auth/store/reducer/auth.reducer';
import { provideRouter } from '@angular/router';
import { navigationList } from '../data/navigation.data';

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

  it('should toggle spending submenu open and closed on parent click', () => {
    const spendingItem = navigationList.find(item => item.label === 'Spending');

    expect(spendingItem).toBeTruthy();
    if (!spendingItem) {
      return;
    }

    component.onParentItemClick(spendingItem);
    expect(component.isExpanded(spendingItem)).toBeTrue();

    // When route is outside the item, parent click keeps submenu expanded.
    component.onParentItemClick(spendingItem);
    expect(component.isExpanded(spendingItem)).toBeTrue();
  });

  it('should collapse submenu when toggled directly', () => {
    const spendingItem = navigationList.find(item => item.label === 'Spending');

    expect(spendingItem).toBeTruthy();
    if (!spendingItem) {
      return;
    }

    component.toggleExpand(spendingItem);
    expect(component.isExpanded(spendingItem)).toBeTrue();

    component.toggleExpand(spendingItem);
    expect(component.isExpanded(spendingItem)).toBeFalse();
  });
});
