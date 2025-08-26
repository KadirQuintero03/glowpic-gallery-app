import { Component } from "@angular/core";
import { AuthService } from "../../services/auth/auth.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.css"],
})
export class RegisterComponent {
  username = "";
  email = "";
  password = "";
  showPassword = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  constructor(private authService: AuthService, private router: Router) {}

  onRegister() {
    this.authService
      .register(this.username, this.email, this.password)
      .subscribe({
        next: (res) => {
          alert("El usuario" + this.username + "ha sido creado exitosamente");
          this.authService.saveToken(res.access_token);
          this.router.navigate(["/login"]); // redirige a donde quieras
        },
        error: (err) => {
          alert("El usuario ya se encuentra registrado");
          console.error("Error de registro", err);
        },
      });
  }
}
