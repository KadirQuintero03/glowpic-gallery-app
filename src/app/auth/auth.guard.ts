import { Injectable } from "@angular/core";
import { CanActivate, Router, UrlTree } from "@angular/router";
import { AuthService } from "../services/auth/auth.service";

/**
 * Protege las rutas de "/home" (galería de archivos): solo deja pasar a
 * usuarios que completaron el login en dos pasos (teléfono + código de
 * Telegram verificado). Sin esto, cualquiera podía navegar directo a
 * /home/explorer sin haber iniciado sesión.
 */
@Injectable({ providedIn: "root" })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (this.authService.isLoggedIn()) {
      return true;
    }
    return this.router.createUrlTree(["/login"]);
  }
}
