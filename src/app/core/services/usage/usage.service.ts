import { Injectable } from "@angular/core";
import { formatSize } from "@shared/utils/file-size.utils";

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

    get percent(): number {
        if (UsageService.LIMIT_BYTES <= 0) return 0;
        const pct = (this.totalBytes / UsageService.LIMIT_BYTES) * 100;
        return Math.min(100, Math.round(pct));
    }

    get sizeLabel(): string {
        return formatSize(this.totalBytes);
    }
}