import { useNavigate } from "react-router-dom";
import { ScanText, ArrowRight, CheckCircle2 } from "lucide-react";
import { AI_WORKSPACES, AI_QUICK_ACTIONS } from "../model/constants";

export function AiWorkspaces() {
    const navigate = useNavigate();

    return (
        <section>
            <div className="mb-3 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-foreground">Робочі сценарії</p>
                    <p className="text-xs text-muted-foreground">Основні напрямки, у яких ШІ допомагає щодня</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {AI_WORKSPACES.map((card) => {
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
    );
}

export function AiStudyMode() {
    return (
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
    );
}

export function AiQuickActions() {
    return (
        <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Швидкі дії</p>
            <div className="flex flex-wrap gap-2">
                {AI_QUICK_ACTIONS.map((action) => (
                    <button
                        key={action}
                        className="rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground transition-colors hover:bg-muted"
                    >
                        {action}
                    </button>
                ))}
            </div>
        </div>
    );
}
