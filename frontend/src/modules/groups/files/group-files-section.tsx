import { useMemo, useState, type FormEvent } from "react";
import {
    ArrowDownToLineIcon,
    FolderIcon,
    FolderPlusIcon,
    LayoutGridIcon,
    LayoutListIcon,
    UploadIcon,
} from "lucide-react";

import { API_BASE_URL } from "@/app/config/app.config";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { Button } from "@/shared/shadcn/ui/button";
import { Card, CardContent } from "@/shared/shadcn/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/shadcn/ui/dialog";
import { Input } from "@/shared/shadcn/ui/input";
import { useFiles } from "@/modules/files/api/hooks";
import { FileCardGrid, FileRowList } from "@/modules/files/ui/files-browser/file-cards";
import { FileTypeIcon } from "@/modules/files/ui/file-type-icon";
import { FilePreviewDialog } from "@/modules/files/ui/preview-file/file-preview-dialog";
import {
    useCreateGroupFile,
    useCreateGroupFolder,
    useGroupFiles,
    useGroupFolders,
    useImportGroupFiles,
} from "@/modules/groups/api/hooks";
import type { GroupSubject } from "@/modules/groups/model/types";

import { GroupSelect } from "../shared/group-select";
import { EmptyState, Field, SectionHeader } from "../shared/ui";
import type { GroupRole } from "../shared/view";

interface GroupFilesSectionProps {
    groupId: number;
    subjects: GroupSubject[];
    canManage: boolean;
    requiredRole: GroupRole;
}

function buildGroupDownloadUrl(groupId: number, fileId: number) {
    return `${API_BASE_URL}${ENDPOINTS.groups.downloadFile(groupId, fileId)}`;
}

