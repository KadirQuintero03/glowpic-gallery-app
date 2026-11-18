import { Component, HostListener, OnDestroy, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { firstValueFrom, Subscription } from "rxjs";
import { AlbumSummary, DateGroup, ExplorerEntry, FileKind, ViewMode } from "@core/models/explorer.model";
import { AuthService } from "@core/services/auth/auth.service";
import { ExplorerService } from "@core/services/explorer/explorer.service";
import { UsageService } from "@core/services/usage/usage.service";
import { computeDateGroups, sortExplorerEntries } from "@shared/utils/explorer-date.utils";
import { formatSize } from "@shared/utils/file-size.utils";

@Component({
    selector: "app-explorer",
    templateUrl: "./explorer.component.html",
    styleUrls: ["./explorer.component.css"],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
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
    viewerLoading = false;
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
    currentView: 'default' | 'gallery' | 'videos' | 'recent' | 'favorites' | 'archive' | 'albums' | 'album-detail' = 'default';
    currentAlbumTitle = '';

    showCreateAlbumModal = false;
    newAlbumTitle = '';
    creatingAlbum = false;
    albumErrorMessage = '';

    showAddToAlbumModal = false;
    availableAlbums: AlbumSummary[] = [];
    selectedTargetAlbum = '';
    addingToAlbum = false;
    addToAlbumError = '';
    entryToAddToAlbum: ExplorerEntry | null = null;

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
            const path = params.get("path");
            const view = params.get("view");
            const album = params.get("album");
            this.searchQuery = params.get("search") ?? "";

            let activeMode = `path:${path ?? ''}`;

            if (view === "gallery" || (!view && path === null && !this.searchQuery && !album)) {
                activeMode = "gallery";
            } else if (view === "inicio" || (view === null && path === "")) {
                activeMode = "inicio";
            } else if (view === "videos" || (path && path.toLowerCase() === "video")) {
                activeMode = "videos";
            } else if (view === "recent" || (path && path.toLowerCase() === "recientes")) {
                activeMode = "recent";
            } else if (view === "favorites" || (path && path.toLowerCase().startsWith("favorit"))) {
                activeMode = "favorites";
            } else if (view === "archive" || (path && path.toLowerCase().startsWith("archiv"))) {
                activeMode = "archive";
            } else if (view === "albums" || (path && path.toLowerCase() === "albumes")) {
                activeMode = "albums";
            } else if (view === "album-detail" || album) {
                activeMode = `album:${album || ''}`;
            } else if (path && path.toLowerCase().startsWith("albumes/")) {
                const subAlbum = path.slice("albumes/".length);
                activeMode = `album:${subAlbum}`;
            }

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
                } else if (activeMode === "favorites") {
                    this.loadFavorites();
                } else if (activeMode === "archive") {
                    this.loadArchived();
                } else if (activeMode === "albums") {
                    this.loadAlbums();
                } else if (activeMode.startsWith("album:")) {
                    const albumName = decodeURIComponent(activeMode.slice("album:".length));
                    this.loadAlbumContent(albumName);
                } else {
                    this.currentView = "default";
                    this.isGalleryMode = false;
                    this.load(path ?? "");
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

    async loadFavorites(): Promise<void> {
        this.loading = true;
        this.errorMessage = "";
        this.currentView = "favorites";
        this.isGalleryMode = true;
        this.currentPath = "";
        this.viewerEntry = null;

        try {
            const res = await firstValueFrom(this.explorerService.listFavorites());
            this.entries = sortExplorerEntries(res.entries);
            this.setDisplayedEntries();
            this.syncUsage();
        } catch (err) {
            this.errorMessage = err instanceof Error ? err.message : "No se pudieron cargar los favoritos.";
        } finally {
            this.loading = false;
        }
    }

    async loadArchived(): Promise<void> {
        this.loading = true;
        this.errorMessage = "";
        this.currentView = "archive";
        this.isGalleryMode = true;
        this.currentPath = "";
        this.viewerEntry = null;

        try {
            const res = await firstValueFrom(this.explorerService.listArchived());
            this.entries = sortExplorerEntries(res.entries);
            this.setDisplayedEntries();
            this.syncUsage();
        } catch (err) {
            this.errorMessage = err instanceof Error ? err.message : "No se pudieron cargar los archivos archivados.";
        } finally {
            this.loading = false;
        }
    }

    async loadAlbums(): Promise<void> {
        this.loading = true;
        this.errorMessage = "";
        this.currentView = "albums";
        this.isGalleryMode = false;
        this.currentPath = "Albumes";
        this.viewerEntry = null;

        try {
            const res = await firstValueFrom(this.explorerService.listAlbums());
            this.entries = res.entries;
            this.setDisplayedEntries();
        } catch (err) {
            this.errorMessage = err instanceof Error ? err.message : "No se pudieron cargar los álbumes.";
        } finally {
            this.loading = false;
        }
    }

    async loadAlbumContent(albumName: string): Promise<void> {
        this.loading = true;
        this.errorMessage = "";
        this.currentView = "album-detail";
        this.isGalleryMode = true;
        this.currentPath = `Albumes/${albumName}`;
        this.currentAlbumTitle = albumName;
        this.viewerEntry = null;

        try {
            const res = await firstValueFrom(this.explorerService.getAlbumContent(albumName));
            this.currentAlbumTitle = res.title || albumName;
            this.entries = sortExplorerEntries(res.entries);
            this.setDisplayedEntries();
            this.syncUsage();
        } catch (err) {
            this.errorMessage = err instanceof Error ? err.message : `No se pudo cargar el álbum "${albumName}".`;
        } finally {
            this.loading = false;
        }
    }

    private applyFilters(): void {
        this.setDisplayedEntries();
    }

    private setDisplayedEntries(): void {
        const visible = this.applySearch();

        if (this.currentView === 'albums') {
            this.folderEntries = visible;
            this.dateGroups = [];
        } else {
            this.folderEntries = visible.filter((e) => e.type === "directory");
            this.dateGroups = computeDateGroups(visible);
        }

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
            const targetName = (e.title || e.name)
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");
            return targetName.includes(q);
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

    albumCoverSrc(album: ExplorerEntry): string {
        if (album.coverPath) {
            return this.explorerService.getThumbnailUrl(album.coverPath);
        }
        return '';
    }

    onThumbError(entry: ExplorerEntry): void {
        this.failedThumbs.add(entry.path);
    }

    hasThumb(entry: ExplorerEntry): boolean {
        return !this.failedThumbs.has(entry.path);
    }

    openEntry(entry: ExplorerEntry): void {
        if (this.currentView === 'albums') {
            this.openAlbum(entry);
            return;
        }

        if (entry.type === "directory") {
            if (entry.path.toLowerCase() === 'albumes') {
                this.router.navigate(['/home/explorer'], {
                    queryParams: { view: 'albums', path: null, search: null },
                });
                return;
            }
            if (entry.path.toLowerCase().startsWith('albumes/')) {
                const subAlbum = entry.path.slice('albumes/'.length);
                this.router.navigate(['/home/explorer'], {
                    queryParams: { view: 'album-detail', album: subAlbum, path: null, search: null },
                });
                return;
            }
            this.load(entry.path);
            return;
        }

        const kind = this.kindOf(entry);

        if (kind === "image" || kind === "video" || kind === "audio") {
            this.viewerLoading = (kind === "image" || kind === "video");
            this.viewerEntry = entry;
            this.viewerKind = kind;
            this.showInfo = false;
        } else {
            window.open(this.explorerService.getFileUrl(entry.path), "_blank");
        }
    }

    openAlbum(album: ExplorerEntry): void {
        const albumName = album.title || album.name;
        this.router.navigate(['/home/explorer'], {
            queryParams: { view: 'album-detail', album: albumName, path: null, search: null },
        });
    }

    // --- ACCIÓN DE FAVORITOS ---
    toggleFavorite(entry: ExplorerEntry, event?: Event): void {
        event?.stopPropagation();
        const previousState = !!entry.isFavorite;
        const nextState = !previousState;
        entry.isFavorite = nextState;

        this.explorerService.toggleFavorite(entry.path, nextState).subscribe({
            next: (res) => {
                entry.isFavorite = res.isFavorite;
                if (this.currentView === 'favorites' && !res.isFavorite) {
                    this.entries = this.entries.filter((e) => e.path !== entry.path);
                    this.setDisplayedEntries();
                }
            },
            error: (err) => {
                entry.isFavorite = previousState;
                console.error("Error al actualizar favorito:", err);
            }
        });
    }

    // --- ACCIÓN DE ARCHIVO ---
    toggleArchive(entry: ExplorerEntry, event?: Event): void {
        event?.stopPropagation();
        const previousState = !!entry.isArchived;
        const nextState = !previousState;
        entry.isArchived = nextState;

        this.explorerService.toggleArchive(entry.path, nextState).subscribe({
            next: (res) => {
                entry.isArchived = res.isArchived;
                // Si se archiva desde la galería general, videos o recientes: se quita de la vista
                if (res.isArchived && (this.currentView === 'gallery' || this.currentView === 'videos' || this.currentView === 'recent' || this.currentView === 'default')) {
                    this.entries = this.entries.filter((e) => e.path !== entry.path);
                    this.setDisplayedEntries();
                    if (this.viewerEntry?.path === entry.path) {
                        this.closeViewer();
                    }
                }
                // Si se desarchiva desde la vista de archivo: se quita de archivo
                if (!res.isArchived && this.currentView === 'archive') {
                    this.entries = this.entries.filter((e) => e.path !== entry.path);
                    this.setDisplayedEntries();
                    if (this.viewerEntry?.path === entry.path) {
                        this.closeViewer();
                    }
                }
            },
            error: (err) => {
                entry.isArchived = previousState;
                console.error("Error al actualizar archivo:", err);
            }
        });
    }

    // --- ACCIONES DE ÁLBUMES ---
    async openAddToAlbumModal(entry?: ExplorerEntry, event?: Event): Promise<void> {
        event?.stopPropagation();
        this.entryToAddToAlbum = entry || null;
        this.addToAlbumError = '';
        this.selectedTargetAlbum = '';
        this.addingToAlbum = false;

        try {
            const res = await firstValueFrom(this.explorerService.listAlbums());
            this.availableAlbums = res.entries.map((e) => ({
                id: e.id || e.name,
                title: e.title || e.name,
                itemCount: e.itemCount ?? 0,
                coverPath: e.coverPath,
                createdAt: e.createdAt,
            }));
            if (this.availableAlbums.length > 0) {
                this.selectedTargetAlbum = this.availableAlbums[0].title;
            }
            this.showAddToAlbumModal = true;
        } catch (err) {
            this.errorMessage = "No se pudieron cargar los álbumes disponibles.";
        }
    }

    closeAddToAlbumModal(): void {
        if (this.addingToAlbum) return;
        this.showAddToAlbumModal = false;
        this.entryToAddToAlbum = null;
        this.selectedTargetAlbum = '';
        this.addToAlbumError = '';
    }

    async submitAddToAlbum(): Promise<void> {
        const album = this.selectedTargetAlbum.trim();
        if (!album) {
            this.addToAlbumError = 'Selecciona o escribe el título del álbum.';
            return;
        }

        const paths = this.entryToAddToAlbum
            ? [this.entryToAddToAlbum.path]
            : Array.from(this.selectedPaths);

        if (paths.length === 0) {
            this.addToAlbumError = 'No hay archivos seleccionados.';
            return;
        }

        this.addingToAlbum = true;
        this.addToAlbumError = '';

        try {
            await firstValueFrom(this.explorerService.addItemsToAlbum(album, paths));
            this.showAddToAlbumModal = false;
            this.clearSelection();
            this.entryToAddToAlbum = null;
        } catch (err) {
            this.addToAlbumError = err instanceof Error ? err.message : 'No se pudieron añadir los archivos al álbum.';
        } finally {
            this.addingToAlbum = false;
        }
    }

    removeFromCurrentAlbum(entry: ExplorerEntry, event?: Event): void {
        event?.stopPropagation();
        if (!this.currentAlbumTitle) return;

        if (!window.confirm(`¿Quitar "${entry.name}" del álbum? (El archivo seguirá en tu galería).`)) {
            return;
        }

        this.explorerService.removeItemFromAlbum(this.currentAlbumTitle, entry.path).subscribe({
            next: () => {
                this.entries = this.entries.filter((e) => e.path !== entry.path);
                this.setDisplayedEntries();
                if (this.viewerEntry?.path === entry.path) {
                    this.closeViewer();
                }
            },
            error: (err) => {
                console.error("Error al quitar del álbum:", err);
            }
        });
    }

    deleteAlbum(album: ExplorerEntry, event?: Event): void {
        event?.stopPropagation();
        const title = album.title || album.name;
        if (!window.confirm(`¿Eliminar el álbum "${title}"? Tus fotos y vídeos originales seguirán guardados en tu galería.`)) {
            return;
        }

        this.explorerService.deleteAlbum(title).subscribe({
            next: () => {
                this.entries = this.entries.filter((e) => (e.title || e.name) !== title);
                this.setDisplayedEntries();
            },
            error: (err) => {
                this.errorMessage = err instanceof Error ? err.message : "Error al eliminar álbum.";
            }
        });
    }

    deleteCurrentAlbum(): void {
        if (!this.currentAlbumTitle) return;
        if (!window.confirm(`¿Eliminar el álbum "${this.currentAlbumTitle}"? Tus fotos y vídeos originales seguirán guardados en tu galería.`)) {
            return;
        }

        this.explorerService.deleteAlbum(this.currentAlbumTitle).subscribe({
            next: () => {
                this.router.navigate(['/home/explorer'], {
                    queryParams: { view: 'albums', path: null, search: null },
                });
            },
            error: (err) => {
                this.errorMessage = err instanceof Error ? err.message : "Error al eliminar álbum.";
            }
        });
    }

    onViewerMediaLoad(): void {
        this.viewerLoading = false;
    }

    onViewerMediaError(): void {
        this.viewerLoading = false;
    }

    closeViewer(): void {
        this.viewerEntry = null;
        this.viewerKind = null;
        this.viewerLoading = false;
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
        if (this.showAddToAlbumModal) {
            this.closeAddToAlbumModal();
            return;
        }
        if (this.showCreateAlbumModal) {
            this.closeCreateAlbumModal();
            return;
        }
        if (this.viewerEntry) this.closeViewer();
    }

    goUp(): void {
        if (this.currentView === 'album-detail') {
            this.router.navigate(['/home/explorer'], {
                queryParams: { view: 'albums', path: null, search: null },
            });
            return;
        }
        if (!this.currentPath) return;
        const parent = this.currentPath.split("/").slice(0, -1).join("/");
        this.load(parent);
    }

    get breadcrumbs(): { name: string; path: string }[] {
        if (this.currentView === 'gallery') return [{ name: 'Mi galería', path: '' }];
        if (this.currentView === 'videos') return [{ name: 'Vídeos', path: '' }];
        if (this.currentView === 'recent') return [{ name: 'Añadido recientemente', path: '' }];
        if (this.currentView === 'favorites') return [{ name: 'Favoritos', path: '' }];
        if (this.currentView === 'archive') return [{ name: 'Archivo', path: '' }];
        if (this.currentView === 'albums') return [{ name: 'Álbumes', path: '' }];
        if (this.currentView === 'album-detail') {
            return [
                { name: 'Álbumes', path: '__albums__' },
                { name: this.currentAlbumTitle, path: '' }
            ];
        }
        if (!this.currentPath) return [];
        const parts = this.currentPath.split("/").filter(Boolean);
        let acc = "";
        return parts.map((name) => {
            acc = acc ? `${acc}/${name}` : name;
            return { name: this.smartFolderTitle(name), path: acc };
        });
    }

    goToBreadcrumb(path: string): void {
        if (path === '__albums__') {
            this.router.navigate(['/home/explorer'], {
                queryParams: { view: 'albums', path: null, search: null },
            });
            return;
        }
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
        if (this.currentView === 'favorites') return 'Favoritos';
        if (this.currentView === 'archive') return 'Archivo';
        if (this.currentView === 'albums') return 'Álbumes';
        if (this.currentView === 'album-detail') return this.currentAlbumTitle || 'Álbum';
        if (this.isSearching) return 'Resultados';
        const parts = this.currentPath.split('/').filter(Boolean);
        if (parts.length === 0) return 'Inicio';
        return this.smartFolderTitle(parts[parts.length - 1]);
    }

    get pageSubtitle(): string {
        if (this.currentView === 'gallery') return 'Todas tus fotos y vídeos en un solo lugar.';
        if (this.currentView === 'videos') return 'Todos los vídeos guardados en tu espacio.';
        if (this.currentView === 'recent') return 'Archivos añadidos o guardados en las últimas 24 horas.';
        if (this.currentView === 'favorites') return 'Tus fotos y vídeos marcados como favoritos.';
        if (this.currentView === 'archive') return 'Archivos archivados que no se muestran en tu galería general.';
        if (this.currentView === 'albums') return 'Colecciones y álbumes organizados de tus fotos.';
        if (this.currentView === 'album-detail') return 'Fotos y vídeos agrupados en este álbum.';
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
        return this.currentView === 'albums' || (this.currentPath || "").toLowerCase().startsWith("album");
    }

    get emptyStateTitle(): string {
        if (this.isSearching) return 'Sin resultados para tu búsqueda.';
        if (this.currentView === 'favorites') return 'Aún no tienes fotos en favoritos.';
        if (this.currentView === 'archive') return 'El archivo está vacío.';
        if (this.currentView === 'videos') return 'Aún no tienes vídeos.';
        if (this.currentView === 'recent') return 'No hay archivos recientes.';
        if (this.currentView === 'albums') return 'Crea tu primer álbum';
        if (this.currentView === 'album-detail') return 'Este álbum está vacío todavía.';
        if (this.isGalleryMode) return 'Aún no tienes imágenes ni videos.';
        if (this.isAlbumsFolder) return 'Crea tu primer álbum';
        return 'Esta carpeta está vacía todavía.';
    }

    get emptyStateDescription(): string {
        if (this.isSearching) return 'Prueba con otro término o borra la búsqueda desde la barra superior.';
        if (this.currentView === 'favorites') return 'Toca el corazón en cualquier foto o video para guardarlo como favorito.';
        if (this.currentView === 'archive') return 'Cuando archives fotos o videos, se ocultarán de tu galería y se guardarán aquí.';
        if (this.currentView === 'videos') return 'Envía o sube un vídeo al bot en Telegram para verlo aquí.';
        if (this.currentView === 'recent') return 'Los archivos guardados en las últimas 24 horas aparecerán automáticamente aquí.';
        if (this.currentView === 'albums') return 'Organiza y agrupa tus fotos y vídeos en colecciones personalizadas sin duplicar espacio.';
        if (this.currentView === 'album-detail') return 'Selecciona fotos de tu galería y agrégalas a este álbum.';
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
            if (this.currentView === 'albums') {
                this.loadAlbums();
            } else {
                this.load(this.currentPath || 'Albumes');
            }
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
        const n = (entry.title || entry.name).toLowerCase().replace(/í/g, 'i');
        if (n.startsWith('imagen')) return 'blue';
        if (n.startsWith('video')) return 'purple';
        if (n.startsWith('audio')) return 'green';
        if (n.startsWith('document')) return 'amber';
        if (n.startsWith('album')) return 'purple';
        if (n.startsWith('favorit')) return 'amber';
        if (n.startsWith('reciente') || n.startsWith('anadido')) return 'blue';
        if (n.startsWith('archiv')) return 'green';
        if (n.startsWith('papeler') || n.startsWith('trash')) return 'amber';
        return 'purple';
    }

    folderSubtitle(entry: ExplorerEntry): string {
        if (this.currentView === 'albums' || entry.itemCount !== undefined) {
            const count = entry.itemCount ?? 0;
            return `${count} elemento${count === 1 ? '' : 's'}`;
        }
        return 'Carpeta';
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
                if (this.currentView === 'gallery') {
                    this.loadGallery();
                } else if (this.currentView === 'favorites') {
                    this.loadFavorites();
                } else if (this.currentView === 'archive') {
                    this.loadArchived();
                } else if (this.currentView === 'album-detail') {
                    this.loadAlbumContent(this.currentAlbumTitle);
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
        return entry.path || entry.id || entry.name;
    }
}
