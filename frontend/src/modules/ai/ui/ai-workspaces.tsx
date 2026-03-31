import { useNavigate } from "react-router-dom";
import { AI_WORKSPACES } from "../model/constants";

export function AiWorkspaces() {
    const navigate = useNavigate();

    return (
        <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Сценарії
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {AI_WORKSPACES.map((card) => {
                    const Icon = card.icon;
                    return (
                        <button
                            key={card.title}
                            onClick={() => navigate("/dashboard/ai/summaries/new")}
                            className="group rounded-2xl border border-border/40 bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-border/60 hover:shadow-md"
                        >
                            <div className={`mb-3 inline-flex rounded-xl p-2 ${card.accent}`}>
                                <Icon className="size-4" />
                            </div>
                            <p className="text-sm font-semibold leading-tight">{card.title}</p>
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                {card.description}
                            </p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
