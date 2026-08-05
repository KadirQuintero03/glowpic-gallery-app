import { Component } from "@angular/core";
import { AuthService } from "../../services/auth/auth.service";
import { Router } from "@angular/router";

type LoginStep = "phone" | "code";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent {
  step: LoginStep = "phone";

  phone = "";
  code = "";

  errorMessage = "";
  infoMessage = "";
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  // Paso 1: valida el formato del teléfono y le pide al backend que envíe
  // el código de acceso por Telegram.
  onRequestCode(): void {
    const cleaned = this.phone.trim();

    if (!/^\+?[0-9]{7,15}$/.test(cleaned)) {
      this.errorMessage = "Ingresa un número de teléfono válido (solo dígitos, con o sin +código de país).";
      return;
    }

    this.errorMessage = "";
    this.infoMessage = "";
    this.loading = true;

    this.authService.requestAccessCode(cleaned).subscribe({
      next: (res) => {
        this.loading = false;
        this.step = "code";
        this.infoMessage = res.sentTo
          ? `Te enviamos un código de 4 dígitos por Telegram al número terminado en ${res.sentTo.slice(-4)}.`
          : "Te enviamos un código de 4 dígitos por Telegram.";
      },
      error: (err: Error) => {
        this.loading = false;
        this.errorMessage = err.message;
      },
    });
  }

  // Paso 2: verifica el código de 4 dígitos ingresado por el usuario.
  onVerifyCode(): void {
    const cleanedCode = this.code.trim();

    if (!/^[0-9]{4}$/.test(cleanedCode)) {
      this.errorMessage = "El código debe tener 4 dígitos.";
      return;
    }

    this.errorMessage = "";
    this.loading = true;

    this.authService.verifyAccessCode(this.phone.trim(), cleanedCode).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(["/home"]);
      },
      error: (err: Error) => {
        this.loading = false;
        this.errorMessage = err.message;
      },
    });
  }

  // Permite volver a corregir el número de teléfono si el usuario se
  // equivocó, sin tener que recargar la página.
  backToPhone(): void {
    this.step = "phone";
    this.code = "";
    this.errorMessage = "";
    this.infoMessage = "";
  }
}
