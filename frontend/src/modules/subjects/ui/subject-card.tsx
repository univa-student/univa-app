import React from "react";
import { useNavigate } from "react-router-dom";
import { Edit2Icon, Trash2Icon, UserIcon } from "lucide-react";
import type { Subject } from "../model/types";

interface CardProps {
    subject: Subject;
    onEdit: () => void;
    onDelete: (e: React.MouseEvent, id: number) => void;
}

export function SubjectCard({ subject, onEdit, onDelete }: CardProps) {
    const accent = subject.color || "#6366f1";
    const navigate = useNavigate();

    return (
        <div
            className="group relative rounded-2xl border border-border overflow-hidden cursor-pointer transition-all duration-150 hover:shadow-md hover:-translate-y-px active:translate-y-0"
            onClick={() => navigate(`/dashboard/schedule/subjects/${subject.id}`)}
        >
            {/* Top accent line */}
            <div
                className="h-1.5 w-full"
                style={{ background: `linear-gradient(90deg, ${accent} 0%, ${accent}60 100%)` }}
            />

            {/* Card body */}
            <div
                className="p-4"
                style={{ background: `linear-gradient(135deg, ${accent}08 0%, transparent 55%)` }}
            >
                {/* Name row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <div
                            className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-offset-2 ring-offset-background transition-colors"
                            style={{ backgroundColor: accent }}
                        />
                        <h3
                            className="font-bold text-sm text-foreground truncate leading-tight"
                            title={subject.name}
                        >
                            {subject.name}
                        </h3>
                    </div>

                    {/* Action buttons — fade in on hover */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 -mt-0.5 -mr-1">
                        <button
                            onClick={e => { e.stopPropagation(); onEdit(); }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            title="Редагувати"
                        >
                            <Edit2Icon className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={e => onDelete(e, subject.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            title="Видалити"
                        >
                            <Trash2Icon className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Teacher */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                    <UserIcon className="w-3 h-3 shrink-0 opacity-60" />
                    <span className="truncate">
                        {subject.teacherName || "Викладач не вказаний"}
                    </span>
                </div>
            </div>
        </div>
    );
}
