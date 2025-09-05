import { Component } from "@angular/core";
import { AuthService } from "../../services/auth/auth.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.css"],
})
export class RegisterComponent {
  name = "";
  email = "";
  password = "";
  showPassword = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  constructor(private authService: AuthService, private router: Router) {}

  onRegister() {
    this.authService.register(this.name, this.email, this.password).subscribe({
      next: (res) => {
        alert("El usuario " + this.name + " ha sido creado exitosamente");
        this.authService.saveToken(res.access_token);
        this.router.navigate(["/login"]);
      },
      error: (err) => {
        console.error("Error de registro:", err);
        alert("Ocurrió un error, revisa la consola");
      },
    });
  }
}
