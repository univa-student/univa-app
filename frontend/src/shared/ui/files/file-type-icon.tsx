import {
    ImageIcon, FileTextIcon, FileSpreadsheetIcon,
    PresentationIcon, ArchiveIcon, FileIcon,
} from "lucide-react";

export type MimeGroup = "img" | "pdf" | "doc" | "xls" | "ppt" | "zip" | "other";

export function mimeGroup(mime: string | null): MimeGroup {
    if (!mime) return "other";
    if (mime.startsWith("image/")) return "img";
    if (mime === "application/pdf") return "pdf";
    if (mime.includes("word") || mime.includes("document")) return "doc";
    if (mime.includes("sheet") || mime.includes("excel")) return "xls";
    if (mime.includes("presentation") || mime.includes("powerpoint")) return "ppt";
    if (mime.includes("zip") || mime.includes("compressed") || mime.includes("archive")) return "zip";
    return "other";
}

export const mimeColorMap: Record<MimeGroup, string> = {
    pdf: "bg-red-500/12 text-red-600 dark:text-red-400",
    doc: "bg-blue-500/12 text-blue-600 dark:text-blue-400",
    xls: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
    ppt: "bg-orange-500/12 text-orange-600 dark:text-orange-400",
    img: "bg-violet-500/12 text-violet-600 dark:text-violet-400",
    zip: "bg-slate-500/12 text-slate-600 dark:text-slate-400",
    other: "bg-muted text-muted-foreground",
};

export function isPreviewable(mime: string | null): boolean {
    if (!mime) return false;
    return mime.startsWith("image/") || mime === "application/pdf";
}

export function FileTypeIcon({ mime }: { mime: string | null }) {
    const g = mimeGroup(mime);
    const cls = "size-4";
    if (g === "img") return <ImageIcon className={cls} />;
    if (g === "pdf") return <FileTextIcon className={cls} />;
    if (g === "doc") return <FileTextIcon className={cls} />;
    if (g === "xls") return <FileSpreadsheetIcon className={cls} />;
    if (g === "ppt") return <PresentationIcon className={cls} />;
    if (g === "zip") return <ArchiveIcon className={cls} />;
    return <FileIcon className={cls} />;
}

export function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatFileDate(iso: string): string {
    return new Date(iso).toLocaleDateString("uk-UA", {
        day: "numeric", month: "short", year: "numeric",
    });
}
