import { Link } from "react-router-dom";
import { ArrowRightIcon } from "lucide-react";
import { DeadlinesBoard } from "@/modules/deadlines/ui/deadlines-board";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/shadcn/ui/card";
import { Button } from "@/shared/shadcn/ui/button";

export function DeadlinesCard() {
    return (
        <Card className="flex flex-col h-full border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-xl">Найближчі дедлайни</CardTitle>
                    <CardDescription>Завдання, які потребують вашої уваги</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                    <Link to="/dashboard/deadlines">
                        Всі дедлайни <ArrowRightIcon className="ml-2 size-4" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent className="flex-1 p-0 sm:p-6 sm:pt-0">
                <DeadlinesBoard
                    showFilters={false}
                    title=""
                    baseFilters={{ timeFrame: "upcoming", sortBy: "dueAt", sortDir: "asc" }}
                    className="space-y-0"
                />
            </CardContent>
        </Card>
    );
}
