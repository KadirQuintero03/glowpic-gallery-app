import { Component } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  emailOrUsername='';
  password='';

  constructor(private authService: AuthService, private router: Router) {}

  onRegister() {
    this.authService.register(this.emailOrUsername, this.password).subscribe({
      next: (res) => {
        alert("Usuario "+ this.emailOrUsername + " creado exitosamente")
        this.authService.saveToken(res.access_token);
        this.router.navigate(['/login']); // redirige a donde quieras
      },
      error: (err) => {
        alert("El usuario ya se encuentra registrado")
        console.error('Error de registro', err);
      },
    });
  }
}