export function GroupFilesSection({
    groupId,
    subjects,
    canManage,
}: GroupFilesSectionProps) {
    const createGroupFile = useCreateGroupFile();
    const createGroupFolder = useCreateGroupFolder();
    const importGroupFiles = useImportGroupFiles();
    const { data: personalFiles = [] } = useFiles();

    const [folderId, setFolderId] = useState<number | null>(null);
    const [groupSubjectId, setGroupSubjectId] = useState<string>("");
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [isFolderOpen, setIsFolderOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
    const [folderName, setFolderName] = useState("");
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [previewFileId, setPreviewFileId] = useState<number | null>(null);

    const { data: folders = [] } = useGroupFolders(
        groupId,
        folderId,
        groupSubjectId ? Number(groupSubjectId) : undefined,
    );
    const { data: files = [] } = useGroupFiles(
        groupId,
        folderId,
        groupSubjectId ? Number(groupSubjectId) : undefined,
    );

    const previewFile = files.find((file) => file.id === previewFileId) ?? null;

    const subjectOptions = useMemo(
        () => [
            { value: "", label: "Усі предмети" },
            ...subjects.map((subject) => ({
                value: subject.id.toString(),
                label: subject.name,
            })),
        ],
        [subjects],
    );

    async function handleCreateFolder(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        await createGroupFolder.mutateAsync({
            groupId,
            payload: {
                name: folderName.trim(),
                parentId: folderId ?? undefined,
                groupSubjectId: groupSubjectId ? Number(groupSubjectId) : undefined,
            },
        });

        setFolderName("");
        setIsFolderOpen(false);
    }

    async function handleUpload(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!uploadFile) return;

        const formData = new FormData();
        formData.append("file", uploadFile);
        if (folderId) formData.append("folder_id", folderId.toString());
        if (groupSubjectId) formData.append("group_subject_id", groupSubjectId);

        await createGroupFile.mutateAsync({ groupId, payload: formData });

        setUploadFile(null);
        setIsUploadOpen(false);
    }

    async function handleImport() {
        await importGroupFiles.mutateAsync({
            groupId,
            payload: {
                fileIds: selectedFiles,
                groupSubjectId: groupSubjectId ? Number(groupSubjectId) : undefined,
            },
        });

        setSelectedFiles([]);
        setIsImportOpen(false);
    }

    return (
        <div className="rounded-[28px] border border-border/70 bg-card shadow-sm">
            <SectionHeader
                eyebrow="Files"
                title="Файли"
                actions={
                    canManage ? (
                        <>
                            <Button variant="outline" onClick={() => setIsImportOpen(true)}>
                                <ArrowDownToLineIcon className="size-4" />
                                Імпорт із моїх файлів
                            </Button>
                            <Button variant="outline" onClick={() => setIsFolderOpen(true)}>
                                <FolderPlusIcon className="size-4" />
                                Створити папку
                            </Button>
                            <Button onClick={() => setIsUploadOpen(true)}>
                                <UploadIcon className="size-4" />
                                Завантажити
                            </Button>
                        </>
                    ) : null
                }
            />

            <div className="space-y-4 p-4 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="max-w-xs">
                        <Field label="Фільтр за предметом">
                            <GroupSelect
                                value={groupSubjectId}
                                onChange={(value) => {
                                    setGroupSubjectId(value);
                                    setFolderId(null);
                                }}
                                options={subjectOptions}
                            />
                        </Field>
                    </div>

                    <div className="flex items-center rounded-xl border border-border/70 bg-background p-1">
                        <Button
                            type="button"
                            variant={viewMode === "grid" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => setViewMode("grid")}
                        >
                            <LayoutGridIcon className="size-4" />
                        </Button>
                        <Button
                            type="button"
                            variant={viewMode === "list" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => setViewMode("list")}
                        >
                            <LayoutListIcon className="size-4" />
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
                    <Card className="border-border/70">
                        <CardContent className="space-y-3 p-5">
                            <div className="text-sm font-semibold text-foreground">
                                Папки
                            </div>

                            {folderId ? (
                                <Button
                                    variant="outline"
                                    onClick={() => setFolderId(null)}
                                    className="w-full justify-start"
                                >
                                    До кореня
                                </Button>
                            ) : null}

                            {folders.length ? (
                                folders.map((folder) => (
                                    <button
                                        key={folder.id}
                                        type="button"
                                        onClick={() => setFolderId(folder.id)}
                                        className="flex w-full items-center gap-3 rounded-2xl border border-border/70 px-4 py-3 text-left hover:bg-muted/30"
                                    >
                                        <FolderIcon className="size-4 text-primary" />
                                        <span className="text-sm font-medium text-foreground">
                                            {folder.name}
                                        </span>
                                    </button>
                                ))
                            ) : (
                                <EmptyState
                                    title="Папок немає"
                                    description="Створіть першу папку або залишайте файли в корені предмета чи групи."
                                />
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-border/70">
                        <CardContent className="space-y-4 p-5">
                            <div className="text-sm font-semibold text-foreground">
                                Файли
                            </div>

                            {files.length ? (
                                <div
                                    className={
                                        viewMode === "grid"
                                            ? "grid gap-3 md:grid-cols-2 xl:grid-cols-3"
                                            : "space-y-2"
                                    }
                                >
                                    {files.map((file) => {
                                        const downloadUrl = buildGroupDownloadUrl(
                                            groupId,
                                            file.id,
                                        );

                                        return viewMode === "grid" ? (
                                            <FileCardGrid
                                                key={file.id}
                                                file={file}
                                                downloadUrl={downloadUrl}
                                                canManage={false}
                                                canSummarize={false}
                                                onPreview={() => setPreviewFileId(file.id)}
                                                onDownload={() =>
                                                    window.open(downloadUrl, "_blank")
                                                }
                                                onRename={() => {}}
                                                onPin={() => {}}
                                                onDelete={() => {}}
                                                onSummarize={() => {}}
                                            />
                                        ) : (
                                            <FileRowList
                                                key={file.id}
                                                file={file}
                                                canManage={false}
                                                canSummarize={false}
                                                onPreview={() => setPreviewFileId(file.id)}
                                                onDownload={() =>
                                                    window.open(downloadUrl, "_blank")
                                                }
                                                onRename={() => {}}
                                                onPin={() => {}}
                                                onDelete={() => {}}
                                                onSummarize={() => {}}
                                            />
                                        );
                                    })}
                                </div>
                            ) : (
                                <EmptyState
                                    title="Файлів у цій області немає"
                                    description="Спробуйте інший предмет, відкрийте папку або завантажте новий матеріал."
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={isFolderOpen} onOpenChange={setIsFolderOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Створити папку</DialogTitle>
                        <DialogDescription>
                            Папка створюється в поточній області файлів і може бути прив'язана до вибраного предмета.
                        </DialogDescription>
                    </DialogHeader>

                    <form className="space-y-4" onSubmit={handleCreateFolder}>
                        <Field label="Назва папки">
                            <Input
                                required
                                value={folderName}
                                onChange={(event) => setFolderName(event.target.value)}
                                className="h-10 rounded-xl"
                            />
                        </Field>

                        <DialogFooter>
                            <Button type="submit" disabled={createGroupFolder.isPending}>
                                Створити
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Завантажити файл</DialogTitle>
                        <DialogDescription>
                            Окремий upload flow без змішування з переглядом списку файлів.
                        </DialogDescription>
                    </DialogHeader>

                    <form className="space-y-4" onSubmit={handleUpload}>
                        <Field label="Файл">
                            <Input
                                type="file"
                                onChange={(event) =>
                                    setUploadFile(event.target.files?.[0] ?? null)
                                }
                                className="h-10 rounded-xl"
                            />
                        </Field>

                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={!uploadFile || createGroupFile.isPending}
                            >
                                Завантажити
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Імпорт файлів</DialogTitle>
                        <DialogDescription>
                            Вибрані особисті файли будуть перенесені в scope групи через окремий endpoint імпорту.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3">
                        {personalFiles.length ? (
                            personalFiles.map((file) => (
                                <label
                                    key={file.id}
                                    className="flex items-center gap-3 rounded-2xl border border-border/70 px-4 py-3"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedFiles.includes(file.id)}
                                        onChange={(event) =>
                                            setSelectedFiles((current) =>
                                                event.target.checked
                                                    ? [...current, file.id]
                                                    : current.filter((id) => id !== file.id),
                                            )
                                        }
                                    />
                                    <div className="rounded-xl bg-muted/40 p-2 text-muted-foreground">
                                        <FileTypeIcon mime={file.mimeType} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-foreground">
                                            {file.originalName}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {file.updatedAt}
                                        </div>
                                    </div>
                                </label>
                            ))
                        ) : (
                            <EmptyState
                                title="Немає особистих файлів"
                                description="Спочатку завантажте файли у свій простір, після чого вони стануть доступні для імпорту в групу."
                            />
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            onClick={handleImport}
                            disabled={!selectedFiles.length || importGroupFiles.isPending}
                        >
                            Імпортувати файли
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <FilePreviewDialog
                file={previewFile}
                open={Boolean(previewFile)}
                onOpenChange={(open) => {
                    if (!open) setPreviewFileId(null);
                }}
                downloadUrl={
                    previewFile ? buildGroupDownloadUrl(groupId, previewFile.id) : undefined
                }
            />
        </div>
    );
}
