import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cf-mainnavbar',
  imports: [],
  templateUrl: './mainnavbar.html',
  styleUrl: './mainnavbar.scss',
})
export class Mainnavbar{
  isSidebarOpen = false;

  constructor(private readonly router: Router) {}

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  refresh(): void {
    window.location.reload();
  }

  logout(): void {
    // Add logout logic later
    this.router.navigate(['/']);
  }
}