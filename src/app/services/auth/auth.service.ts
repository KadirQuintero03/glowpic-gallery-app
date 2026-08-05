import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, map, Observable, throwError } from "rxjs";
import { environment } from "src/app/environments/environment";

const PHONE_KEY = "glowpic_phone";
const OWNER_KEY = "glowpic_owner";

interface RequestCodeResponse {
  success: boolean;
  sentTo?: string;
}

interface VerifyCodeResponse {
  success: boolean;
  owner?: string;
}

/**
 * Maneja el login de GlowPic con verificación en dos pasos vía Telegram:
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
          this.savePhone(phone);
          this.saveOwner(res.owner);
          return res.owner;
        }),
        catchError((err) => throwError(() => this.toErrorMessage(err)))
      );
  }

  // Guarda el número de teléfono ingresado
  savePhone(phone: string): void {
    localStorage.setItem(PHONE_KEY, phone);
  }

  // Obtiene el número de teléfono guardado
  getPhone(): string | null {
    return localStorage.getItem(PHONE_KEY);
  }

  // Guarda el "owner" (carpeta) asignado tras verificar el código. Es el
  // dato que determina qué carpeta puede ver este usuario en GlowPic.
  private saveOwner(owner: string): void {
    localStorage.setItem(OWNER_KEY, owner);
  }

  getOwner(): string | null {
    return localStorage.getItem(OWNER_KEY);
  }

  // true solo si el usuario completó el login en dos pasos (teléfono +
  // código verificado por Telegram). Tener solo el teléfono NO cuenta como
  // sesión iniciada.
  isLoggedIn(): boolean {
    return !!this.getOwner();
  }

  // Cierra sesión: elimina el teléfono y el owner guardados
  logout(): void {
    localStorage.removeItem(PHONE_KEY);
    localStorage.removeItem(OWNER_KEY);
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
