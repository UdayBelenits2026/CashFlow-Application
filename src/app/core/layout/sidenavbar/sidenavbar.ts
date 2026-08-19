import { Component } from '@angular/core';
import { navigationList } from '../data/navigation.data';
import { RouterLink,RouterLinkActive } from '@angular/router';
@Component({
  selector: 'app-cf-sidenavbar',
  imports: [RouterLink,RouterLinkActive],
  templateUrl: './sidenavbar.html',
  styleUrl: './sidenavbar.scss',
})
export class Sidenavbar {
  readonly navigationItems=navigationList;
}
