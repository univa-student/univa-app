import { useSubjectFolder } from "@/modules/schedule/api/hooks";
import { FilesBrowser } from "@/modules/files/ui/files-browser";
import { Skeleton } from "@/shared/shadcn/ui/skeleton";

interface SubjectMaterialsTabProps {
    subjectId: number;
    subjectName: string;
}

export function SubjectMaterialsTab({ subjectId, subjectName }: SubjectMaterialsTabProps) {
    const { data: folder, isLoading } = useSubjectFolder(subjectId);

    if (isLoading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
            </div>
        );
    }

    if (!folder) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                Не вдалося завантажити папку предмета.
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[600px] border border-border/50 rounded-2xl overflow-hidden bg-background">
            <FilesBrowser baseFolder={{ id: folder.id, name: subjectName }} />
        </div>
    );
}
