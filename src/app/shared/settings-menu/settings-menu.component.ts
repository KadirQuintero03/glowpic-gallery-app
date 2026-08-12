import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ThemeService } from 'src/app/services/theme/theme.service';

/**
 * Botón de ajustes reutilizado en el navbar superior de TeleDrive (dentro de
 * app-header, que persiste en todas las pestañas bajo /home). Despliega un
 * panel pequeño con dos acciones: cambiar entre modo claro/oscuro (aplicado
 * a toda la app mediante ThemeService) y cerrar sesión.
 */
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

  // Cierra el panel al hacer clic fuera de él
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