import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  navState: boolean = true; // Estado inicial de la navegación
  configState: boolean = false; //Estado inicial de la configuracion de usuario
  userProfileState = false;

  usuario = {
    name: 'Goku',
    email: 'goku@glowpic.com'
  };
}
