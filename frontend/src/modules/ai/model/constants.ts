import { Brain, FileText, BookOpen, GraduationCap } from "lucide-react";

export const AI_WORKSPACES = [
    {
        title: "Конспекти",
        description: "З лекцій, PDF, текстових файлів і нотаток.",
        icon: FileText,
        tag: "Основний сценарій",
        accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
        title: "Пояснення тем",
        description: "Простіше, детальніше або з прикладами.",
        icon: Brain,
        tag: "Subject AI",
        accent: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    },
    {
        title: "Підготовка до тестів",
        description: "Питання, короткі перевірки, флеш-картки.",
        icon: GraduationCap,
        tag: "Quiz",
        accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
        title: "Курсові та реферати",
        description: "Структура, логіка, редагування та перевірка цілісності.",
        icon: BookOpen,
        tag: "Writing",
        accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
];

export const AI_QUICK_ACTIONS = [
    "Зроби коротко",
    "Поясни простіше",
    "Створи питання",
    "Підготуй до тесту",
];
