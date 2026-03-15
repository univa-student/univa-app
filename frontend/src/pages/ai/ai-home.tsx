import {
    Sparkles,
    FileText,
    Brain,
    BookOpen,
    GraduationCap,
    ScanText,
    ArrowRight,
    Clock3,
    Layers3,
    ChevronRight,
    Wand2,
    CheckCircle2,
    Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSummaries } from "@/entities/summary/api/hooks";
import { Skeleton } from "@/shared/shadcn/ui/skeleton";

const workspaces = [
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

const quickActions = [
    "Зроби коротко",
    "Поясни простіше",
    "Створи питання",
    "Підготуй до тесту",
];

function formatRelativeDate(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 60) return `${minutes} хв тому`;
    const hours = Math.floor(diff / 3_600_000);
    if (hours < 24) return `${hours} год тому`;
    const days = Math.floor(diff / 86_400_000);
    if (days === 1) return "вчора";
    return new Date(iso).toLocaleDateString("uk-UA", { day: "numeric", month: "short" });
}

export function AiHome() {
    const navigate = useNavigate();
    const { data: summaries, isLoading } = useSummaries();

    const recent = summaries?.slice(0, 3) ?? [];
    const featuredArtifact = recent[0];
    const summaryCount = summaries?.length ?? 0;

    return (
        <div className="mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="space-y-6">
                <section className="rounded-[28px] border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur sm:p-6">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                        <div className="max-w-2xl">
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-1 text-[11px] text-muted-foreground shadow-sm">
                                <Sparkles className="h-3.5 w-3.5" />
                                AI-центр
                            </div>

                            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                ШІ допомагає рухатися по навчанню швидше і структурніше
                            </h1>

                            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                                Працюй з конспектами, поясненнями, тестами та підготовкою до іспитів в одному просторі — на основі твоїх матеріалів і навчального контексту.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2.5 xl:justify-end">
                            <button
                                onClick={() => navigate("/dashboard/files")}
                                className="inline-flex items-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-transform hover:-translate-y-0.5"
                            >
                                Створити конспект
                                <Wand2 className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => navigate("/dashboard/ai/summaries")}
                                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                            >
                                Всі конспекти
                                <Layers3 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {/* Real summary count */}
                        <div className="rounded-2xl border border-border/70 bg-background p-4 shadow-sm">
                            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Конспекти</p>
                            <p className="mt-2 text-2xl font-semibold text-foreground">
                                {isLoading ? <Loader2 className="size-5 animate-spin text-muted-foreground" /> : summaryCount}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-border/70 bg-background p-4 shadow-sm">
                            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Пояснення</p>
                            <p className="mt-2 text-2xl font-semibold text-foreground">—</p>
                        </div>
                        <div className="rounded-2xl border border-border/70 bg-background p-4 shadow-sm">
                            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Тести</p>
                            <p className="mt-2 text-2xl font-semibold text-foreground">—</p>
                        </div>
                        <div className="rounded-2xl border border-border/70 bg-background p-4 shadow-sm">
                            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Документи</p>
                            <p className="mt-2 text-2xl font-semibold text-foreground">—</p>
                        </div>
                    </div>
                </section>

                <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                    {/* Recent summaries */}
                    <section className="rounded-[28px] border border-border/70 bg-card p-5 shadow-sm sm:p-6">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-medium text-foreground">Останні конспекти</p>
                                <p className="text-xs text-muted-foreground">Швидкий доступ до вже згенерованих матеріалів</p>
                            </div>
                            <Clock3 className="h-4 w-4 text-muted-foreground" />
                        </div>

                        {isLoading && (
                            <div className="space-y-2">
                                {[0, 1, 2].map((i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
                            </div>
                        )}

                        {!isLoading && recent.length === 0 && (
                            <div className="flex flex-col items-center gap-3 py-10 text-center">
                                <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/60">
                                    <FileText className="size-6 text-muted-foreground/40" />
                                </div>
                                <p className="text-sm text-muted-foreground">Конспектів ще немає</p>
                                <button
                                    onClick={() => navigate("/dashboard/files")}
                                    className="text-xs font-medium text-primary hover:underline"
                                >
                                    Перейти до файлів →
                                </button>
                            </div>
                        )}

                        {!isLoading && recent.length > 0 && (
                            <div className="overflow-hidden rounded-2xl border border-border/70 bg-background shadow-sm">
                                {recent.map((item, index) => (
                                    <button
                                        key={item.id}
                                        onClick={() => navigate(`/dashboard/ai/summaries/${item.id}`)}
                                        className={`flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted/40 ${
                                            index !== recent.length - 1 ? "border-b border-border/70" : ""
                                        }`}
                                    >
                                        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                                            <FileText className="size-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-foreground line-clamp-1">{item.title}</p>
                                            <p className="text-[11px] text-muted-foreground">
                                                {item.contentJson?.meta?.fileName
                                                    ? `${item.contentJson.meta.fileName} · `
                                                    : ""}
                                                {formatRelativeDate(item.createdAt)}
                                            </p>
                                        </div>
                                        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {!isLoading && recent.length > 0 && (
                            <button
                                onClick={() => navigate("/dashboard/ai/summaries")}
                                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                            >
                                Переглянути всі конспекти
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        )}
                    </section>

                    {/* Latest featured summary */}
                    <section className="rounded-[28px] border border-border/70 bg-card p-5 shadow-sm sm:p-6">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-medium text-foreground">Останній AI-результат</p>
                                <p className="text-xs text-muted-foreground">Точка швидкого повернення до роботи</p>
                            </div>
                            <Clock3 className="h-4 w-4 text-muted-foreground" />
                        </div>

                        {isLoading && <Skeleton className="h-32 rounded-2xl" />}

                        {!isLoading && !featuredArtifact && (
                            <div className="flex flex-col items-center gap-2 rounded-2xl border border-border/70 bg-background p-6 text-center">
                                <Sparkles className="size-8 text-muted-foreground/30" />
                                <p className="text-sm font-medium text-foreground">Ще немає результатів</p>
                                <p className="text-xs text-muted-foreground">Створіть перший конспект із файлу</p>
                            </div>
                        )}

                        {!isLoading && featuredArtifact && (
                            <button
                                onClick={() => navigate(`/dashboard/ai/summaries/${featuredArtifact.id}`)}
                                className="group w-full rounded-2xl border border-border/70 bg-background p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="mb-2 inline-flex rounded-full border border-border/70 bg-muted px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                                            Конспект
                                        </div>
                                        <p className="text-base font-medium text-foreground line-clamp-2">{featuredArtifact.title}</p>
                                        <p className="mt-1 text-xs text-muted-foreground">{formatRelativeDate(featuredArtifact.createdAt)}</p>
                                    </div>
                                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                                </div>
                                {featuredArtifact.contentJson?.shortSummary && (
                                    <p className="mt-3 text-sm leading-6 text-muted-foreground line-clamp-3">
                                        {featuredArtifact.contentJson.shortSummary}
                                    </p>
                                )}
                            </button>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2.5">
                            <button
                                onClick={() => navigate("/dashboard/ai/summaries")}
                                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                            >
                                Відкрити всі конспекти
                                <Layers3 className="h-4 w-4" />
                            </button>
                        </div>
                    </section>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <section>
                        <div className="mb-3 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-foreground">Робочі сценарії</p>
                                <p className="text-xs text-muted-foreground">Основні напрямки, у яких ШІ допомагає щодня</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {workspaces.map((card) => {
                                const Icon = card.icon;
                                return (
                                    <button
                                        key={card.title}
                                        className="group rounded-2xl border border-border/70 bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                                    >
                                        <div className="mb-4 flex items-start justify-between gap-3">
                                            <div className={`inline-flex rounded-2xl p-2.5 ${card.accent}`}>
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <span className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                                                {card.tag}
                                            </span>
                                        </div>
                                        <p className="text-base font-medium text-foreground">{card.title}</p>
                                        <p className="mt-1 text-sm leading-6 text-muted-foreground">{card.description}</p>
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => navigate("/dashboard/files")}
                            className="group mt-3 flex w-full items-center gap-4 rounded-2xl border border-border/70 bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <div className="inline-flex rounded-2xl bg-primary/10 p-3 text-primary">
                                <ScanText className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">Аналіз документів</p>
                                <p className="text-xs leading-5 text-muted-foreground">
                                    Головні ідеї, ключові поняття та швидке виділення важливого з файлу.
                                </p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                        </button>
                    </section>

                    <section className="space-y-6">
                        <div className="overflow-hidden rounded-2xl border border-border/70 bg-muted/60 shadow-sm">
                            <div className="border-b border-border/70 bg-card/80 p-4">
                                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                    Режим «Перед іспитом»
                                </p>
                                <p className="mt-2 text-sm leading-6 text-foreground">
                                    ШІ проаналізує матеріали предмета, знайде слабкі теми та сформує список ключових питань для повторення.
                                </p>
                            </div>
                            <div className="p-4">
                                <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Підходить для швидкої підготовки перед модулем або заліком
                                </div>
                                <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card">
                                    Почати підготовку
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div>
                            <p className="mb-2 text-xs font-medium text-muted-foreground">Швидкі дії</p>
                            <div className="flex flex-wrap gap-2">
                                {quickActions.map((action) => (
                                    <button
                                        key={action}
                                        className="rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground transition-colors hover:bg-muted"
                                    >
                                        {action}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}