import { Component, inject } from '@angular/core';
import { LayoutService } from '../services/layout';

@Component({
  selector: 'app-cf-mainnavbar',
  imports: [],
  templateUrl: './mainnavbar.html',
  styleUrl: './mainnavbar.scss',
})
export class Mainnavbar {
  readonly layoutService = inject(LayoutService);
  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
    this.layoutService.closeMobileMenu();
  }
  toggleMobileMenu(): void {
    this.layoutService.toggleMobileMenu();
  }
  refresh(): void {
    window.location.reload();
  }
}