import { unsavedChangesGuard, UnsavedChangesAware } from './unsaved-changes.guard';
import { TestBed } from '@angular/core/testing';

// The guard is a pure CanDeactivateFn but may be called via injection context.
function invokeGuard(component: UnsavedChangesAware): boolean | Promise<boolean> {
  return TestBed.runInInjectionContext(() =>
    (unsavedChangesGuard as any)(component, null, null, null)
  );
}

describe('unsavedChangesGuard', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should allow navigation immediately when there are no unsaved changes', () => {
    const component: UnsavedChangesAware = {
      canLeave: () => true,
      confirmLeave: () => Promise.resolve(false),
    };
    expect(invokeGuard(component)).toBeTrue();
  });

  it('should delegate to confirmLeave when there are unsaved changes', async () => {
    const component: UnsavedChangesAware = {
      canLeave: () => false,
      confirmLeave: jasmine.createSpy('confirmLeave').and.resolveTo(true),
    };
    const result = await invokeGuard(component);
    expect(component.confirmLeave).toHaveBeenCalled();
    expect(result).toBeTrue();
  });

  it('should block navigation when the user cancels the confirm prompt', async () => {
    const component: UnsavedChangesAware = {
      canLeave: () => false,
      confirmLeave: () => Promise.resolve(false),
    };
    expect(await invokeGuard(component)).toBeFalse();
  });
});
