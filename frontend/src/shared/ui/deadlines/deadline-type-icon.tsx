import {
    BookOpenIcon,
    FlaskConicalIcon,
    PencilRulerIcon,
    FileTextIcon,
    PresentationIcon,
    LayersIcon,
    BookTypeIcon,
    GraduationCapIcon,
    CheckSquareIcon,
    MoreHorizontalIcon
} from "lucide-react";
import type { DeadlineType } from "@/entities/deadline/model/types";
import React from "react";

interface Props {
    type: DeadlineType;
    className?: string;
}

// eslint-disable-next-line react-refresh/only-export-components
export const typeConfig: Record<DeadlineType, { icon: React.FC<any>, label: string, color: string }> = {
    homework: { icon: BookOpenIcon, label: "Домашнє завдання", color: "text-blue-500 bg-blue-500/10" },
    lab: { icon: FlaskConicalIcon, label: "Лабораторна", color: "text-emerald-500 bg-emerald-500/10" },
    practice: { icon: PencilRulerIcon, label: "Практична", color: "text-teal-500 bg-teal-500/10" },
    essay: { icon: FileTextIcon, label: "Реферат", color: "text-amber-500 bg-amber-500/10" },
    presentation: { icon: PresentationIcon, label: "Презентація", color: "text-violet-500 bg-violet-500/10" },
    module: { icon: LayersIcon, label: "Модульна", color: "text-orange-500 bg-orange-500/10" },
    coursework: { icon: BookTypeIcon, label: "Курсова", color: "text-indigo-500 bg-indigo-500/10" },
    exam: { icon: GraduationCapIcon, label: "Іспит", color: "text-rose-500 bg-rose-500/10" },
    credit: { icon: CheckSquareIcon, label: "Залік", color: "text-pink-500 bg-pink-500/10" },
    other: { icon: MoreHorizontalIcon, label: "Інше", color: "text-slate-500 bg-slate-500/10" },
};

export function DeadlineTypeIcon({ type, className = "size-4" }: Props) {
    const Icon = typeConfig[type]?.icon || MoreHorizontalIcon;
    return <Icon className={className} />;
}
