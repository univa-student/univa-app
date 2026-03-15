import {
    Sparkles, FileText, Brain, BookOpen, GraduationCap,
    ArrowRight, Clock3, Zap, ChevronRight,
    Search, Send, MessageSquarePlus, Activity
} from "lucide-react";

const tools = [
    {
        title: "Конспекти",
        description: "Генерація з лекцій та PDF",
        icon: FileText,
        accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    },
    {
        title: "Пояснення тем",
        description: "Просто або академічно",
        icon: Brain,
        accent: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    },
    {
        title: "Тести",
        description: "Флеш-картки та квізи",
        icon: GraduationCap,
        accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
        title: "Тексти",
        description: "Есе, курсові, структура",
        icon: BookOpen,
        accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
];

const quickPrompts = [
    "Зроби короткий конспект з...",
    "Поясни як п'ятирічному...",
    "Створи 10 питань для тесту з...",
    "Перевір структуру мого есе...",
];

const recentArtifacts = [
    { title: "Теорія ймовірностей: лекція 4", type: "Конспект", time: "2 год тому" },
    { title: "Делегування повноважень", type: "Пояснення", time: "Вчора" },
    { title: "Маркетинг: модуль 1", type: "Тест", time: "2 дні тому" },
];

export function AiHome() {
    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 font-sans">

            {/* Header & Main Prompt Area */}
            <div className="mx-auto max-w-3xl text-center mb-12">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground mb-6">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    AI Assistant готовий до роботи
                </div>

                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-8">
                    Що будемо вчити сьогодні?
                </h1>

                {/* Omni-Input */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 rounded-[24px] bg-gradient-to-r from-blue-500/20 via-violet-500/20 to-emerald-500/20 opacity-50 blur-md transition duration-500 group-hover:opacity-75" />
                    <div className="relative flex items-center gap-2 rounded-[24px] border border-border/70 bg-background/90 backdrop-blur-sm p-2 shadow-sm transition-shadow focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
                        <div className="pl-4 text-muted-foreground">
                            <Search className="h-5 w-5" />
                        </div>
                        <input
                            type="text"
                            placeholder="Напиши тему, завантаж файл або встав посилання..."
                            className="flex-1 bg-transparent px-2 py-3.5 text-sm sm:text-base outline-none placeholder:text-muted-foreground/70"
                        />
                        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 active:scale-95">
                            <Send className="h-4 w-4 ml-0.5" />
                        </button>
                    </div>
                </div>

                {/* Quick Prompts */}
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                    {quickPrompts.map((prompt) => (
                        <button
                            key={prompt}
                            className="rounded-full border border-border/60 bg-card/50 px-4 py-1.5 text-xs text-muted-foreground transition-all hover:bg-muted hover:text-foreground hover:border-border"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">

                {/* Tools Grid (Takes 2 columns) */}
                <div className="md:col-span-2 lg:col-span-2 grid grid-cols-2 gap-4">
                    {tools.map((tool) => {
                        const Icon = tool.icon;
                        return (
                            <button
                                key={tool.title}
                                className="group relative flex flex-col items-start p-5 rounded-3xl border border-border/60 bg-card text-left transition-all hover:-translate-y-1 hover:shadow-lg hover:border-border"
                            >
                                <div className={`mb-4 inline-flex rounded-2xl p-3 border transition-colors group-hover:bg-background ${tool.accent}`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-base font-semibold text-foreground mb-1">
                                    {tool.title}
                                </h3>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                    {tool.description}
                                </p>
                                <ChevronRight className="absolute bottom-5 right-5 h-5 w-5 opacity-0 -translate-x-2 text-muted-foreground transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                            </button>
                        );
                    })}
                </div>

                {/* AI Suggestions / Smart Hub (Takes 1 column) */}
                <div className="md:col-span-1 lg:col-span-1 flex flex-col rounded-3xl border border-border/60 bg-gradient-to-b from-card to-card/50 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                            <Activity className="h-4 w-4 text-primary" />
                            Рекомендації
                        </h3>
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="group cursor-pointer rounded-2xl bg-muted/50 p-4 transition-colors hover:bg-muted">
                            <p className="text-xs font-medium text-blue-500 mb-1">Продовжити</p>
                            <p className="text-sm text-foreground font-medium mb-2">Створити питання з лекції "Менеджмент"</p>
                            <span className="text-xs text-muted-foreground inline-flex items-center gap-1 group-hover:text-foreground transition-colors">
                                Почати <ArrowRight className="h-3 w-3" />
                            </span>
                        </div>
                        <div className="group cursor-pointer rounded-2xl bg-muted/50 p-4 transition-colors hover:bg-muted">
                            <p className="text-xs font-medium text-violet-500 mb-1">Аналіз</p>
                            <p className="text-sm text-foreground font-medium mb-2">2 нових PDF-документи чекають на конспект</p>
                            <span className="text-xs text-muted-foreground inline-flex items-center gap-1 group-hover:text-foreground transition-colors">
                                Опрацювати <ArrowRight className="h-3 w-3" />
                            </span>
                        </div>
                    </div>
                </div>

                {/* Exam Mode & Recents (Takes 1 column) */}
                <div className="md:col-span-3 lg:col-span-1 flex flex-col gap-4">

                    {/* Exam Mode Banner */}
                    <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-6">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-amber-500/10 blur-2xl" />
                        <div className="relative z-10">
                            <div className="mb-2 inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                <Zap className="h-3.5 w-3.5" />
                                Hardcore
                            </div>
                            <h3 className="text-base font-semibold text-foreground mb-1">Режим "Перед іспитом"</h3>
                            <p className="text-xs text-muted-foreground mb-4">
                                ШІ знайде твої слабкі місця та прожене по всім темам.
                            </p>
                            <button className="w-full rounded-xl bg-foreground px-4 py-2.5 text-xs font-medium text-background transition-transform hover:scale-[1.02]">
                                Запустити симуляцію
                            </button>
                        </div>
                    </div>

                    {/* Recent Materials */}
                    <div className="flex-1 rounded-3xl border border-border/60 bg-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-foreground flex items-center gap-2">
                                <Clock3 className="h-4 w-4 text-muted-foreground" />
                                Нещодавні
                            </h3>
                            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                                Усі
                            </button>
                        </div>
                        <div className="space-y-3">
                            {recentArtifacts.map((item, i) => (
                                <div key={i} className="group flex cursor-pointer items-center justify-between rounded-xl p-2 -mx-2 hover:bg-muted/50 transition-colors">
                                    <div className="min-w-0 flex-1 pr-4">
                                        <p className="truncate text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                            {item.title}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">
                                            {item.type} • {item.time}
                                        </p>
                                    </div>
                                    <MessageSquarePlus className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:opacity-100" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}