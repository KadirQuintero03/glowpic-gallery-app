import { Component, HostListener, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { firstValueFrom, Subscription } from "rxjs";
import { DateGroup, ExplorerEntry, FileKind, ViewMode } from "@core/models/explorer.model";
import { AuthService } from "@core/services/auth/auth.service";
import { ExplorerService } from "@core/services/explorer/explorer.service";
import { UsageService } from "@core/services/usage/usage.service";
import { computeDateGroups, sortExplorerEntries } from "@shared/utils/explorer-date.utils";
import { formatSize } from "@shared/utils/file-size.utils";

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

    dateGroups: DateGroup[] = [];
    folderEntries: ExplorerEntry[] = [];

    viewerEntry: ExplorerEntry | null = null;
    viewerKind: FileKind | null = null;
    showInfo = false;

    viewMode: ViewMode = "grid";

    searchQuery = "";
    isSearching = false;
    showEmpty = false;

    selectedPaths = new Set<string>();
    deletingPaths = new Set<string>();
    failedThumbs = new Set<string>();

    folderCount = 0;
    fileCount = 0;
    totalSize = 0;

    isGalleryMode = false;
    currentView: 'default' | 'gallery' | 'videos' | 'recent' = 'default';

    showCreateAlbumModal = false;
    newAlbumTitle = '';
    creatingAlbum = false;
    albumErrorMessage = '';

    private loadedMode: string | null = null;
    private querySub?: Subscription;

    constructor(
        public explorerService: ExplorerService,
        private usageService: UsageService,
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.querySub = this.route.queryParamMap.subscribe((params) => {
            const path = params.get("path") ?? "";
            const view = params.get("view") ?? "";
            this.searchQuery = params.get("search") ?? "";

            let activeMode = `path:${path}`;
            if (view === "gallery") activeMode = "gallery";
            else if (view === "videos" || path.toLowerCase() === "video") activeMode = "videos";
            else if (view === "recent" || path.toLowerCase() === "recientes") activeMode = "recent";

            if (this.loadedMode === activeMode) {
                this.applyFilters();
            } else {
                this.loadedMode = activeMode;
                if (activeMode === "gallery") {
                    this.loadGallery();
                } else if (activeMode === "videos") {
                    this.loadVideos();
                } else if (activeMode === "recent") {
                    this.loadRecent();
                } else {
                    this.currentView = "default";
                    this.isGalleryMode = false;
                    this.load(path);
                }
            }
        });
    }

    ngOnDestroy(): void {
        this.querySub?.unsubscribe();
    }

    load(path: string): void {
        this.loading = true;
        this.errorMessage = "";
        this.currentView = "default";
        this.isGalleryMode = false;

        try {
            this.explorerService.listDirectory(path).subscribe({
                next: (res) => {
                    this.currentPath = res.currentPath;
                    this.entries = sortExplorerEntries(res.entries);
                    this.loading = false;
                    this.setDisplayedEntries();
                    this.syncUsage();
                },
                error: (err: Error) => {
                    this.errorMessage = err.message ?? "No se pudo cargar el directorio.";
                    this.loading = false;
                },
            });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "No se pudo cargar el directorio.";
            this.errorMessage = msg;
            this.loading = false;
        }
    }

    async loadGallery(): Promise<void> {
        this.loading = true;
        this.errorMessage = "";
        this.currentView = "gallery";
        this.isGalleryMode = true;
        this.currentPath = "";
        this.viewerEntry = null;

        try {
            const res = await firstValueFrom(this.explorerService.listGallery());
            this.entries = sortExplorerEntries(res.entries);
            this.setDisplayedEntries();
            this.syncUsage();
        } catch (err) {
            this.errorMessage = err instanceof Error ? err.message : "No se pudo cargar la galería.";
        } finally {
            this.loading = false;
        }
    }

    async loadVideos(): Promise<void> {
        this.loading = true;
        this.errorMessage = "";
        this.currentView = "videos";
        this.isGalleryMode = false;
        this.currentPath = "";
        this.viewerEntry = null;

        try {
            const res = await firstValueFrom(this.explorerService.listVideos());
            this.entries = sortExplorerEntries(res.entries);
            this.setDisplayedEntries();
            this.syncUsage();
        } catch (err) {
            this.errorMessage = err instanceof Error ? err.message : "No se pudieron cargar los vídeos.";
        } finally {
            this.loading = false;
        }
    }

    async loadRecent(): Promise<void> {
        this.loading = true;
        this.errorMessage = "";
        this.currentView = "recent";
        this.isGalleryMode = false;
        this.currentPath = "";
        this.viewerEntry = null;

        try {
            const res = await firstValueFrom(this.explorerService.listRecent(24));
            this.entries = sortExplorerEntries(res.entries);
            this.setDisplayedEntries();
            this.syncUsage();
        } catch (err) {
            this.errorMessage = err instanceof Error ? err.message : "No se pudieron cargar los archivos recientes.";
        } finally {
            this.loading = false;
        }
    }

    private applyFilters(): void {
        this.setDisplayedEntries();
    }

    private setDisplayedEntries(): void {
        const visible = this.applySearch();
        this.folderEntries = visible.filter((e) => e.type === "directory");
        this.dateGroups = computeDateGroups(visible);
        this.isSearching = this.searchQuery.trim().length > 0;
        this.showEmpty = visible.length === 0;

        const files = visible.filter((e) => e.type === "file");
        this.folderCount = this.folderEntries.length;
        this.fileCount = files.length;
        this.totalSize = files.reduce((sum, e) => sum + (e.size ?? 0), 0);
    }

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

    private syncUsage(): void {
        const files = this.entries.filter((e) => e.type === "file");
        const bytes = files.reduce((sum, e) => sum + (e.size ?? 0), 0);
        this.usageService.update(files.length, bytes);
    }

    imageThumbSrc(entry: ExplorerEntry): string {
        return this.explorerService.getThumbnailUrl(entry.path);
    }

    videoThumbSrc(entry: ExplorerEntry): string {
        return this.explorerService.getThumbnailUrl(entry.path);
    }

    onThumbError(entry: ExplorerEntry): void {
        this.failedThumbs.add(entry.path);
    }

    hasThumb(entry: ExplorerEntry): boolean {
        return !this.failedThumbs.has(entry.path);
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

    get breadcrumbs(): { name: string; path: string }[] {
        if (this.currentView === 'gallery') return [{ name: 'Mi galería', path: '' }];
        if (this.currentView === 'videos') return [{ name: 'Vídeos', path: '' }];
        if (this.currentView === 'recent') return [{ name: 'Añadido recientemente', path: '' }];
        if (!this.currentPath) return [];
        const parts = this.currentPath.split("/").filter(Boolean);
        let acc = "";
        return parts.map((name) => {
            acc = acc ? `${acc}/${name}` : name;
            return { name: this.smartFolderTitle(name), path: acc };
        });
    }

    goToBreadcrumb(path: string): void {
        this.load(path);
    }

    goToRoot(): void {
        this.load("");
    }

    get username(): string {
        return this.authService.getUsername() ?? '';
    }

    get todayLabel(): string {
        const d = new Date();
        const label = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }).format(d);
        return label.charAt(0).toUpperCase() + label.slice(1);
    }

    get pageTitle(): string {
        if (this.currentView === 'gallery') return 'Galería';
        if (this.currentView === 'videos') return 'Vídeos';
        if (this.currentView === 'recent') return 'Añadido recientemente';
        if (this.isSearching) return 'Resultados';
        const parts = this.currentPath.split('/').filter(Boolean);
        if (parts.length === 0) return 'Inicio';
        return this.smartFolderTitle(parts[parts.length - 1]);
    }

    get pageSubtitle(): string {
        if (this.currentView === 'gallery') return 'Todas tus fotos y vídeos en un solo lugar.';
        if (this.currentView === 'videos') return 'Todos los vídeos guardados en tu espacio.';
        if (this.currentView === 'recent') return 'Archivos añadidos o guardados en las últimas 24 horas.';
        if (this.isAlbumsFolder) return 'Colecciones y álbumes organizados de tus fotos.';
        return 'Explora y administra tus archivos sincronizados.';
    }

    get showWelcome(): boolean {
        return (
            !this.loading &&
            !this.errorMessage &&
            this.currentView === 'default' &&
            !this.currentPath &&
            !this.isSearching
        );
    }

    get isAlbumsFolder(): boolean {
        return (this.currentPath || "").toLowerCase().startsWith("album");
    }

    get emptyStateTitle(): string {
        if (this.isSearching) return 'Sin resultados para tu búsqueda.';
        if (this.currentView === 'videos') return 'Aún no tienes vídeos.';
        if (this.currentView === 'recent') return 'No hay archivos recientes.';
        if (this.isGalleryMode) return 'Aún no tienes imágenes ni videos.';
        if (this.isAlbumsFolder) return 'Crea tu primer álbum';
        return 'Esta carpeta está vacía todavía.';
    }

    get emptyStateDescription(): string {
        if (this.isSearching) return 'Prueba con otro término o borra la búsqueda desde la barra superior.';
        if (this.currentView === 'videos') return 'Envía o sube un vídeo al bot en Telegram para verlo aquí.';
        if (this.currentView === 'recent') return 'Los archivos guardados en las últimas 24 horas aparecerán automáticamente aquí.';
        if (this.isAlbumsFolder) return 'Organiza y agrupa tus fotos y vídeos en colecciones personalizadas.';
        if (this.isGalleryMode) return '';
        return 'Envíale una foto, video o documento al bot en Telegram para que aparezca aquí.';
    }

    openCreateAlbumModal(): void {
        this.newAlbumTitle = '';
        this.albumErrorMessage = '';
        this.showCreateAlbumModal = true;
    }

    closeCreateAlbumModal(): void {
        if (this.creatingAlbum) return;
        this.showCreateAlbumModal = false;
        this.newAlbumTitle = '';
        this.albumErrorMessage = '';
    }

    async submitCreateAlbum(): Promise<void> {
        const title = this.newAlbumTitle.trim();
        if (!title) {
            this.albumErrorMessage = 'Por favor ingresa un título para el álbum.';
            return;
        }

        this.creatingAlbum = true;
        this.albumErrorMessage = '';

        try {
            await firstValueFrom(this.explorerService.createAlbum(title));
            this.showCreateAlbumModal = false;
            this.newAlbumTitle = '';
            this.load(this.currentPath || 'Albumes');
        } catch (err) {
            this.albumErrorMessage = err instanceof Error ? err.message : 'No se pudo crear el álbum.';
        } finally {
            this.creatingAlbum = false;
        }
    }

    goToGalleryView(): void {
        this.router.navigate(['/home/explorer'], {
            queryParams: { view: 'gallery', path: null, search: null },
        });
    }

    private smartFolderTitle(name: string): string {
        const n = name.toLowerCase().replace(/í/g, 'i');
        if (n.startsWith('imagen')) return 'Imágenes';
        if (n.startsWith('video')) return 'Vídeos';
        if (n.startsWith('audio')) return 'Audio';
        if (n.startsWith('document')) return 'Documentos';
        if (n.startsWith('album')) return 'Álbumes';
        if (n.startsWith('favorit')) return 'Favoritos';
        if (n.startsWith('reciente') || n.startsWith('anadido')) return 'Añadido recientemente';
        if (n.startsWith('archiv')) return 'Archivo';
        if (n.startsWith('papeler') || n.startsWith('trash')) return 'Papelera';
        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    folderTone(entry: ExplorerEntry): string {
        const n = entry.name.toLowerCase().replace(/í/g, 'i');
        if (n.startsWith('imagen')) return 'blue';
        if (n.startsWith('video')) return 'purple';
        if (n.startsWith('audio')) return 'green';
        if (n.startsWith('document')) return 'amber';
        if (n.startsWith('album')) return 'purple';
        if (n.startsWith('favorit')) return 'amber';
        if (n.startsWith('reciente') || n.startsWith('anadido')) return 'blue';
        if (n.startsWith('archiv')) return 'green';
        if (n.startsWith('papeler') || n.startsWith('trash')) return 'amber';
        return 'blue';
    }

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
                if (this.isGalleryMode) {
                    this.loadGallery();
                } else {
                    this.load(this.currentPath);
                }
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

    formatSize(bytes?: number): string {
        return formatSize(bytes);
    }

    formatListDate(entry: ExplorerEntry): string {
        if (!entry.modifiedAt) return "—";
        return new Intl.DateTimeFormat("es-CO", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }).format(new Date(entry.modifiedAt));
    }

    get totalSizeLabel(): string {
        return this.formatSize(this.totalSize);
    }

    trackByGroupKey(_index: number, group: DateGroup): string {
        return group.key;
    }

    trackByEntryPath(_index: number, entry: ExplorerEntry): string {
        return entry.path;
    }
}
