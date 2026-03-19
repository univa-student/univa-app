import { useState, useMemo } from "react";
import { PlusIcon, LayoutGridIcon, ListIcon } from "lucide-react";
import { useDeadlines } from "@/modules/deadlines/api/hooks";
import { useSubjects } from "@/modules/schedule/api/hooks";
import { DeadlineCard } from "./deadline-card";
import { DeadlinesFilters, type DeadlineFiltersState } from "./deadlines-filters";
import { CreateDeadlineDialog } from "@/modules/deadlines/ui/create-deadline/create-deadline-dialog";
import { Button } from "@/shared/shadcn/ui/button";

interface Props {
    baseFilters?: Record<string, any>;
    title?: string;
    showFilters?: boolean;
    className?: string;
}

export function DeadlinesBoard({ baseFilters = {}, title = "Всі завдання", showFilters = true, className = "" }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");
    const [filters, setFilters] = useState<DeadlineFiltersState>({ search: "" });

    // Merge static (base) filters with dynamic user filters for the API call
    const activeFilters = useMemo(() => {
        const merged: Record<string, any> = { ...baseFilters };
        if (filters.search) merged.search = filters.search;
        if (filters.subjectId) merged.subjectId = filters.subjectId;
        if (filters.status) merged.status = filters.status;
        if (filters.priority) merged.priority = filters.priority;
        if (filters.type) merged.type = filters.type;
        if (filters.sortBy) merged.sortBy = filters.sortBy;
        if (filters.sortDir) merged.sortDir = filters.sortDir;
        return merged;
    }, [baseFilters, filters]);

    const { data: deadlines, isLoading } = useDeadlines(activeFilters);
    const { data: subjects = [] } = useSubjects();

    return (
        <div className={`space-y-6 ${className}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold">{title}</h2>
                <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded-md p-1 bg-background shadow-sm hidescrollbar w-max mr-2">
                        <Button
                            variant={viewMode === "list" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => setViewMode("list")}
                        >
                            <ListIcon className="size-4" />
                        </Button>
                        <Button
                            variant={viewMode === "grid" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => setViewMode("grid")}
                        >
                            <LayoutGridIcon className="size-4" />
                        </Button>
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Новий дедлайн
                    </Button>
                </div>
            </div>

            {showFilters && (
                <DeadlinesFilters
                    filters={filters}
                    onChange={setFilters}
                    subjects={subjects}
                />
            )}

            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-3"}>
                {isLoading ? (
                    <div className="py-12 text-center text-muted-foreground animate-pulse">
                        Завантаження завдань...
                    </div>
                ) : !deadlines?.length ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl border-dashed bg-muted/30">
                        <div className="bg-primary/10 text-primary p-4 rounded-full mb-4">
                            <PlusIcon className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-semibold">Список порожній</h3>
                        <p className="text-muted-foreground text-sm max-w-sm mt-1">
                            Тут поки немає жодних дедлайнів за обраними фільтрами.
                        </p>
                    </div>
                ) : (
                    deadlines.map(deadline => (
                        <DeadlineCard
                            key={deadline.id}
                            deadline={deadline}
                            subjectName={subjects.find(s => s.id === deadline.subjectId)?.name}
                            subjects={subjects}
                            viewMode={viewMode}
                        />
                    ))
                )}
            </div>

            <CreateDeadlineDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                subjects={subjects}
                prefillSubjectId={baseFilters.subjectId ? Number(baseFilters.subjectId) : undefined}
            />
        </div>
    );
}
