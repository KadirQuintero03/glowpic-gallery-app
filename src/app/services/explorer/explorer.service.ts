import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/app/environments/environment";

export interface ExplorerEntry {
    name: string;
    type: "directory" | "file";
    path: string;
    size?: number;
    modifiedAt?: number;
}

export interface ExplorerResponse {
    currentPath: string;
    entries: ExplorerEntry[];
}

@Injectable({
    providedIn: "root",
})
export class ExplorerService {
    private baseURL = environment.apiUrl; // ej: http://localhost:3000/

    constructor(private http: HttpClient) { }

    // Lista el contenido (carpetas + archivos) de una ruta relativa
    listDirectory(path: string = ""): Observable<ExplorerResponse> {
        const params = new HttpParams().set("path", path);
        return this.http.get<ExplorerResponse>(`${this.baseURL}explorer`, { params });
    }

    // URL directa para ver/descargar un archivo
    getFileUrl(path: string): string {
        const params = new HttpParams().set("path", path);
        return `${this.baseURL}explorer/file?${params.toString()}`;
    }
}