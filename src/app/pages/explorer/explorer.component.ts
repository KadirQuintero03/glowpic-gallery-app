import { Component, HostListener, OnInit } from "@angular/core";
import { ExplorerEntry, ExplorerService } from "src/app/services/explorer/explorer.service";

type FileKind = "directory" | "image" | "video" | "audio" | "document";

@Component({
    selector: "app-explorer",
    templateUrl: "./explorer.component.html",
    styleUrls: ["./explorer.component.css"],
})
export class ExplorerComponent implements OnInit {
    currentPath = "";
    entries: ExplorerEntry[] = [];
    loading = false;
    errorMessage = "";

    // Estado del visor modal (imagen/video/audio)
    viewerEntry: ExplorerEntry | null = null;
    viewerKind: FileKind | null = null;

    constructor(public explorerService: ExplorerService) { }

    ngOnInit(): void {
        this.load("");
    }

    load(path: string): void {
        this.loading = true;
        this.errorMessage = "";

        this.explorerService.listDirectory(path).subscribe({
            next: (res) => {
                this.currentPath = res.currentPath;
                this.entries = this.sortEntries(res.entries);
                this.loading = false;
            },
            error: (err) => {
                console.error("Error al listar directorio:", err);
                this.errorMessage = "No se pudo cargar el directorio.";
                this.loading = false;
            },
        });
    }

    // Carpetas primero, luego archivos, ambos alfabéticamente
    private sortEntries(entries: ExplorerEntry[]): ExplorerEntry[] {
        return [...entries].sort((a, b) => {
            if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
            return a.name.localeCompare(b.name, "es", { sensitivity: "base" });
        });
    }

    openEntry(entry: ExplorerEntry): void {
        if (entry.type === "directory") {
            this.load(entry.path);
            return;
        }

        const kind = this.kindOf(entry);

        if (kind === "image" || kind === "video" || kind === "audio") {
            this.viewerEntry = entry;
            this.viewerKind = kind;
        } else {
            // Documentos y otros formatos sin visor nativo: se abren/descargan en pestaña nueva
            window.open(this.explorerService.getFileUrl(entry.path), "_blank");
        }
    }

    closeViewer(): void {
        this.viewerEntry = null;
        this.viewerKind = null;
    }

    get viewerUrl(): string {
        return this.viewerEntry ? this.explorerService.getFileUrl(this.viewerEntry.path) : "";
    }

    @HostListener("document:keydown.escape")
    onEscapeKey(): void {
        if (this.viewerEntry) this.closeViewer();
    }

    goUp(): void {
        if (!this.currentPath) return;
        const parent = this.currentPath.split("/").slice(0, -1).join("/");
        this.load(parent);
    }

    // Migas de pan (breadcrumbs) a partir de currentPath, ej: "Video/2024"
    get breadcrumbs(): { name: string; path: string }[] {
        if (!this.currentPath) return [];
        const parts = this.currentPath.split("/").filter(Boolean);
        let acc = "";
        return parts.map((name) => {
            acc = acc ? `${acc}/${name}` : name;
            return { name, path: acc };
        });
    }

    goToBreadcrumb(path: string): void {
        this.load(path);
    }

    goToRoot(): void {
        this.load("");
    }

    isImage(name: string): boolean {
        return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(name);
    }

    isVideo(name: string): boolean {
        return /\.(mp4|mov|webm|mkv|avi)$/i.test(name);
    }

    isAudio(name: string): boolean {
        return /\.(mp3|ogg|wav|m4a|opus)$/i.test(name);
    }

    // Determina el "tipo visual" de una entrada para elegir ícono/estilo
    kindOf(entry: ExplorerEntry): FileKind {
        if (entry.type === "directory") return "directory";
        if (this.isImage(entry.name)) return "image";
        if (this.isVideo(entry.name)) return "video";
        if (this.isAudio(entry.name)) return "audio";
        return "document";
    }

    // Formatea el tamaño del archivo en unidades legibles
    formatSize(bytes?: number): string {
        if (bytes === undefined || bytes === null) return "";
        if (bytes < 1024) return `${bytes} B`;
        const units = ["KB", "MB", "GB", "TB"];
        let value = bytes / 1024;
        let unitIndex = 0;
        while (value >= 1024 && unitIndex < units.length - 1) {
            value /= 1024;
            unitIndex++;
        }
        return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unitIndex]}`;
    }

    // Cantidad de elementos en la carpeta actual, para el resumen del header
    get folderCount(): number {
        return this.entries.filter((e) => e.type === "directory").length;
    }

    get fileCount(): number {
        return this.entries.filter((e) => e.type === "file").length;
    }
}
