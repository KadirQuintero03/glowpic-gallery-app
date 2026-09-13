import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ThemeService } from 'src/app/services/theme/theme.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  // Texto de la barra de búsqueda global
  searchTerm = '';

  // Estado para configuración
  stateConfigTrue: boolean = true;
  @Output() StateConfigTrue = new EventEmitter<boolean>();

  changeStateConfigTrue() {
    this.StateConfigTrue.emit(this.stateConfigTrue);
  }

  // Mostrar perfil de usuario
  @Output() showUserProfile = new EventEmitter<boolean>();

  openUserProfile() {
    this.showUserProfile.emit(true);
  }

  private routeSub?: Subscription;

  constructor(private router: Router, private route: ActivatedRoute, private themeService: ThemeService) {}

  ngOnInit(): void {
    // Mantiene la barra sincronizada con la búsqueda activa del explorador
    this.routeSub = this.route.queryParamMap.subscribe((params) => {
      const search = params.get('search') ?? '';
      if (search !== this.searchTerm) {
        this.searchTerm = search;
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  goToGallery(): void {
    this.router.navigate(['/home/explorer'], { queryParams: { path: null } });
  }

  get isLight(): boolean {
    return this.themeService.getTheme() === 'light';
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  // Sanitiza la consulta antes de enviarla: elimina caracteres peligrosos
  // para evitar inyección HTML/XSS y acorta el texto para evitar abusos.
  private sanitizeQuery(raw: string): string {
    return raw
      .replace(/[<>"'&]/g, '')
      .replace(/[\u0000-\u001f\u007f]/g, '')
      .trim()
      .slice(0, 120);
  }

  onSearch(): void {
    const query = this.sanitizeQuery(this.searchTerm);
    this.searchTerm = query;
    this.router.navigate(['/home/explorer'], {
      queryParams: { search: query || null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.onSearch();
  }

  Exit(): void {
    this.router.navigate(['/login']);
  }
}