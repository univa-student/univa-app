import { useState } from "react";
import { ChevronRightIcon, FolderIcon, FolderOpenIcon } from "lucide-react";
import type { FileItem, FolderTreeNode } from "@/entities/file/model/types";
import { FileTypeIcon, mimeColorMap, mimeGroup } from "./file-type-icon";

interface Props {
    node: FolderTreeNode;
    depth: number;
    currentFolderId: number | null;
    onSelectFolder: (id: number | null, name: string) => void;
    onSelectFile: (file: FileItem) => void;
}

export function FolderTreeItem({ node, depth, currentFolderId, onSelectFolder, onSelectFile }: Props) {
    const [expanded, setExpanded] = useState(false);
    const isActive = currentFolderId === node.id;
    const childrenFolders = node.folders || (node as any).recursive_children || [];
    const hasChildren = childrenFolders.length > 0;
    const hasFiles = (node.files?.length ?? 0) > 0;
    const hasContent = hasChildren || hasFiles;
    const fileCount = (node.files?.length ?? 0);

    return (
        <div>
            <div
                className={`group flex items-center gap-1 rounded-lg pr-1 transition-all duration-150
                    ${isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/60"}`}
                style={{ paddingLeft: `${depth * 12 + 4}px` }}
            >
                <button
                    onClick={() => setExpanded(!expanded)}
                    className={`flex shrink-0 size-5 items-center justify-center rounded transition-colors hover:bg-muted ${!hasContent ? "opacity-30" : ""}`}
                >
                    <ChevronRightIcon
                        className={`size-4 text-muted-foreground transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
                    />
                </button>

                <button
                    onClick={() => onSelectFolder(node.id, node.name)}
                    className="flex flex-1 min-w-0 items-center gap-2 py-1.5 text-sm"
                >
                    {expanded
                        ? <FolderOpenIcon className="size-4 shrink-0 text-amber-500" />
                        : <FolderIcon className={`size-4 shrink-0 ${isActive ? "text-amber-500" : "text-amber-400/70"}`} />
                    }
                    <span className={`truncate text-[13px] ${isActive ? "font-semibold" : "font-medium"}`}>
                        {node.name}
                    </span>
                    {fileCount > 0 && (
                        <span className="ml-auto shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground group-hover:bg-background">
                            {fileCount}
                        </span>
                    )}
                </button>
            </div>

            {expanded && (
                <div className="relative">
                    <div
                        className="absolute top-0 bottom-0 w-px bg-border/60"
                        style={{ left: `${depth * 12 + 14}px` }}
                    />
                    {childrenFolders.map((child: FolderTreeNode) => (
                        <FolderTreeItem
                            key={child.id}
                            node={child}
                            depth={depth + 1}
                            currentFolderId={currentFolderId}
                            onSelectFolder={onSelectFolder}
                            onSelectFile={onSelectFile}
                        />
                    ))}
                    {node.files?.map((file: FileItem) => (
                        <div
                            key={`tree-file-${file.id}`}
                            onClick={() => onSelectFile(file)}
                            className="flex items-center gap-2 rounded-lg py-1 pr-1 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground cursor-pointer transition-colors"
                            style={{ paddingLeft: `${(depth + 1) * 12 + 22}px` }}
                        >
                            <div className={`flex size-4 shrink-0 items-center justify-center rounded ${mimeColorMap[mimeGroup(file.mimeType)]}`}>
                                <FileTypeIcon mime={file.mimeType} />
                            </div>
                            <span className="truncate text-[12px]">{file.originalName}</span>
                        </div>
                    ))}
                    {childrenFolders.length === 0 && node.files?.length === 0 && (
                        <div
                            className="text-[11px] text-muted-foreground/60 py-1"
                            style={{ paddingLeft: `${(depth + 1) * 12 + 22}px` }}
                        >
                            Папка порожня
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
