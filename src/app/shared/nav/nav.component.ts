import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';

/**
 * Panel lateral estático de TeleDrive. Contiene la navegación principal
 * ("Inicio", "Mi Galería"), las secciones por categoría ("Imágenes",
 * "Video", "Audio", "Documentos") y el botón de "Cerrar sesión".
 * Las categorías navegan al explorador pasando la carpeta como parámetro
 * de ruta; el item activo se resalta según la URL actual.
 */
@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
})
export class NavComponent implements OnInit, OnDestroy {
  active = '';
  private navSub?: Subscription;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.syncActive();
    this.navSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.syncActive());
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
  }

  // Resalta el item del sidebar correspondiente a la ruta actual.
  private syncActive(): void {
    if (!this.router.url.startsWith('/home') && !this.router.url.startsWith('/galeria')) {
      this.active = '';
      return;
    }

    const q = this.router.parseUrl(this.router.url).queryParamMap;
    const path = q.get('path') ?? '';
    const search = q.get('search') ?? '';

    if (!path || search) {
      this.active = 'galeria';
      return;
    }
    this.active = this.keyForPath(path);
  }

  // Normaliza el nombre de la carpeta (ignora tildes y mayúsculas) para
  // detectar la categoría, aunque el backend guarde "Imagenes" sin tilde.
  private keyForPath(path: string): string {
    const norm = path.toLowerCase().replace(/í/g, 'i');
    if (norm.startsWith('imagen')) return 'imagenes';
    if (norm.startsWith('video')) return 'video';
    if (norm.startsWith('audio')) return 'audio';
    if (norm.startsWith('document')) return 'documentos';
    return 'galeria';
  }

  goToLanding(): void {
    this.router.navigate(['/mainpage']);
  }

  goToGallery(): void {
    this.router.navigate(['/home/explorer'], { queryParams: { path: null, search: null } });
  }

  openCategory(folder: string): void {
    this.router.navigate(['/home/explorer'], { queryParams: { path: folder, search: null } });
  }

  get userPhone(): string {
    return this.authService.getPhone() ?? '';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}