import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, Observable, throwError } from "rxjs";
import { environment } from "src/app/environments/environment";
import { AuthService } from "src/app/services/auth/auth.service";

export interface ExplorerEntry {
    name: string;
    type: "directory" | "file";
    path: string;
    size?: number;
    modifiedAt?: number;
    // Dimensiones opcionales del archivo (si el backend llega a reportarlas
    // en el futuro); mientras tanto GlowPic las calcula en el cliente al
    // generar la miniatura y las guarda en ThumbnailService.
    width?: number;
    height?: number;
}

export interface ExplorerResponse {
    currentPath: string;
    entries: ExplorerEntry[];
}

@Injectable({
    providedIn: "root",
})
export class ExplorerService {
    private baseURL = environment.apiUrl; // ej: http://localhost:3050/

    constructor(private http: HttpClient, private authService: AuthService) { }

    // Lista el contenido (carpetas + archivos) de una ruta relativa DENTRO
    // de la carpeta del usuario logueado (owner). El backend valida que
    // nunca se pueda salir de esa carpeta, así cada usuario solo ve la suya.
    listDirectory(path: string = ""): Observable<ExplorerResponse> {
        const owner = this.requireOwner();
        const params = new HttpParams().set("path", path).set("owner", owner);
        return this.http
            .get<ExplorerResponse>(`${this.baseURL}explorer`, { params })
            .pipe(catchError((err) => throwError(() => this.toErrorMessage(err))));
    }

    // URL directa para ver/descargar un archivo, también restringida al owner.
    getFileUrl(path: string): string {
        const owner = this.authService.getOwner() ?? "";
        const params = new HttpParams().set("path", path).set("owner", owner);
        return `${this.baseURL}explorer/file?${params.toString()}`;
    }

    private requireOwner(): string {
        const owner = this.authService.getOwner();
        if (!owner) {
            throw new Error("No hay una sesión activa. Inicia sesión de nuevo.");
        }
        return owner;
    }

    private toErrorMessage(err: any): Error {
        if (err?.error?.error) {
            return new Error(err.error.error);
        }
        if (err?.status === 0) {
            return new Error("No se pudo conectar con el servidor. Verifica tu conexión.");
        }
        return new Error("No se pudo cargar el directorio.");
    }
}
