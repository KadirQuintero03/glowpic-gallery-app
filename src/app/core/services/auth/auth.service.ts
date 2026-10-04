import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, map, Observable, throwError } from "rxjs";
import { environment } from "@env/environment";

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
  token?: string;
}

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

  savePhone(phone: string): void {
    sessionStorage.setItem(PHONE_KEY, phone);
  }

  getPhone(): string | null {
    return sessionStorage.getItem(PHONE_KEY);
  }

  private saveOwner(owner: string): void {
    sessionStorage.setItem(OWNER_KEY, owner);
  }

  getOwner(): string | null {
    return sessionStorage.getItem(OWNER_KEY);
  }

  getUsername(): string | null {
    return this.getOwner();
  }

  saveToken(token: string): void {
    sessionStorage.setItem(TOKEN_KEY, token);
  }

  getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getOwner();
  }

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