import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, Observable, throwError } from "rxjs";
import { environment } from "@env/environment";
import { ExplorerEntry, ExplorerResponse } from "@core/models/explorer.model";
import { AuthService } from "@core/services/auth/auth.service";

export { ExplorerEntry, ExplorerResponse } from "@core/models/explorer.model";

@Injectable({
    providedIn: "root",
})
export class ExplorerService {
    private baseURL = environment.apiUrl;

    constructor(private http: HttpClient, private authService: AuthService) { }

    listDirectory(path: string = ""): Observable<ExplorerResponse> {
        const owner = this.requireOwner();
        const params = new HttpParams().set("path", path).set("owner", owner);
        return this.http
            .get<ExplorerResponse>(`${this.baseURL}explorer`, { params })
            .pipe(catchError((err: unknown) => throwError(() => this.toErrorMessage(err))));
    }

    getFileUrl(path: string): string {
        const owner = this.authService.getOwner() ?? "";
        const params = new HttpParams().set("path", path).set("owner", owner);
        return `${this.baseURL}explorer/file?${params.toString()}`;
    }

    deleteFile(path: string): Observable<void> {
        const owner = this.requireOwner();
        return this.http
            .post<void>(`${this.baseURL}explorer/delete`, { path, owner })
            .pipe(catchError((err: unknown) => throwError(() => this.toErrorMessage(err))));
    }

    private requireOwner(): string {
        const owner = this.authService.getOwner();
        if (!owner) {
            throw new Error("No hay una sesión activa. Inicia sesión de nuevo.");
        }
        return owner;
    }

    private toErrorMessage(err: unknown): Error {
        if (err instanceof HttpErrorResponse) {
            if (err.error?.error) {
                return new Error(err.error.error);
            }
            if (err.status === 0) {
                return new Error("No se pudo conectar con el servidor. Verifica tu conexión.");
            }
        }
        return new Error("No se pudo cargar el directorio.");
    }
}