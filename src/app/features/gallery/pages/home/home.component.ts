import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  // Panel lateral: en escritorio es estático (siempre visible); en móvil
  // (<680px) se abre como drawer con el botón de menú del header.
  configState: boolean = false; //Estado inicial de la configuracion de usuario
  userProfileState = false;
  navOpen = false;
  private routerSub?: Subscription;

  usuario = {
    name: 'Goku',
    email: 'goku@teledrive.com'
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Cierra el drawer al navegar (tocar un enlace del menú o cambiar de
    // ruta) y lo desbloquea del scroll-lock temporal del body.
    this.routerSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.setNavOpen(false));
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    this.setNavOpen(false);
  }

  // Abre/cierra el drawer móvil y bloquea el scroll del body solo mientras
  // dura el drawer (nunca de forma permanente).
  setNavOpen(open: boolean): void {
    this.navOpen = open;
    document.body.classList.toggle('nav-drawer-open', open);
  }
}