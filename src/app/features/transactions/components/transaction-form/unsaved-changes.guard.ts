import { CanDeactivateFn } from '@angular/router';

// Contract a routed component implements to participate in the unsaved-changes guard.
export interface UnsavedChangesAware {
  canLeave: () => boolean;
  confirmLeave: () => Promise<boolean>;
}

// Prompts the user before leaving a form with unsaved changes.
export const unsavedChangesGuard: CanDeactivateFn<UnsavedChangesAware> = (component) =>
  component.canLeave() ? true : component.confirmLeave();
