import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, Observable, throwError } from "rxjs";
import { environment } from "@env/environment";
import { AlbumSummary, ExplorerEntry, ExplorerResponse } from "@core/models/explorer.model";
import { AuthService } from "@core/services/auth/auth.service";

export { AlbumSummary, ExplorerEntry, ExplorerResponse } from "@core/models/explorer.model";

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

    listGallery(): Observable<ExplorerResponse> {
        const owner = this.requireOwner();
        const params = new HttpParams().set("owner", owner);
        return this.http
            .get<ExplorerResponse>(`${this.baseURL}explorer/gallery`, { params })
            .pipe(catchError((err: unknown) => throwError(() => this.toErrorMessage(err))));
    }

    listVideos(): Observable<ExplorerResponse> {
        const owner = this.requireOwner();
        const params = new HttpParams().set("owner", owner);
        return this.http
            .get<ExplorerResponse>(`${this.baseURL}explorer/videos`, { params })
            .pipe(catchError((err: unknown) => throwError(() => this.toErrorMessage(err))));
    }

    listRecent(hours = 24): Observable<ExplorerResponse> {
        const owner = this.requireOwner();
        const params = new HttpParams().set("owner", owner).set("hours", hours.toString());
        return this.http
            .get<ExplorerResponse>(`${this.baseURL}explorer/recent`, { params })
            .pipe(catchError((err: unknown) => throwError(() => this.toErrorMessage(err))));
    }

    // --- FAVORITOS ---
    listFavorites(): Observable<ExplorerResponse> {
        const owner = this.requireOwner();
        const params = new HttpParams().set("owner", owner);
        return this.http
            .get<ExplorerResponse>(`${this.baseURL}explorer/favorites`, { params })
            .pipe(catchError((err: unknown) => throwError(() => this.toErrorMessage(err))));
    }

    toggleFavorite(path: string, isFavorite?: boolean): Observable<{ success: boolean; path: string; isFavorite: boolean }> {
        const owner = this.requireOwner();
        return this.http
            .post<{ success: boolean; path: string; isFavorite: boolean }>(`${this.baseURL}explorer/favorite`, {
                owner,
                path,
                isFavorite,
            })
            .pipe(catchError((err: unknown) => throwError(() => this.toErrorMessage(err))));
    }

    // --- ARCHIVO ---
    listArchived(): Observable<ExplorerResponse> {
        const owner = this.requireOwner();
        const params = new HttpParams().set("owner", owner);
        return this.http
            .get<ExplorerResponse>(`${this.baseURL}explorer/archived`, { params })
            .pipe(catchError((err: unknown) => throwError(() => this.toErrorMessage(err))));
    }

    toggleArchive(path: string, isArchived?: boolean): Observable<{ success: boolean; path: string; isArchived: boolean }> {
        const owner = this.requireOwner();
        return this.http
            .post<{ success: boolean; path: string; isArchived: boolean }>(`${this.baseURL}explorer/archive`, {
                owner,
                path,
                isArchived,
            })
            .pipe(catchError((err: unknown) => throwError(() => this.toErrorMessage(err))));
    }

    // --- ÁLBUMES ---
    listAlbums(): Observable<ExplorerResponse> {
        const owner = this.requireOwner();
        const params = new HttpParams().set("owner", owner);
        return this.http
            .get<ExplorerResponse>(`${this.baseURL}explorer/albums`, { params })
            .pipe(catchError((err: unknown) => throwError(() => this.toErrorMessage(err))));
    }

    createAlbum(title: string): Observable<AlbumSummary> {
        const owner = this.requireOwner();
        return this.http
            .post<AlbumSummary>(`${this.baseURL}explorer/albums`, { owner, title })
            .pipe(catchError((err: unknown) => throwError(() => this.toErrorMessage(err))));
    }

    getAlbumContent(album: string): Observable<{ title: string; entries: ExplorerEntry[] }> {
        const owner = this.requireOwner();
        const params = new HttpParams().set("owner", owner).set("album", album);
        return this.http
            .get<{ title: string; entries: ExplorerEntry[] }>(`${this.baseURL}explorer/albums/content`, { params })
            .pipe(catchError((err: unknown) => throwError(() => this.toErrorMessage(err))));
    }

    addItemsToAlbum(album: string, paths: string[]): Observable<{ success: boolean; album: any }> {
        const owner = this.requireOwner();
        return this.http
            .post<{ success: boolean; album: any }>(`${this.baseURL}explorer/albums/add-item`, {
                owner,
                album,
                paths,
            })
            .pipe(catchError((err: unknown) => throwError(() => this.toErrorMessage(err))));
    }

    removeItemFromAlbum(album: string, path: string): Observable<{ success: boolean; album: any }> {
        const owner = this.requireOwner();
        return this.http
            .post<{ success: boolean; album: any }>(`${this.baseURL}explorer/albums/remove-item`, {
                owner,
                album,
                path,
            })
            .pipe(catchError((err: unknown) => throwError(() => this.toErrorMessage(err))));
    }

    deleteAlbum(album: string): Observable<{ success: boolean; message: string }> {
        const owner = this.requireOwner();
        return this.http
            .post<{ success: boolean; message: string }>(`${this.baseURL}explorer/albums/delete`, {
                owner,
                album,
            })
            .pipe(catchError((err: unknown) => throwError(() => this.toErrorMessage(err))));
    }

    getFileUrl(path: string): string {
        const owner = this.authService.getOwner() ?? "";
        const token = this.authService.getToken() ?? "";
        let params = new HttpParams().set("path", path).set("owner", owner);
        if (token) {
            params = params.set("token", token);
        }
        return `${this.baseURL}explorer/file?${params.toString()}`;
    }

    getThumbnailUrl(path: string, width = 320): string {
        const owner = this.authService.getOwner() ?? "";
        const token = this.authService.getToken() ?? "";
        let params = new HttpParams()
            .set("path", path)
            .set("owner", owner)
            .set("w", width.toString());
        if (token) {
            params = params.set("token", token);
        }
        return `${this.baseURL}explorer/thumbnail?${params.toString()}`;
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
        return new Error("Ocurrió un error al procesar la solicitud.");
    }
}
