import { Injectable } from "@angular/core";

/**
 * Conteo de uso del almacenamiento del usuario. El explorador actualiza los
 * totales reales (archivos y bytes) cada vez que lista un directorio o la
 * galería; el panel lateral los muestra en el widget "Almacenamiento".
 */
@Injectable({
    providedIn: "root",
})
export class UsageService {
    static readonly LIMIT_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB

    private totalBytes = 0;
    private fileCount = 0;

    reset(): void {
        this.totalBytes = 0;
        this.fileCount = 0;
    }

    update(fileCount: number, totalBytes: number): void {
        this.fileCount = fileCount;
        this.totalBytes = totalBytes;
    }

    get count(): number {
        return this.fileCount;
    }

    get bytes(): number {
        return this.totalBytes;
    }

    // Porcentaje utilizado respecto al límite (2 GB), redondeado.
    get percent(): number {
        if (UsageService.LIMIT_BYTES <= 0) return 0;
        const pct = (this.totalBytes / UsageService.LIMIT_BYTES) * 100;
        return Math.min(100, Math.round(pct));
    }

    get sizeLabel(): string {
        return formatSize(this.totalBytes);
    }
}

// Formatea un tamaño en bytes a unidades legibles (KB, MB, GB...).
function formatSize(bytes: number): string {
    if (bytes <= 0) return "0 B";
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