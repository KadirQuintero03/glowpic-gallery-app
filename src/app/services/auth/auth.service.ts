import { Injectable } from "@angular/core";

const PHONE_KEY = "glowpic_phone";

@Injectable({
  providedIn: "root",
})
export class AuthService {

  // Guarda el número de teléfono ingresado
  savePhone(phone: string): void {
    localStorage.setItem(PHONE_KEY, phone);
  }

  // Obtiene el número de teléfono guardado
  getPhone(): string | null {
    return localStorage.getItem(PHONE_KEY);
  }

  // true si ya hay un número guardado (sesión "iniciada")
  isLoggedIn(): boolean {
    return !!this.getPhone();
  }

  // Cierra sesión: elimina el número guardado
  logout(): void {
    localStorage.removeItem(PHONE_KEY);
  }
}
