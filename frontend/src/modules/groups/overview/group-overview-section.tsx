import { ActivityIcon, CalendarDaysIcon, FilesIcon } from "lucide-react";

import type { Group, GroupOverview } from "@/modules/groups/model/types";
import { Badge } from "@/shared/shadcn/ui/badge";
import { Card, CardContent } from "@/shared/shadcn/ui/card";

import { EmptyState, SectionHeader, StatCard } from "../shared/ui";
import { formatDateTime } from "../shared/utils";

interface GroupOverviewSectionProps {
    group: Group;
    overview: GroupOverview | undefined;
    counts: {
        announcements: number;
        subjects: number;
        schedule: number;
        deadlines: number;
        files: number;
        polls: number;
        members: number;
        chat: number;
    };
}

export function GroupOverviewSection({
    group,
    overview,
    counts,
}: GroupOverviewSectionProps) {
    const summaryCards = [
        { label: "Учасники", value: counts.members, hint: "Активний склад групи" },
        { label: "Предмети", value: counts.subjects, hint: "Прив'язані групові предмети" },
        { label: "Події", value: counts.schedule, hint: "Розклад у поточному діапазоні" },
        { label: "Файли", value: counts.files, hint: "Останні групові матеріали" },
    ];

    return (
        <div>
            <SectionHeader
                eyebrow="Overview"
                title={group.name}
                badges={
                    <>
                        <Badge variant="outline">{group.code}</Badge>
                        <Badge variant="outline">
                            {group.visibility === "public" ? "Публічна" : "Приватна"}
                        </Badge>
                    </>
                }
            />

            <div className="space-y-6 p-4 md:p-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {summaryCards.map((card) => (
                        <StatCard
                            key={card.label}
                            label={card.label}
                            value={card.value}
                            hint={card.hint}
                        />
                    ))}
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                    <Card className="border-border/70">
                        <CardContent className="space-y-4 p-5">
                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <ActivityIcon className="size-4 text-primary" />
                                Остання активність
                            </div>

                            {overview?.recentActivity?.length ? (
                                <div className="space-y-3">
                                    {overview.recentActivity.slice(0, 6).map((item) => (
                                        <div
                                            key={item.id}
                                            className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="text-sm font-medium text-foreground">
                                                    {item.user
                                                        ? `${item.user.firstName} ${item.user.lastName ?? ""}`.trim()
                                                        : "Учасник"}
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDateTime(item.createdAt)}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                {item.content || "Системна подія без тексту"}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    title="Активності ще немає"
                                    description="Після перших повідомлень, файлів і оголошень тут з'явиться короткий журнал подій."
                                />
                            )}
                        </CardContent>
                    </Card>

                    <div className="grid gap-4">
                        <Card className="border-border/70">
                            <CardContent className="space-y-4 p-5">
                                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <CalendarDaysIcon className="size-4 text-primary" />
                                    Найближчий розклад
                                </div>

                                {overview?.upcomingSchedule?.length ? (
                                    <div className="space-y-3">
                                        {overview.upcomingSchedule.slice(0, 4).map((item) => (
                                            <div
                                                key={`${item.id}-${item.date}`}
                                                className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="size-2.5 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                item.subject.color ?? "#2563eb",
                                                        }}
                                                    />
                                                    <span className="text-sm font-medium text-foreground">
                                                        {item.subject.name}
                                                    </span>
                                                </div>
                                                <p className="mt-2 text-sm text-muted-foreground">
                                                    {item.date} · {item.startsAt}
                                                    {item.endsAt ? ` – ${item.endsAt}` : ""}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        title="Розклад ще не зібраний"
                                        description="Додайте або імпортуйте пари, щоб швидко бачити найближчі заняття."
                                    />
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-border/70">
                            <CardContent className="space-y-4 p-5">
                                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <FilesIcon className="size-4 text-primary" />
                                    Останні файли
                                </div>

                                {overview?.recentFiles?.length ? (
                                    <div className="space-y-3">
                                        {overview.recentFiles.slice(0, 4).map((file) => (
                                            <div
                                                key={file.id}
                                                className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3"
                                            >
                                                <div className="text-sm font-medium text-foreground">
                                                    {file.originalName}
                                                </div>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {formatDateTime(file.createdAt)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        title="Файлів поки немає"
                                        description="Імпортуйте власні файли або завантажте нові матеріали в групу."
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <StatCard
                        label="Оголошення"
                        value={counts.announcements}
                        hint="Активні повідомлення для всієї групи."
                    />
                    <StatCard
                        label="Опитування"
                        value={counts.polls}
                        hint="Зібрані голосування та швидкі рішення."
                    />
                    <StatCard
                        label="Канали"
                        value={counts.chat}
                        hint="Канали для загальних та предметних обговорень."
                    />
                </div>
            </div>
        </div>
    );
}
