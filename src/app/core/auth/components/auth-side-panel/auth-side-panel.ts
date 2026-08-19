import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { AuthSidePanelConfig } from '../../models/auth.models';

@Component({
  selector: 'app-cf-auth-side-panel',

  standalone: true,

  templateUrl: './auth-side-panel.html',

  styleUrl: './auth-side-panel.scss',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthSidePanelComponent {
  @Input({ required: true })
  config!: AuthSidePanelConfig;
}
