import { useNavigate } from "react-router-dom";
import { Sparkles, Wand2, Layers3 } from "lucide-react";

export function AiHomeHeader() {
    const navigate = useNavigate();

    return (
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
    );
}
