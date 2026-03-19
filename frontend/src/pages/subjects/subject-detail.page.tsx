import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useSubjects } from "@/modules/schedule/api/hooks";
import usePageTitle from "@/shared/hooks/usePageTitle";
import { DeadlinesBoard } from "@/modules/deadlines/ui/deadlines-board";
import { Skeleton } from "@/shared/shadcn/ui/skeleton";
import { BookOpenIcon, ClockIcon, FolderIcon, FileTextIcon, ColumnsIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/shadcn/ui/tabs";
import { SubjectMaterialsTab } from "@/modules/subjects/ui/subject-materials-tab";

export function SubjectDetailPage() {
    const { id } = useParams<{ id: string }>();
    const subjectId = Number(id);

    const { data: subjects = [], isLoading } = useSubjects();
    const subject = useMemo(() => subjects.find(s => s.id === subjectId), [subjects, subjectId]);

    const [activeTab, setActiveTab] = useState("overview");

    usePageTitle(subject?.name ? `${subject.name} | Дедлайни` : "Деталі предмета | Univa", { suffix: true });

    if (isLoading) {
        return (
            <div className="p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full space-y-6">
                <Skeleton className="h-10 w-1/3 rounded-lg" />
                <Skeleton className="h-64 w-full rounded-xl" />
            </div>
        );
    }

    if (!subject) {
        return (
            <div className="flex flex-col items-center justify-center py-20 h-full text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
                    <BookOpenIcon className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <h2 className="text-xl font-bold">Ой, предмет не знайдено</h2>
                <p className="text-muted-foreground mt-2">Можливо, він був видалений або посилання недійсне.</p>
            </div>
        );
    }

    const { color } = subject;
    const accent = color || "#6366f1";

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Subject Header Background */}
            <div
                className="h-32 sm:h-40 shrink-0 relative flex items-end px-4 md:px-8 pb-6 border-b"
                style={{ background: `linear-gradient(135deg, ${accent}15 0%, transparent 100%)` }}
            >
                <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: accent }} />

                <div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                        <div className="w-4 h-4 rounded-sm shadow-sm" style={{ backgroundColor: accent }} />
                        {subject.name}
                    </h1>
                    {subject.teacherName && (
                        <p className="text-sm text-muted-foreground mt-1.5 flex items-center gap-1.5">
                            <span className="opacity-80">Викладач:</span>
                            <span className="font-medium text-foreground">{subject.teacherName}</span>
                        </p>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-7xl mx-auto flex flex-col h-full">
                    <TabsList className="mb-6 w-fit">
                        <TabsTrigger value="overview" className="flex items-center gap-2">
                            <ColumnsIcon className="w-4 h-4" />
                            Огляд предмета
                        </TabsTrigger>
                        <TabsTrigger value="materials" className="flex items-center gap-2">
                            <FileTextIcon className="w-4 h-4" />
                            Матеріали
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-0 flex-1 flex flex-col xl:flex-row gap-8 outline-none">
                        {/* Left Column - Deadlines */}
                        <div className="flex-1 min-w-0">
                            <DeadlinesBoard
                                title="Завдання з предмету"
                                baseFilters={{ subjectId: String(subject.id) }}
                            />
                        </div>

                        {/* Right Column - Overview Blocks */}
                        <div className="xl:w-80 shrink-0 flex flex-col gap-6">
                            {/* 1. Upcoming Classes Placeholder */}
                            <div className="rounded-2xl border border-border bg-card p-5">
                                <h3 className="font-bold flex items-center gap-2 mb-4">
                                    <ClockIcon className="w-4 h-4 text-muted-foreground" />
                                    Найближчі заняття
                                </h3>
                                <div className="text-center py-6 text-sm text-muted-foreground border border-dashed rounded-lg">
                                    Немає запланованих занять
                                </div>
                            </div>

                            {/* 2. Files Placeholder mapping to Materials Tab */}
                            <div className="rounded-2xl border border-border bg-card p-5 relative overflow-hidden group hover:border-primary/50 transition-colors cursor-pointer"
                                onClick={() => setActiveTab("materials")}
                            >
                                <h3 className="font-bold flex items-center gap-2 mb-4">
                                    <FolderIcon className="w-4 h-4 text-muted-foreground" />
                                    Матеріали курсу
                                </h3>
                                <div className="text-center py-6 text-sm text-primary/80 font-medium bg-primary/5 rounded-lg group-hover:bg-primary/10 transition-colors">
                                    Перейти до матеріалів →
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="materials" className="mt-0 outline-none">
                        <SubjectMaterialsTab subjectId={subject.id} subjectName={subject.name} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
