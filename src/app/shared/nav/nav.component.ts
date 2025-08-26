import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
})
export class NavComponent {
  constructor(private router: Router) {}

  Pictures(): void {
    this.router.navigate(['home/pictures']);
  }

  Albums(): void {
    this.router.navigate(['home/albums']);
  }

  Favorites(): void {
    this.router.navigate(['home/favorites']);
  }

  Archived(): void {
    this.router.navigate(['home/archived']);
  }

  PrivateFolder(): void {
    this.router.navigate(['home/private-folder']);
  }
}
