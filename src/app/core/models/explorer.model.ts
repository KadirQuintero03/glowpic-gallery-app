export type FileKind = "directory" | "image" | "video" | "audio" | "document";
export type ViewMode = "grid" | "list";

export interface ExplorerEntry {
    name: string;
    type: "directory" | "file";
    path: string;
    size?: number;
    modifiedAt?: number;
    width?: number;
    height?: number;
    isFavorite?: boolean;
    isArchived?: boolean;
    // Campos opcionales para álbumes y resúmenes
    id?: string;
    title?: string;
    itemCount?: number;
    coverPath?: string;
    createdAt?: number;
}

export interface ExplorerResponse {
    currentPath: string;
    entries: ExplorerEntry[];
}

export interface DateGroup {
    key: string;
    label: string;
    entries: ExplorerEntry[];
}

export interface AlbumSummary {
    id: string;
    title: string;
    path?: string;
    itemCount: number;
    coverPath?: string;
    createdAt?: number;
}
