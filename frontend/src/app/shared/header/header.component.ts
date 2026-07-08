import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  // Estado para el nav
  state: boolean = true;
  @Output() changeStateNav = new EventEmitter<boolean>();

  stateControlNav() {
    this.state = !this.state;
    this.changeStateNav.emit(this.state);
  }

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

  constructor(private router: Router) { }

  Exit(): void {
    this.router.navigate(['/login']);
  }
}