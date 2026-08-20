import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Sidenavbar } from '../sidenavbar/sidenavbar';
import { Mainnavbar } from '../mainnavbar/mainnavbar';
import { LayoutService } from '../services/layout';

@Component({
  selector: 'app-cf-main-layout',
  imports: [
    RouterOutlet,
    Sidenavbar,
    Mainnavbar,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  readonly layoutService = inject(LayoutService);
}