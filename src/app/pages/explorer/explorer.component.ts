import { Component, HostListener, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { ExplorerEntry, ExplorerService } from "src/app/services/explorer/explorer.service";
import { ThumbnailService } from "src/app/services/thumbnail/thumbnail.service";
import type { StoredThumbnail } from "src/app/services/thumbnail/thumbnail.service";

type FileKind = "directory" | "image" | "video" | "audio" | "document";
type ViewMode = "grid" | "list";

interface DateGroup {
    key: string;
    label: string;
    entries: ExplorerEntry[];
}

@Component({
    selector: "app-explorer",
    templateUrl: "./explorer.component.html",
    styleUrls: ["./explorer.component.css"],
})
export class ExplorerComponent implements OnInit, OnDestroy {
    currentPath = "";
    entries: ExplorerEntry[] = [];
    loading = false;
    errorMessage = "";

    // dateGroups y folderEntries se calculan UNA sola vez por cada load()
    // (no son getters). Si fueran getters, Angular los recalcularía en
    // cada ciclo de detección de cambios devolviendo arrays/objetos nuevos
    // cada vez, lo que hace que *ngFor destruya y recree todo el DOM del
    // grid constantemente (incluso con un simple hover) y por eso los
    // clics se pierden entre el mousedown y el mouseup.
    dateGroups: DateGroup[] = [];
    folderEntries: ExplorerEntry[] = [];

    // Estado del visor modal (imagen/video/audio)
    viewerEntry: ExplorerEntry | null = null;
    viewerKind: FileKind | null = null;
    showInfo = false;

    // Miniaturas ya generadas y almacenadas (IndexedDB), indexadas por ruta.
    thumbnails: Record<string, StoredThumbnail> = {};

    // Vista activa: cuadrícula (miniaturas cuadradas) o lista (columnas)
    viewMode: ViewMode = "grid";

    // Búsqueda global (llega por query param ?search=) y filtrado local
    searchQuery = "";
    isSearching = false;
    showEmpty = false;

    // Selección múltiple y borrado
    selectedPaths = new Set<string>();
    deletingPaths = new Set<string>();

    private loadedAtPath: string | null = null;
    private querySub?: Subscription;

    constructor(
        public explorerService: ExplorerService,
        private thumbnailService: ThumbnailService,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.querySub = this.route.queryParamMap.subscribe((params) => {
            const path = params.get("path") ?? "";
            this.searchQuery = params.get("search") ?? "";
            if (this.loadedAtPath !== null && this.loadedAtPath === path) {
                // Cambió solo la búsqueda: re-filtra sin recargar del backend.
                this.applyFilters();
            } else {
                this.loadedAtPath = path;
                this.load(path);
            }
        });
    }

    ngOnDestroy(): void {
        this.querySub?.unsubscribe();
    }

    load(path: string): void {
        this.loading = true;
        this.errorMessage = "";

        try {
            this.explorerService.listDirectory(path).subscribe({
                next: (res) => {
                    this.currentPath = res.currentPath;
                    this.entries = this.sortEntries(res.entries);
                    this.loading = false;
                    this.setDisplayedEntries();
                    this.preloadThumbnails();
                },
                error: (err: Error) => {
                    console.error("Error al listar directorio:", err);
                    this.errorMessage = err.message ?? "No se pudo cargar el directorio.";
                    this.loading = false;
                },
            });
        } catch (err) {
            // requireOwner() dentro de listDirectory() lanza si no hay sesión.
            const msg = err instanceof Error ? err.message : "No se pudo cargar el directorio.";
            console.error("Error al listar directorio:", err);
            this.errorMessage = msg;
            this.loading = false;
        }
    }

    // Recalcula los bloques visibles (carpetas y archivos por fecha) a partir
    // de la lista completa cargada en this.entries y del término de búsqueda.
    private applyFilters(): void {
        this.setDisplayedEntries();
    }

    private setDisplayedEntries(): void {
        const visible = this.applySearch();
        this.folderEntries = visible.filter((e) => e.type === "directory");
        this.dateGroups = this.computeDateGroups(visible);
        this.isSearching = this.searchQuery.trim().length > 0;
        this.showEmpty = visible.length === 0;
    }

    // Filtrado local, sin importar del backend: ignora tildes y mayúsculas.
    private applySearch(): ExplorerEntry[] {
        const q = this.searchQuery
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
        if (!q) return this.entries;
        return this.entries.filter((e) => {
            const name = e.name
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");
            return name.includes(q);
        });
    }

    // Carpetas primero, luego archivos, ambos alfabéticamente
    private sortEntries(entries: ExplorerEntry[]): ExplorerEntry[] {
        return [...entries].sort((a, b) => {
            if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
            return a.name.localeCompare(b.name, "es", { sensitivity: "base" });
        });
    }

    // Recupera del almacenamiento local las miniaturas ya generadas
    private async preloadThumbnails(): Promise<void> {
        for (const entry of this.entries) {
            if (entry.type !== "file") continue;
            const kind = this.kindOf(entry);
            if (kind !== "image" && kind !== "video") continue;
            if (this.thumbnails[entry.path]) continue;

            const cached = await this.thumbnailService.get(entry.path);
            if (cached) {
                this.thumbnails = { ...this.thumbnails, [entry.path]: cached };
            }
        }
    }

    async onImageLoad(entry: ExplorerEntry, event: Event): Promise<void> {
        if (this.thumbnails[entry.path]) return;

        const img = event.target as HTMLImageElement;
        try {
            const thumb = await this.thumbnailService.createFromImage(entry.path, img);
            this.thumbnails = { ...this.thumbnails, [entry.path]: thumb };
        } catch {
            // Si algo falla, la imagen original sigue mostrándose igualmente.
        }
    }

    onVideoPlaying(entry: ExplorerEntry, event: Event): void {
        const video = event.target as HTMLVideoElement;
        window.setTimeout(() => {
            video.pause();
            this.captureVideoThumbnail(entry, video);
        }, 400);
    }

    private async captureVideoThumbnail(entry: ExplorerEntry, video: HTMLVideoElement): Promise<void> {
        if (this.thumbnails[entry.path]) return;

        try {
            const thumb = await this.thumbnailService.createFromVideo(entry.path, video);
            this.thumbnails = { ...this.thumbnails, [entry.path]: thumb };
        } catch {
            // El <video> pausado en pantalla ya cumple como miniatura visible.
        }
    }

    // URL a usar en el <img> del grid: la miniatura ya cacheada si existe,
    // o el archivo original en caso contrario.
    imageThumbSrc(entry: ExplorerEntry): string {
        return this.thumbnails[entry.path]?.dataUrl ?? this.explorerService.getFileUrl(entry.path);
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
            this.showInfo = false;
        } else {
            window.open(this.explorerService.getFileUrl(entry.path), "_blank");
        }
    }

    closeViewer(): void {
        this.viewerEntry = null;
        this.viewerKind = null;
        this.showInfo = false;
    }

    toggleInfo(): void {
        this.showInfo = !this.showInfo;
    }

    get viewerUrl(): string {
        return this.viewerEntry ? this.explorerService.getFileUrl(this.viewerEntry.path) : "";
    }

    get viewerThumbnail(): StoredThumbnail | undefined {
        return this.viewerEntry ? this.thumbnails[this.viewerEntry.path] : undefined;
    }

    get viewerExtension(): string {
        if (!this.viewerEntry) return "";
        const parts = this.viewerEntry.name.split(".");
        return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "";
    }

    get viewerFormattedDate(): string {
        if (!this.viewerEntry?.modifiedAt) return "Fecha desconocida";
        return new Intl.DateTimeFormat("es-CO", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(this.viewerEntry.modifiedAt));
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

    // ---- Acciones rápidas (overlay al pasar el cursor) ----
    downloadFile(entry: ExplorerEntry): void {
        window.open(this.explorerService.getFileUrl(entry.path), "_blank");
    }

    toggleSelect(entry: ExplorerEntry): void {
        if (this.selectedPaths.has(entry.path)) {
            this.selectedPaths.delete(entry.path);
        } else {
            this.selectedPaths.add(entry.path);
        }
        this.selectedPaths = new Set(this.selectedPaths);
    }

    isSelected(entry: ExplorerEntry): boolean {
        return this.selectedPaths.has(entry.path);
    }

    isDeleting(entry: ExplorerEntry): boolean {
        return this.deletingPaths.has(entry.path);
    }

    get selectedCount(): number {
        return this.selectedPaths.size;
    }

    clearSelection(): void {
        this.selectedPaths = new Set();
    }

    deleteFile(entry: ExplorerEntry): void {
        if (!window.confirm(`¿Eliminar "${entry.name}"? Esta acción no se puede deshacer.`)) {
            return;
        }

        this.deletingPaths = new Set(this.deletingPaths).add(entry.path);
        this.explorerService.deleteFile(entry.path).subscribe({
            next: () => {
                this.selectedPaths = new Set([...this.selectedPaths].filter((p) => p !== entry.path));
                this.deletingPaths = new Set([...this.deletingPaths].filter((p) => p !== entry.path));
                this.load(this.currentPath);
            },
            error: (err: Error) => {
                this.deletingPaths = new Set([...this.deletingPaths].filter((p) => p !== entry.path));
                this.errorMessage = err.message ?? "No se pudo eliminar el archivo.";
            },
        });
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

    kindOf(entry: ExplorerEntry): FileKind {
        if (entry.type === "directory") return "directory";
        if (this.isImage(entry.name)) return "image";
        if (this.isVideo(entry.name)) return "video";
        if (this.isAudio(entry.name)) return "audio";
        return "document";
    }

    // Formatea el peso del archivo en unidades legibles
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
        return `${value.toFixed(1)} ${units[unitIndex]}`;
    }

    // Fecha abreviada para la "Vista de lista"
    formatListDate(entry: ExplorerEntry): string {
        if (!entry.modifiedAt) return "—";
        return new Intl.DateTimeFormat("es-CO", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }).format(new Date(entry.modifiedAt));
    }

    get folderCount(): number {
        return this.applySearch().filter((e) => e.type === "directory").length;
    }

    get fileCount(): number {
        return this.applySearch().filter((e) => e.type === "file").length;
    }

    get totalSize(): number {
        return this.applySearch()
            .filter((e) => e.type === "file" && e.size)
            .reduce((sum, e) => sum + (e.size ?? 0), 0);
    }

    get totalSizeLabel(): string {
        return this.formatSize(this.totalSize);
    }

    private computeDateGroups(entries: ExplorerEntry[]): DateGroup[] {
        const files = entries.filter((e) => e.type === "file");
        const groupsMap = new Map<string, ExplorerEntry[]>();

        for (const file of files) {
            const key = this.dateKeyOf(file.modifiedAt);
            const bucket = groupsMap.get(key) ?? [];
            bucket.push(file);
            groupsMap.set(key, bucket);
        }

        return Array.from(groupsMap.entries())
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([key, groupEntries]) => ({
                key,
                label: this.dateLabelOf(key, groupEntries[0].modifiedAt),
                entries: groupEntries,
            }));
    }

    trackByGroupKey(_index: number, group: DateGroup): string {
        return group.key;
    }

    trackByEntryPath(_index: number, entry: ExplorerEntry): string {
        return entry.path;
    }

    private dateKeyOf(modifiedAt?: number): string {
        if (!modifiedAt) return "0000-00-00";
        const d = new Date(modifiedAt);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }

    private dateLabelOf(key: string, modifiedAt?: number): string {
        if (key === "0000-00-00" || !modifiedAt) return "Sin fecha";
        const d = new Date(modifiedAt);
        const label = new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long" }).format(d);
        return label.charAt(0).toUpperCase() + label.slice(1);
    }
}