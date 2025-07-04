import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

interface TokenResponse {
  token?: string; // Si el backend usa "token" en lugar de "access_token"
  token_type: string;
  access_token: string; // Mantén esto si también es posible
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:3100'; // Cambia por tu URL real

  constructor(private http: HttpClient) {}

  // Login método
  login(emailOrUsername: string, password: string): Observable<TokenResponse> {
    const body = new URLSearchParams();
    body.set('username', emailOrUsername);
    body.set('password', password);

    return this.http.post<TokenResponse>(`${this.baseUrl}/api/auth/login`, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).pipe(
      tap(), // Agrega un log para verificar la respuesta
      catchError((error) => {
        console.error('Error de login:', error);
        alert('Error de login, por favor verifica tus credenciales.');
        return of({ access_token: '', token_type: '' } as TokenResponse); // Retorna un valor vacío si hay error
      })
    );
  }

  // Registro de usuario
  register(emailOrUsername: string, password: string): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.baseUrl}/api/auth/register`, {
      emailOrUsername,
      password,
    });
  }

  // Guardar token en localStorage
  saveToken(token: string) {
    localStorage.setItem('access_token', token);
  }

  // Obtener token del localStorage
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Logout: eliminar token
  logout() {
    localStorage.removeItem('access_token');
  }
}
