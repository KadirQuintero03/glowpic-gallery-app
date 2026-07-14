import { Component } from "@angular/core";
import { AuthService } from "../../services/auth/auth.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent {
  phone = "";
  errorMessage = "";

  constructor(private authService: AuthService, private router: Router) { }

  onLogin(): void {
    const cleaned = this.phone.trim();

    if (!/^\+?[0-9]{7,15}$/.test(cleaned)) {
      this.errorMessage = "Ingresa un número de teléfono válido (solo dígitos, con o sin +código de país).";
      return;
    }

    this.errorMessage = "";
    this.authService.savePhone(cleaned);
    this.router.navigate(["/home"]);
  }
}
