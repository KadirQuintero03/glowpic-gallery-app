import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "@core/services/auth/auth.service";

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

  backToPhone(): void {
    this.step = "phone";
    this.code = "";
    this.errorMessage = "";
    this.infoMessage = "";
  }

  backHome(): void {
    this.router.navigate(["/"]);
  }
}
