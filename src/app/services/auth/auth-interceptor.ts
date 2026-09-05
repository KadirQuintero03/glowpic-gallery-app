import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AuthService } from "./auth.service";

/**
 * Adjunta el token de sesión (JWT, guardado en sessionStorage) como cabecera
 * Authorization en cada petición HTTP. Garantiza que el token nunca viaje en
 * la URL ni en parámetros de querystring, y que todas las peticiones pasen
 * por la API intermedia (nunca se usa el token del bot de Telegram).
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();
    if (token) {
      const cloned = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
      return next.handle(cloned);
    }
    return next.handle(req);
  }
}