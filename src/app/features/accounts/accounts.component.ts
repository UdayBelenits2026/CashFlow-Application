import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Shell component that hosts the accounts feature routes in a nested outlet.
@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />'
})
export class AccountsComponent {}
