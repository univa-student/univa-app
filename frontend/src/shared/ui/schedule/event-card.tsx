import React from "react";
import type { LessonInstance } from "@/entities/schedule/model/types";
import { fmtTime } from "@/widgets/schedule-calendar/schedule.utils";
import { ModeBadge } from "./mode-badge";
import { LessonTypeIcon } from "./lesson-type-icon";
import { MapPinIcon, UserIcon, PaperclipIcon } from "lucide-react";

interface EventCardProps {
    inst: LessonInstance;
    style?: React.CSSProperties;
    compact?: boolean;
    onClick?: () => void;
}

export function EventCard({ inst, style, compact, onClick }: EventCardProps) {
    const accent = inst.subject?.color ?? "#6366f1";
    const isExam = inst.source === "exam";

    return (
        <button
            type="button"
            onClick={onClick}
            className="absolute left-2 right-2 z-10 overflow-hidden rounded-2xl border bg-card/95 text-left shadow-sm backdrop-blur-[2px] transition-all duration-150 hover:z-30 hover:-translate-y-px hover:shadow-lg"
            style={{
                ...style,
                borderColor: `${accent}26`,
            }}
        >
            {/* Top accent line */}
            <div
                className="absolute inset-x-0 top-0 h-1.5"
                style={{
                    background: `linear-gradient(90deg, ${accent}, ${accent}99)`,
                }}
            />

            {/* Soft glow */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background: `linear-gradient(180deg, ${accent}10 0%, transparent 55%)`,
                }}
            />

            <div className="relative flex h-full flex-col gap-2 px-3 py-3 pt-3.5">
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                        <span
                            className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums"
                            style={{
                                backgroundColor: `${accent}14`,
                                color: accent,
                            }}
                        >
                            {fmtTime(inst.startsAt)}–{fmtTime(inst.endsAt)}
                        </span>

                        {isExam && (
                            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                                Іспит
                            </span>
                        )}
                    </div>

                    {!compact && (
                        <div className="flex shrink-0 items-center gap-1">
                            <ModeBadge code={inst.deliveryMode?.code ?? "offline"} />
                        </div>
                    )}
                </div>

                {/* Title */}
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <div className="flex items-start gap-2">
                            <span
                                className="mt-1 size-2 shrink-0 rounded-full"
                                style={{ backgroundColor: accent }}
                            />
                            <div className="min-w-0">
                                <p className="line-clamp-2 text-[14px] font-semibold leading-tight text-foreground">
                                    {inst.subject?.name ?? "Предмет"}
                                </p>

                                {!compact && inst.lessonType && (
                                    <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                                        <LessonTypeIcon code={inst.lessonType.code} />
                                        <span>{inst.lessonType.name}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {(inst.subject?.files_count ?? 0) > 0 && (
                        <div
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border/50 bg-background/80 shadow-sm"
                            title="Є матеріали"
                        >
                            <PaperclipIcon className="h-3 w-3" style={{ color: accent }} />
                        </div>
                    )}
                </div>

                {/* Bottom meta */}
                {!compact && (
                    <div className="mt-auto space-y-1 text-[11px] text-muted-foreground">
                        {inst.location && (
                            <div className="flex items-center gap-1.5 truncate">
                                <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{inst.location}</span>
                            </div>
                        )}

                        {inst.subject?.teacherName && (
                            <div className="flex items-center gap-1.5 truncate">
                                <UserIcon className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{inst.subject.teacherName}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </button>
    );
}