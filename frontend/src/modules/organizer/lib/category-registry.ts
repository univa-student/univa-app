import { BriefcaseBusinessIcon, GraduationCapIcon, HeartHandshakeIcon, type LucideIcon } from "lucide-react";
import type { TaskCategory } from "../model/types";

export interface TaskCategoryDefinition {
    id: TaskCategory;
    label: string;
    description: string;
    icon: LucideIcon;
    accentClassName: string;
}

export const taskCategoryRegistry: Record<TaskCategory, TaskCategoryDefinition> = {
    study: {
        id: "study",
        label: "Навчання",
        description: "Завдання, пов’язані з навчанням і предметами.",
        icon: GraduationCapIcon,
        accentClassName: "bg-sky-500/10 text-sky-600",
    },
    personal: {
        id: "personal",
        label: "Особисте",
        description: "Побутові, щоденні й особисті справи.",
        icon: HeartHandshakeIcon,
        accentClassName: "bg-rose-500/10 text-rose-600",
    },
    work: {
        id: "work",
        label: "Робота",
        description: "Підробіток, side tasks та робочі активності.",
        icon: BriefcaseBusinessIcon,
        accentClassName: "bg-amber-500/10 text-amber-600",
    },
};

export const taskCategoryOptions = Object.values(taskCategoryRegistry);

export function getTaskCategoryDefinition(category: TaskCategory) {
    return taskCategoryRegistry[category];
}
