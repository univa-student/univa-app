import { AlertCircleIcon, CalendarDaysIcon, FolderOpenIcon, SparklesIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/shared/shadcn/ui/card";
import { Button } from "@/shared/shadcn/ui/button";
import { DashboardSectionHeading } from "./dashboard-section-heading";

const actions = [
    {
        to: "/dashboard/schedule/calendar",
        label: "Розклад",
        icon: CalendarDaysIcon,
    },
    {
        to: "/dashboard/deadlines",
        label: "Дедлайни",
        icon: AlertCircleIcon,
    },
    {
        to: "/dashboard/files",
        label: "Файли",
        icon: FolderOpenIcon,
    },
    {
        to: "/dashboard/ai",
        label: "AI-центр",
        icon: SparklesIcon,
    },
];

export function DashboardQuickActions() {
    return (
        <Card className="rounded-[28px] border-border/70 shadow-sm">
            <CardHeader>
                <DashboardSectionHeading
                    eyebrow="Навігація"
                    title="Швидкі дії"
                    description="Ключові переходи без зайвого шуму."
                />
            </CardHeader>
            <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {actions.map(({ to, label, icon: Icon }) => (
                        <Button
                            key={to}
                            variant="outline"
                            className="h-auto justify-start rounded-3xl border-border/70 bg-background px-4 py-4 text-left hover:bg-muted/60"
                            asChild
                        >
                            <Link to={to}>
                                <div className="flex items-center gap-3">
                                    <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10">
                                        <Icon className="size-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{label}</p>
                                        <p className="text-xs text-muted-foreground">Відкрити модуль</p>
                                    </div>
                                </div>
                            </Link>
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
