import usePageTitle from "@/shared/hooks/usePageTitle.ts";
import { useAuthUser } from "@/entities/user/model/useAuthUser";
import { motion } from "framer-motion";
import {
    CalendarDaysIcon,
    ClockIcon,
    MessageSquareIcon,
    FolderOpenIcon,
    BotIcon,
    PlusIcon,
    AlertCircleIcon,
    UsersIcon,
    FileTextIcon,
    FileSpreadsheetIcon,
    FileIcon,
    ArrowRightIcon,
    TrendingUpIcon,
    BookOpenIcon,
    SparklesIcon,
    CheckCircle2Icon,
    StickyNoteIcon,
    BarChart3Icon,
    ZapIcon,
    FilePenLineIcon,
    PresentationIcon,
} from "lucide-react";

import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/shared/shadcn/ui/card.tsx";
import { Badge } from "@/shared/shadcn/ui/badge.tsx";
import { Button } from "@/shared/shadcn/ui/button.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/shadcn/ui/avatar.tsx";
import { Separator } from "@/shared/shadcn/ui/separator.tsx";

// ── Mock data ───────────────────────────────────────────────

const stats = [
    { label: "Дедлайни тижня", value: "6", icon: AlertCircleIcon, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "Пари сьогодні", value: "3", icon: CalendarDaysIcon, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Непрочитані", value: "12", icon: MessageSquareIcon, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Файлів збережено", value: "47", icon: FolderOpenIcon, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Виконано завдань", value: "18", icon: CheckCircle2Icon, color: "text-violet-500", bg: "bg-violet-500/10" },
    { label: "Активні нотатки", value: "9", icon: StickyNoteIcon, color: "text-pink-500", bg: "bg-pink-500/10" },
];

const todaySchedule = [
    { time: "08:30 – 10:05", subject: "Вища математика", room: "Ауд. 301", format: "Офлайн", teacher: "проф. Коваленко І.М." },
    { time: "10:25 – 12:00", subject: "Програмування", room: "Ауд. 215", format: "Офлайн", teacher: "доц. Петренко А.В." },
    { time: "13:00 – 14:35", subject: "Англійська мова", room: "Zoom", format: "Онлайн", teacher: "ст. викл. Браун О.С." },
];

const deadlines = [
    { title: "Лабораторна з БД", subject: "Бази даних", due: "Завтра, 23:59", priority: "high" as const },
    { title: "Есе: \"Цифрова трансформація\"", subject: "Економіка", due: "26 лют, 18:00", priority: "medium" as const },
    { title: "Курсова — розділ 2", subject: "Програмування", due: "01 бер, 12:00", priority: "high" as const },
    { title: "Тест з граматики", subject: "Англійська мова", due: "03 бер, 10:00", priority: "low" as const },
    { title: "Контрольна з математики", subject: "Вища математика", due: "10 бер, 08:30", priority: "high" as const },
    { title: "Залік з філософії", subject: "Філософія", due: "17 бер, 10:00", priority: "medium" as const },
];

const recentFiles = [
    { name: "Лекція_05_Нормалізація.pdf", subject: "Бази даних", icon: FileTextIcon, date: "Вчора" },
    { name: "Задачі_Інтеграли.docx", subject: "Вища математика", icon: FileIcon, date: "22 лют" },
    { name: "Оцінки_семестр.xlsx", subject: "Загальне", icon: FileSpreadsheetIcon, date: "20 лют" },
    { name: "Презентація_Курсова.pptx", subject: "Програмування", icon: PresentationIcon, date: "18 лют" },
    { name: "Конспект_Філософія_03.pdf", subject: "Філософія", icon: FilePenLineIcon, date: "15 лют" },
];

const aiInsight = {
    title: "Рекомендація AI",
    message: "У тебе 2 високопріоритетні дедлайни цього тижня. Рекомендую почати з лабораторної з БД — на неї залишилось менше доби. Після цього зверни увагу на курсову — ще є час, але розділ 2 потребує дослідження. Гарного продуктивного дня! 🚀",
    tip: "Почни підготовку до контрольної з математики заздалегідь — вона через 2 тижні.",
};

const weeklyProgress = {
    done: 18,
    total: 26,
    label: "завдань виконано цього тижня",
};

const weekActivity = [
    { day: "Пн", tasks: 5, done: 4 },
    { day: "Вт", tasks: 3, done: 3 },
    { day: "Ср", tasks: 6, done: 4 },
    { day: "Чт", tasks: 4, done: 2 },
    { day: "Пт", tasks: 3, done: 1 },
    { day: "Сб", tasks: 2, done: 0 },
    { day: "Нд", tasks: 1, done: 0 },
];

const recentNotes = [
    { emoji: "📐", title: "Формули інтегралів", snippet: "Таблиця основних інтегралів та правил підстановки...", date: "Сьогодні" },
    { emoji: "💾", title: "SQL JOIN types", snippet: "INNER, LEFT, RIGHT, FULL — приклади та відмінності...", date: "Вчора" },
    { emoji: "🧠", title: "Ідеї для курсової", snippet: "Тема: оптимізація запитів у реляційних СУБД. Розділ 2...", date: "22 лют" },
];

// ── Helpers ──────────────────────────────────────────────────

const priorityConfig = {
    high: { label: "Високий", variant: "destructive" as const },
    medium: { label: "Середній", variant: "secondary" as const },
    low: { label: "Низький", variant: "outline" as const },
};

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Доброго ранку";
    if (hour < 18) return "Доброго дня";
    return "Доброго вечора";
}

