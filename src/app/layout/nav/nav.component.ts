import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { AuthService } from '@core/services/auth/auth.service';
import { UsageService } from '@core/services/usage/usage.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
})
export class NavComponent implements OnInit, OnDestroy {
  @Input() open = false;
  @Output() closeNav = new EventEmitter<void>();

  active = '';
  private navSub?: Subscription;

  constructor(private router: Router, private authService: AuthService, private usageService: UsageService) {}

  ngOnInit(): void {
    this.syncActive();
    this.navSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.syncActive());
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
  }

  private syncActive(): void {
    if (!this.router.url.startsWith('/home') && !this.router.url.startsWith('/galeria')) {
      this.active = '';
      return;
    }

    const q = this.router.parseUrl(this.router.url).queryParamMap;
    const view = q.get('view') ?? '';
    const path = q.get('path') ?? '';
    const search = q.get('search') ?? '';

    if (view === 'gallery') {
      this.active = 'galeria';
      return;
    }
    if (!path || search) {
      this.active = 'inicio';
      return;
    }
    this.active = this.keyForPath(path);
  }

  private keyForPath(path: string): string {
    const norm = path.toLowerCase().replace(/í/g, 'i');
    if (norm.startsWith('imagen')) return 'imagenes';
    if (norm.startsWith('video')) return 'video';
    if (norm.startsWith('audio')) return 'audio';
    if (norm.startsWith('document')) return 'documentos';
    return 'inicio';
  }

  goToHome(): void {
    this.router.navigate(['/home/explorer'], {
      queryParams: { path: null, search: null, view: null },
    });
    this.closeNav.emit();
  }

  goToGallery(): void {
    this.router.navigate(['/home/explorer'], {
      queryParams: { view: 'gallery', path: null, search: null },
    });
    this.closeNav.emit();
  }

  openCategory(folder: string): void {
    this.router.navigate(['/home/explorer'], {
      queryParams: { path: folder, search: null, view: null },
    });
    this.closeNav.emit();
  }

  close(): void {
    this.closeNav.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) {
      this.close();
    }
  }

  get username(): string {
    return this.authService.getUsername() ?? '';
  }

  get avatar(): string {
    const name = this.username.trim();
    if (!name) return 'TD';
    return name.slice(0, 2).toUpperCase();
  }

  get usageLabel(): string {
    return this.usageService.sizeLabel;
  }

  get usagePercent(): number {
    return this.usageService.percent;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}