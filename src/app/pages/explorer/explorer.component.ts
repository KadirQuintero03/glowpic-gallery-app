import { Component, OnInit } from "@angular/core";
import { ExplorerEntry, ExplorerService } from "src/app/services/explorer/explorer.service";

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
                this.entries = res.entries;
                this.loading = false;
            },
            error: (err) => {
                console.error("Error al listar directorio:", err);
                this.errorMessage = "No se pudo cargar el directorio.";
                this.loading = false;
            },
        });
    }

    openEntry(entry: ExplorerEntry): void {
        if (entry.type === "directory") {
            this.load(entry.path);
        } else {
            window.open(this.explorerService.getFileUrl(entry.path), "_blank");
        }
    }

    goUp(): void {
        if (!this.currentPath) return;
        const parent = this.currentPath.split("/").slice(0, -1).join("/");
        this.load(parent);
    }

    isImage(name: string): boolean {
        return /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
    }
}