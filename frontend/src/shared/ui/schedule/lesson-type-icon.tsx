import {
    BookOpenIcon, ZapIcon, FlaskConicalIcon,
    MessageSquareIcon, UserIcon, GraduationCapIcon,
} from "lucide-react";

interface Props {
    code: string;
    className?: string;
}

export function LessonTypeIcon({ code, className }: Props) {
    const cls = `w-3.5 h-3.5 shrink-0 ${className ?? ""}`;
    if (code === "lecture") return <BookOpenIcon className={cls} />;
    if (code === "practice") return <ZapIcon className={cls} />;
    if (code === "lab") return <FlaskConicalIcon className={cls} />;
    if (code === "seminar") return <MessageSquareIcon className={cls} />;
    if (code === "consultation") return <UserIcon className={cls} />;
    if (code === "exam") return <GraduationCapIcon className={cls} />;
    return <BookOpenIcon className={cls} />;
}
