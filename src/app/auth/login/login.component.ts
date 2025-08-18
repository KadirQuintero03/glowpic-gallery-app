import { Component } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  emailOrUsername = '';
  password = '';
  showPassword = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  constructor(private authService: AuthService, private router: Router) {}

  // Maneja el login
  onLogin() {
    this.authService.login(this.emailOrUsername, this.password).subscribe({
      next: (res) => {
        const token = res.access_token || res.token; // Adapta según el campo real
        if (token) {
          this.authService.saveToken(token);
          this.router.navigate(['/home']);
        } else {
          alert('Login fallido: No se recibió un token válido.');
        }
      },
      error: (err) => {
        console.error('Error de login:', err);
        alert(`Error de login: ${err.error?.message || 'Credenciales incorrectas'}`);
      },
    });
  }
}