function getFormattedDate(): string {
    return new Date().toLocaleDateString("uk-UA", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

// ── Animations ──────────────────────────────────────────────

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

// ── Component ───────────────────────────────────────────────

export function HomePage() {
    usePageTitle("Головна", { suffix: true });

    const authUser = useAuthUser();
    const userName = authUser?.first_name ?? authUser?.full_name ?? "";
    const userAvatar = authUser?.avatar_path ?? "";

    const progressPct = Math.round((weeklyProgress.done / weeklyProgress.total) * 100);
    const maxTasks = Math.max(...weekActivity.map(d => d.tasks));

    return (
        <motion.div
            className="flex flex-col gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* ─── Greeting ─── */}
            <motion.section variants={itemVariants} className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                    <AvatarImage src={userAvatar} alt={userName} />
                    <AvatarFallback className="text-lg font-semibold">
                        {userName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {getGreeting()}{userName ? `, ${userName}` : ""} 👋
                    </h1>
                    <p className="text-muted-foreground text-sm capitalize">
                        {getFormattedDate()}
                    </p>
                </div>
            </motion.section>

            {/* ─── Stats grid (6 cards) ─── */}
            <motion.section variants={itemVariants}>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {stats.map((s) => (
                        <Card key={s.label} size="sm">
                            <CardHeader className="flex-row items-center justify-between pb-1">
                                <CardDescription className="text-xs">{s.label}</CardDescription>
                                <div className={`flex size-8 items-center justify-center rounded-lg ${s.bg}`}>
                                    <s.icon className={`size-4 ${s.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">{s.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </motion.section>

            {/* ─── AI Insight ─── */}
            <motion.section variants={itemVariants}>
                <Card className="border-violet-200 dark:border-violet-500/20 bg-gradient-to-r from-violet-50/50 to-fuchsia-50/30 dark:from-violet-950/20 dark:to-fuchsia-950/10">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex size-9 items-center justify-center rounded-lg bg-violet-500/10">
                                    <SparklesIcon className="size-5 text-violet-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">{aiInsight.title}</CardTitle>
                                    <CardDescription className="text-xs">Персональна рекомендація на основі твого розкладу</CardDescription>
                                </div>
                            </div>
                            <Badge variant="secondary" className="gap-1">
                                <ZapIcon className="size-3" /> AI
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        <p className="text-sm leading-relaxed">{aiInsight.message}</p>
                        <div className="flex items-center gap-2 bg-violet-100/50 dark:bg-violet-900/20 rounded-lg px-3 py-2">
                            <SparklesIcon className="size-3.5 text-violet-500 shrink-0" />
                            <p className="text-xs text-muted-foreground">{aiInsight.tip}</p>
                        </div>
                        <div className="flex justify-end">
                            <Button variant="outline" size="sm" className="gap-1 text-xs">
                                <BotIcon className="size-3.5" /> Відкрити AI-помічника
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.section>

            {/* ─── Two-column: schedule + deadlines ─── */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Today's schedule */}
                <motion.section variants={itemVariants}>
                    <Card className="h-full">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CalendarDaysIcon className="size-5 text-blue-500" />
                                    <CardTitle>Розклад на сьогодні</CardTitle>
                                </div>
                                <Badge variant="secondary">{todaySchedule.length} пари</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            {todaySchedule.map((lesson, i) => (
                                <div key={i}>
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                                                <ClockIcon className="size-4 text-blue-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium leading-tight">{lesson.subject}</p>
                                                <p className="text-muted-foreground text-xs mt-0.5">
                                                    {lesson.time} · {lesson.room}
                                                </p>
                                                <p className="text-muted-foreground/70 text-[11px] mt-0.5">
                                                    {lesson.teacher}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant={lesson.format === "Онлайн" ? "outline" : "secondary"} className="shrink-0">
                                            {lesson.format}
                                        </Badge>
                                    </div>
                                    {i < todaySchedule.length - 1 && <Separator className="mt-3" />}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.section>

                {/* Upcoming deadlines */}
                <motion.section variants={itemVariants}>
                    <Card className="h-full">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <AlertCircleIcon className="size-5 text-red-500" />
                                    <CardTitle>Найближчі дедлайни</CardTitle>
                                </div>
                                <Badge variant="destructive">{deadlines.length}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            {deadlines.map((d, i) => {
                                const prio = priorityConfig[d.priority];
                                return (
                                    <div key={i}>
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="text-sm font-medium leading-tight">{d.title}</p>
                                                <p className="text-muted-foreground text-xs mt-0.5">
                                                    {d.subject} · {d.due}
                                                </p>
                                            </div>
                                            <Badge variant={prio.variant} className="shrink-0">
                                                {prio.label}
                                            </Badge>
                                        </div>
                                        {i < deadlines.length - 1 && <Separator className="mt-3" />}
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </motion.section>
            </div>

            {/* ─── Two-column: weekly progress + activity chart ─── */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Weekly progress */}
                <motion.section variants={itemVariants}>
                    <Card className="h-full">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <TrendingUpIcon className="size-5 text-emerald-500" />
                                <CardTitle>Прогрес тижня</CardTitle>
                            </div>
                            <CardDescription>
                                {weeklyProgress.done} із {weeklyProgress.total} {weeklyProgress.label}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            {/* Progress bar */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">{progressPct}%</span>
                                    <span className="text-muted-foreground text-xs">{weeklyProgress.done}/{weeklyProgress.total}</span>
                                </div>
                                <div className="h-3 rounded-full bg-secondary overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPct}%` }}
                                        transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                                    />
                                </div>
                            </div>

                            <Separator />

                            {/* Breakdown */}
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-emerald-500/5">
                                    <span className="text-lg font-bold text-emerald-500">{weeklyProgress.done}</span>
                                    <span className="text-[10px] text-muted-foreground">Виконано</span>
                                </div>
                                <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-amber-500/5">
                                    <span className="text-lg font-bold text-amber-500">{weeklyProgress.total - weeklyProgress.done}</span>
                                    <span className="text-[10px] text-muted-foreground">В процесі</span>
                                </div>
                                <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-blue-500/5">
                                    <span className="text-lg font-bold text-blue-500">{progressPct}%</span>
                                    <span className="text-[10px] text-muted-foreground">Прогрес</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.section>

                {/* Activity chart */}
                <motion.section variants={itemVariants}>
                    <Card className="h-full">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <BarChart3Icon className="size-5 text-blue-500" />
                                <CardTitle>Активність за тиждень</CardTitle>
                            </div>
                            <CardDescription>Завдання по днях: заплановано / виконано</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end justify-between gap-2 h-36">
                                {weekActivity.map((d, i) => {
                                    const totalH = maxTasks > 0 ? (d.tasks / maxTasks) * 100 : 0;
                                    const doneH = d.tasks > 0 ? (d.done / d.tasks) * 100 : 0;
                                    const isToday = i === new Date().getDay() - 1; // Mon=0

                                    return (
                                        <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                                            <div className="w-full relative rounded-t-md overflow-hidden" style={{ height: `${totalH}%`, minHeight: 8 }}>
                                                {/* Background (total) */}
                                                <motion.div
                                                    className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-md"
                                                    initial={{ scaleY: 0 }}
                                                    animate={{ scaleY: 1 }}
                                                    transition={{ duration: 0.5, delay: 0.1 * i }}
                                                    style={{ originY: 1 }}
                                                />
                                                {/* Foreground (done) */}
                                                <motion.div
                                                    className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-md"
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${doneH}%` }}
                                                    transition={{ duration: 0.6, delay: 0.15 * i + 0.2 }}
                                                    style={{ minHeight: d.done > 0 ? 4 : 0 }}
                                                />
                                            </div>
                                            <span className={[
                                                "text-[10px] font-medium",
                                                isToday ? "text-primary font-semibold" : "text-muted-foreground",
                                            ].join(" ")}>
                                                {d.day}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex items-center gap-4 mt-3 pt-3 border-t">
                                <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                    <span className="size-2.5 rounded-sm bg-blue-100 dark:bg-blue-900/30" /> Заплановано
                                </span>
                                <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                    <span className="size-2.5 rounded-sm bg-blue-500" /> Виконано
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.section>
            </div>

            {/* ─── Quick actions ─── */}
            <motion.section variants={itemVariants}>
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <TrendingUpIcon className="size-5 text-primary" />
                            <CardTitle>Швидкі дії</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
                                <BotIcon className="size-5" />
                                <span className="text-xs">AI-помічник</span>
                            </Button>
                            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
                                <PlusIcon className="size-5" />
                                <span className="text-xs">Додати файл</span>
                            </Button>
                            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
                                <BookOpenIcon className="size-5" />
                                <span className="text-xs">Новий дедлайн</span>
                            </Button>
                            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
                                <UsersIcon className="size-5" />
                                <span className="text-xs">Груповий чат</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.section>

            {/* ─── Two-column: recent files + notes ─── */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent files */}
                <motion.section variants={itemVariants}>
                    <Card className="h-full">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FolderOpenIcon className="size-5 text-emerald-500" />
                                    <CardTitle>Останні файли</CardTitle>
                                </div>
                                <Button variant="ghost" size="sm" className="text-xs gap-1">
                                    Всі файли <ArrowRightIcon className="size-3" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            {recentFiles.map((file, i) => (
                                <div key={i}>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                                            <file.icon className="size-4 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{file.name}</p>
                                            <p className="text-muted-foreground text-xs">{file.subject}</p>
                                        </div>
                                        <span className="text-muted-foreground text-xs shrink-0">{file.date}</span>
                                    </div>
                                    {i < recentFiles.length - 1 && <Separator className="mt-3" />}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.section>

                {/* Recent notes */}
                <motion.section variants={itemVariants}>
                    <Card className="h-full">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <StickyNoteIcon className="size-5 text-pink-500" />
                                    <CardTitle>Нотатки</CardTitle>
                                </div>
                                <Button variant="ghost" size="sm" className="text-xs gap-1">
                                    Всі нотатки <ArrowRightIcon className="size-3" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            {recentNotes.map((note, i) => (
                                <div key={i}>
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pink-500/10 text-base">
                                            {note.emoji}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium leading-tight">{note.title}</p>
                                            <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">{note.snippet}</p>
                                        </div>
                                        <span className="text-muted-foreground text-[11px] shrink-0">{note.date}</span>
                                    </div>
                                    {i < recentNotes.length - 1 && <Separator className="mt-3" />}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.section>
            </div>
        </motion.div>
    );
}