import React from "react";
import type { LessonInstance } from "@/entities/schedule/model/types";
import { fmtTime } from "@/widgets/schedule-calendar/schedule.utils";
import { ModeBadge } from "./mode-badge";
import { LessonTypeIcon } from "./lesson-type-icon";
import { MapPinIcon, UserIcon } from "lucide-react";

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
        <div
            onClick={onClick}
            className="absolute left-1 right-1 rounded-xl overflow-hidden transition-all duration-150 hover:z-30 hover:shadow-xl hover:-translate-y-px cursor-pointer select-none"
            style={{
                ...style,
                background: `${accent}12`,
                border: `1px solid ${accent}25`,
                borderLeftWidth: 3,
                borderLeftColor: accent,
            }}
        >
            {/* Gradient sheen */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: `linear-gradient(160deg, ${accent}18 0%, transparent 55%)` }}
            />

            <div className="relative px-2.5 pt-2 pb-1.5 h-full flex flex-col gap-0.5">
                {/* Time + badges */}
                <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold tabular-nums" style={{ color: `${accent}cc` }}>
                        {fmtTime(inst.startsAt)}–{fmtTime(inst.endsAt)}
                    </span>
                    <div className="flex items-center gap-1">
                        {!compact && <ModeBadge code={inst.deliveryMode?.code ?? "offline"} />}
                        {isExam && (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
                                Іспит
                            </span>
                        )}
                    </div>
                </div>

                {/* Subject name */}
                <div className="text-[14px] font-bold leading-tight" style={{ color: accent }}>
                    {inst.subject?.name ?? "Предмет"}
                </div>

                {!compact && (
                    <>
                        <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-auto pt-0.5">
                            {inst.lessonType && (
                                <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
                                    <LessonTypeIcon code={inst.lessonType.code} />
                                    {inst.lessonType.name}
                                </span>
                            )}
                            {inst.location && (
                                <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
                                    <MapPinIcon className="w-3.5 h-3.5 shrink-0" />
                                    {inst.location}
                                </span>
                            )}
                        </div>
                        {inst.subject?.teacherName && (
                            <div className="flex items-center gap-1 text-[12px] text-muted-foreground truncate">
                                <UserIcon className="w-3.5 h-3.5 shrink-0" />
                                {inst.subject.teacherName}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
