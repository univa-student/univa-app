import React from "react";
import type { LessonInstance } from "@/modules/schedule/model/types";
import { fmtTime } from "@/modules/schedule/ui/schedule-calendar/schedule.utils";
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
            className={[
                "absolute left-1.5 right-1.5 z-10 overflow-hidden rounded-xl border-0 text-left",
                "transition-all duration-150 hover:z-30 hover:-translate-y-px hover:brightness-95",
                "outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
            ].join(" ")}
            style={{
                ...style,
                backgroundColor: `${accent}18`,
                borderLeft: `3px solid ${accent}`,
                borderTop: `1px solid ${accent}22`,
                borderRight: `1px solid ${accent}22`,
                borderBottom: `1px solid ${accent}22`,
            }}
        >
            <div className="relative flex h-full flex-col px-2.5 py-2 gap-1">
                {/* Time */}
                <span
                    className="text-[10px] font-semibold tabular-nums leading-none"
                    style={{ color: accent }}
                >
                    {fmtTime(inst.startsAt)}–{fmtTime(inst.endsAt)}
                </span>

                {/* Subject name */}
                <p
                    className={[
                        "font-semibold leading-tight text-foreground",
                        compact ? "text-[11px] line-clamp-1" : "text-[12px] line-clamp-2",
                    ].join(" ")}
                >
                    {inst.subject?.name ?? "Предмет"}
                </p>

                {/* Meta — only when enough space */}
                {!compact && (
                    <div className="mt-auto flex flex-col gap-0.5">
                        {inst.lessonType && (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <LessonTypeIcon code={inst.lessonType.code} />
                                <span className="truncate">{inst.lessonType.name}</span>
                            </div>
                        )}
                        {inst.location && (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground truncate">
                                <MapPinIcon className="size-2.5 shrink-0" />
                                <span className="truncate">{inst.location}</span>
                            </div>
                        )}
                        {inst.subject?.teacherName && (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground truncate">
                                <UserIcon className="size-2.5 shrink-0" />
                                <span className="truncate">{inst.subject.teacherName}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Exam badge */}
                {isExam && (
                    <span className="absolute right-1.5 top-1.5 rounded-full bg-amber-100 px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                        Іспит
                    </span>
                )}

                {/* Files indicator */}
                {(inst.subject?.files_count ?? 0) > 0 && !compact && (
                    <div className="absolute bottom-1.5 right-1.5">
                        <PaperclipIcon className="size-2.5" style={{ color: `${accent}99` }} />
                    </div>
                )}
            </div>
        </button>
    );
}