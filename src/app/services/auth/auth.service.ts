import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, map, Observable, throwError } from "rxjs";
import { environment } from "src/app/environments/environment";

const PHONE_KEY = "teledrive_phone";
const OWNER_KEY = "teledrive_owner";
const TOKEN_KEY = "teledrive_token";

interface RequestCodeResponse {
  success: boolean;
  sentTo?: string;
}

interface VerifyCodeResponse {
  success: boolean;
  owner?: string;
  // Token opcional (p. ej. JWT) que el backend puede devolver tras validar
  // el código. Se guarda en sessionStorage y se adjunta a cada petición
  // vía AuthInterceptor (nunca viaja por la URL, contrariamente a lo que
  // pasaba con el número/token expuesto en parámetros de querystring).
  token?: string;
}

/**
 * Maneja el login de TeleDrive con verificación en dos pasos vía Telegram:
 * 1) requestAccessCode(phone): el backend busca el teléfono entre los
 *    usuarios vinculados por el bot de Telegram (/web) y, si existe, le
 *    envía un código de 4 dígitos por Telegram.
 * 2) verifyAccessCode(phone, code): si el código coincide, el backend
 *    devuelve el "owner" (nombre de carpeta) del usuario, que es lo único
 *    que se guarda localmente y lo que se usa para restringir el explorador
 *    de archivos a la carpeta que le corresponde a esa persona.
 */
@Injectable({
  providedIn: "root",
})
export class AuthService {
  private baseURL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  requestAccessCode(phone: string): Observable<RequestCodeResponse> {
    return this.http
      .post<RequestCodeResponse>(`${this.baseURL}auth/request-code`, { phone })
      .pipe(catchError((err) => throwError(() => this.toErrorMessage(err))));
  }

  verifyAccessCode(phone: string, code: string): Observable<string> {
    return this.http
      .post<VerifyCodeResponse>(`${this.baseURL}auth/verify-code`, { phone, code })
      .pipe(
        map((res) => {
          if (!res.owner) {
            throw new Error("El servidor no devolvió un usuario válido.");
          }
          if (res.token) {
            this.saveToken(res.token);
          }
          this.savePhone(phone);
          this.saveOwner(res.owner);
          return res.owner;
        }),
        catchError((err) => throwError(() => this.toErrorMessage(err)))
      );
  }

  // La sesión se guarda en sessionStorage (no en localStorage) para que
  // desaparezca al cerrar el navegador y reducir la superficie de ataque
  // frente a un token persistido sin necesidad.
  savePhone(phone: string): void {
    sessionStorage.setItem(PHONE_KEY, phone);
  }

  // Obtiene el número de teléfono guardado
  getPhone(): string | null {
    return sessionStorage.getItem(PHONE_KEY);
  }

  // Guarda el "owner" (carpeta) asignado tras verificar el código. Es el
  // dato que determina qué carpeta puede ver este usuario en TeleDrive.
  private saveOwner(owner: string): void {
    sessionStorage.setItem(OWNER_KEY, owner);
  }

  getOwner(): string | null {
    return sessionStorage.getItem(OWNER_KEY);
  }

  // Nombre de usuario para mostrar en la interfaz. El "owner" devuelto por
  // el backend tras verificar el código es la identidad (nombre de carpeta)
  // vinculada al teléfono, así que se usa como nombre visible del usuario.
  getUsername(): string | null {
    return this.getOwner();
  }

  // Guarda el token de sesión (JWT si el backend lo emite) de forma segura.
  // Nunca se expone en la URL; AuthInterceptor lo adjunta como cabecera.
  saveToken(token: string): void {
    sessionStorage.setItem(TOKEN_KEY, token);
  }

  getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  // true solo si el usuario completó el login en dos pasos (teléfono +
  // código verificado por Telegram). Tener solo el teléfono NO cuenta como
  // sesión iniciada.
  isLoggedIn(): boolean {
    return !!this.getOwner();
  }

  // Cierra sesión: elimina el teléfono, el owner y el token guardados
  logout(): void {
    sessionStorage.removeItem(PHONE_KEY);
    sessionStorage.removeItem(OWNER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  }

  private toErrorMessage(err: HttpErrorResponse): Error {
    if (err.error?.error) {
      return new Error(err.error.error);
    }
    if (err.status === 0) {
      return new Error("No se pudo conectar con el servidor. Verifica tu conexión.");
    }
    return new Error("Ocurrió un error inesperado. Intenta de nuevo.");
  }
}