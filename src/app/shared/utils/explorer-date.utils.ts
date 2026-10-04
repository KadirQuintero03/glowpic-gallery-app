import { DateGroup, ExplorerEntry } from "@core/models/explorer.model";

export function sortExplorerEntries(entries: ExplorerEntry[]): ExplorerEntry[] {
    return [...entries].sort((a, b) => {
        if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
        return a.name.localeCompare(b.name, "es", { sensitivity: "base" });
    });
}

export function computeDateGroups(entries: ExplorerEntry[]): DateGroup[] {
    const files = entries.filter((e) => e.type === "file");
    const groupsMap = new Map<string, ExplorerEntry[]>();

    for (const file of files) {
        const key = dateKeyOf(file.modifiedAt);
        const bucket = groupsMap.get(key) ?? [];
        bucket.push(file);
        groupsMap.set(key, bucket);
    }

    return Array.from(groupsMap.entries())
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([key, groupEntries]) => ({
            key,
            label: dateLabelOf(key, groupEntries[0].modifiedAt),
            entries: groupEntries,
        }));
}

function dateKeyOf(modifiedAt?: number): string {
    if (!modifiedAt) return "0000-00-00";
    const d = new Date(modifiedAt);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dateLabelOf(key: string, modifiedAt?: number): string {
    if (key === "0000-00-00" || !modifiedAt) return "Sin fecha";
    const d = new Date(modifiedAt);
    const label = new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long" }).format(d);
    return label.charAt(0).toUpperCase() + label.slice(1);
}
