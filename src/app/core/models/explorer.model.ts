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
