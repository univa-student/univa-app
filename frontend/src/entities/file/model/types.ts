export type FileStatus = "uploading" | "ready" | "failed" | "deleted";
export type FileScope = "personal" | "subject" | "group";

export interface FileItem {
    id: number;
    userId: number;
    folderId: number | null;
    subjectId: number | null;
    originalName: string;
    mimeType: string | null;
    size: number;
    checksum: string | null;
    storageDisk: string;
    storageKey: string;
    status: FileStatus;
    scope: FileScope;
    isPinned: boolean;
    createdAt: string;
    updatedAt: string;
    folder?: FolderItem | null;
    subject?: { id: number; name: string; color: string | null } | null;
}

export interface FolderItem {
    id: number;
    userId: number;
    parentId: number | null;
    subjectId: number | null;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export interface FolderTreeResponse {
    folders: FolderTreeNode[];
    files: FileItem[];
}

// FolderTreeNode тепер використовує folders замість recursiveChildren
export interface FolderTreeNode extends FolderItem {
    folders: FolderTreeNode[];   // ← було recursiveChildren
    files: FileItem[];
}

// ── Payloads ────────────────────────────────────────────────────────────────

export interface CreateFolderPayload {
    name: string;
    parentId?: number | null;
    subjectId?: number | null;
}

export interface UpdateFolderPayload {
    name?: string;
    parentId?: number | null;
}

export interface UpdateFilePayload {
    name?: string;
    folderId?: number | null;
    isPinned?: boolean;
}
