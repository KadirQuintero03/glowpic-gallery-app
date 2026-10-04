import { Component, HostListener, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { firstValueFrom, Subscription } from "rxjs";
import { DateGroup, ExplorerEntry, FileKind, ViewMode } from "@core/models/explorer.model";
import { AuthService } from "@core/services/auth/auth.service";
import { ExplorerService } from "@core/services/explorer/explorer.service";
import { ThumbnailService } from "@core/services/thumbnail/thumbnail.service";
import type { StoredThumbnail } from "@core/services/thumbnail/thumbnail.service";
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

    thumbnails: Record<string, StoredThumbnail> = {};
    viewMode: ViewMode = "grid";

    searchQuery = "";
    isSearching = false;
    showEmpty = false;

    selectedPaths = new Set<string>();
    deletingPaths = new Set<string>();

    isGalleryMode = false;

    private loadedMode: string | null = null;
    private querySub?: Subscription;

    constructor(
        public explorerService: ExplorerService,
        private thumbnailService: ThumbnailService,
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

            const modeKey = view === "gallery" ? "gallery" : `path:${path}`;
            if (this.loadedMode === modeKey) {
                this.applyFilters();
            } else {
                this.loadedMode = modeKey;
                if (view === "gallery") {
                    this.loadGallery();
                } else {
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

        try {
            this.explorerService.listDirectory(path).subscribe({
                next: (res) => {
                    this.currentPath = res.currentPath;
                    this.entries = sortExplorerEntries(res.entries);
                    this.loading = false;
                    this.setDisplayedEntries();
                    this.preloadThumbnails();
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
        this.isGalleryMode = true;
        this.currentPath = "";
        this.viewerEntry = null;

        try {
            const media: ExplorerEntry[] = [];
            await this.collectMedia("", 0, media);
            this.entries = sortExplorerEntries(media);
            this.setDisplayedEntries();
            this.preloadThumbnails();
            this.syncUsage();
        } catch (err) {
            this.errorMessage = err instanceof Error ? err.message : "No se pudo cargar la galería.";
        } finally {
            this.loading = false;
        }
    }

    private async collectMedia(path: string, depth: number, acc: ExplorerEntry[], maxDepth = 3): Promise<void> {
        if (depth > maxDepth) {
            return;
        }

        try {
            const res = await firstValueFrom(this.explorerService.listDirectory(path));
            for (const entry of res.entries) {
                if (entry.type === "directory") {
                    await this.collectMedia(entry.path, depth + 1, acc, maxDepth);
                } else {
                    const kind = this.kindOf(entry);
                    if (kind === "image" || kind === "video") {
                        acc.push(entry);
                    }
                }
            }
        } catch {
            // Silencioso
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
            // Silencioso
        }
    }

    onVideoMetadata(entry: ExplorerEntry, event: Event): void {
        const video = event.target as HTMLVideoElement;
        if (this.thumbnails[entry.path]) return;

        const capture = () => {
            video.removeEventListener("seeked", capture);
            video.pause();
            this.captureVideoThumbnail(entry, video);
        };

        video.addEventListener("seeked", capture);
        video.currentTime = 0.1;
    }

    private async captureVideoThumbnail(entry: ExplorerEntry, video: HTMLVideoElement): Promise<void> {
        if (this.thumbnails[entry.path]) return;

        try {
            const thumb = await this.thumbnailService.createFromVideo(entry.path, video);
            this.thumbnails = { ...this.thumbnails, [entry.path]: thumb };
        } catch {
            // Silencioso
        }
    }

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

    get username(): string {
        return this.authService.getUsername() ?? '';
    }

    get todayLabel(): string {
        const d = new Date();
        const label = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }).format(d);
        return label.charAt(0).toUpperCase() + label.slice(1);
    }

    get pageTitle(): string {
        if (this.isGalleryMode) return 'Galería';
        if (this.isSearching) return 'Resultados';
        const parts = this.currentPath.split('/').filter(Boolean);
        if (parts.length === 0) return 'Inicio';
        return this.smartFolderTitle(parts[parts.length - 1]);
    }

    get showWelcome(): boolean {
        return (
            !this.loading &&
            !this.errorMessage &&
            !this.isGalleryMode &&
            !this.currentPath &&
            !this.isSearching
        );
    }

    goToGalleryView(): void {
        this.router.navigate(['/home/explorer'], {
            queryParams: { view: 'gallery', path: null, search: null },
        });
    }

    private smartFolderTitle(name: string): string {
        const n = name.toLowerCase();
        if (n.startsWith('imagen')) return 'Imágenes';
        if (n.startsWith('video')) return 'Vídeos';
        if (n.startsWith('audio')) return 'Audio';
        if (n.startsWith('document')) return 'Documentos';
        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    folderTone(entry: ExplorerEntry): string {
        const n = entry.name.toLowerCase();
        if (n.startsWith('imagen')) return 'blue';
        if (n.startsWith('video')) return 'purple';
        if (n.startsWith('audio')) return 'green';
        if (n.startsWith('document')) return 'amber';
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

    trackByGroupKey(_index: number, group: DateGroup): string {
        return group.key;
    }

    trackByEntryPath(_index: number, entry: ExplorerEntry): string {
        return entry.path;
    }
}