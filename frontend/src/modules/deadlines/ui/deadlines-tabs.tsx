import { useState } from "react";
import { DeadlinesBoard } from "@/modules/deadlines/ui/deadlines-board";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/shadcn/ui/tabs";
import { useDeadlinesStats } from "@/modules/deadlines/api/hooks";

function getBaseFilters(tab: string) {
    switch (tab) {
        case "today": return { timeFrame: "today" };
        case "upcoming": return { timeFrame: "upcoming", sortBy: "dueAt", sortDir: "asc" };
        case "overdue": return { timeFrame: "overdue", sortBy: "dueAt", sortDir: "asc" };
        case "completed": return { status: "completed", sortBy: "dueAt", sortDir: "desc" };
        case "all":
        default: return { sortBy: "dueAt", sortDir: "asc" };
    }
}

function getTitle(tab: string) {
    switch (tab) {
        case "today": return "Сьогодні";
        case "upcoming": return "Найближчі завдання";
        case "overdue": return "Прострочені завдання";
        case "completed": return "Виконані завдання";
        case "all":
        default: return "Всі завдання";
    }
}

export function DeadlinesTabs() {
    const [activeTab, setActiveTab] = useState("all");
    const { data: stats } = useDeadlinesStats();

    return (
        <div className="flex h-full flex-col">
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <TabsList className="bg-muted/50 w-full sm:w-auto overflow-x-auto justify-start flex-nowrap hidescrollbar">
                            <TabsTrigger value="all">Всі {stats?.all !== undefined ? `(${stats.all})` : ""}</TabsTrigger>
                            <TabsTrigger value="today">Сьогодні {stats?.today !== undefined ? `(${stats.today})` : ""}</TabsTrigger>
                            <TabsTrigger value="upcoming">Найближчі {stats?.upcoming !== undefined ? `(${stats.upcoming})` : ""}</TabsTrigger>
                            <TabsTrigger value="overdue">Прострочені {stats?.overdue !== undefined ? `(${stats.overdue})` : ""}</TabsTrigger>
                            <TabsTrigger value="completed">Виконані {stats?.completed !== undefined ? `(${stats.completed})` : ""}</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value={activeTab} className="mt-0 outline-none border-none">
                        <DeadlinesBoard
                            title={getTitle(activeTab)}
                            baseFilters={getBaseFilters(activeTab)}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
