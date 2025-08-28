import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { of } from "rxjs";

interface TokenResponse {
  token?: string; // Si el backend usa "token" en lugar de "access_token"
  token_type: string;
  access_token: string; // Mantén esto si también es posible
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private baseUrl = "https://storagemultimedia.onrender.com/";

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<TokenResponse> {
    return this.http
      .post<TokenResponse>(`${this.baseUrl}api/user/login`, {
        email,
        password,
      })
      .pipe(
        tap(),
        catchError((error) => {
          console.error("Error de login:", error);
          alert("Error de login, por favor verifica tus credenciales.");
          return of({ access_token: "", token_type: "" } as TokenResponse);
        })
      );
  }

  // Registro de usuario
  register(
    name: string,
    email: string,
    password: string
  ): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.baseUrl}api/user/register`, {
      name,
      email,
      password,
    });
  }

  // Guardar token en localStorage
  saveToken(token: string) {
    localStorage.setItem("access_token", token);
  }

  // Obtener token del localStorage
  getToken(): string | null {
    return localStorage.getItem("access_token");
  }

  // Logout: eliminar token
  logout() {
    localStorage.removeItem("access_token");
  }
}
