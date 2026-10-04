import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';
import { ThemeService } from '@core/services/theme/theme.service';

@Component({
  selector: 'app-settings-menu',
  templateUrl: './settings-menu.component.html',
  styleUrls: ['./settings-menu.component.css'],
})
export class SettingsMenuComponent {
  open = false;

  constructor(
    private themeService: ThemeService,
    private authService: AuthService,
    private router: Router
  ) { }

  get isLight(): boolean {
    return this.themeService.getTheme() === 'light';
  }

  toggleOpen(): void {
    this.open = !this.open;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.open = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.settings-menu-wrapper')) {
      this.open = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.open = false;
  }
}