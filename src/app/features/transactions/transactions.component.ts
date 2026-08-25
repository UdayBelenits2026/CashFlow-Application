import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Shell component that hosts the transactions feature routes in a nested outlet.
@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />'
})
export class TransactionsComponent {}
