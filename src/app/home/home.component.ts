import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  // El panel lateral es estático (siempre visible) en TeleDrive.
  configState: boolean = false; //Estado inicial de la configuracion de usuario
  userProfileState = false;

  usuario = {
    name: 'Goku',
    email: 'goku@teledrive.com'
  };
}