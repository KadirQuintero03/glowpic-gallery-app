import { Component } from "@angular/core";
import { AuthService } from "../../services/auth/auth.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent {
  email = "";
  password = "";
  showPassword = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    console.log("Intentando iniciar sesión con:", this.email, this.password);
    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        const token = res.access_token || res.token;
        this.router.navigate(["/home"]);
        if (token) {
          this.authService.saveToken(token);
          this.router.navigate(["/home"]);
        }
      },
    });
  }
}
