import { addMonths, endOfMonth, format, startOfMonth, addDays } from "date-fns";
import { uk } from "date-fns/locale";
import type { LessonInstance } from "@/entities/schedule/model/types";

interface Props {
    instances: LessonInstance[];
    rangeStart: Date;
    byDate: Record<string, LessonInstance[]>;
    onMonthClick: (d: Date) => void;
}

const PALETTES = [
    { bg: "bg-violet-50 dark:bg-violet-950/30", border: "border-violet-200 dark:border-violet-700/40", dot: "bg-violet-500", bar: "bg-violet-400/70" },
    { bg: "bg-sky-50 dark:bg-sky-950/30", border: "border-sky-200 dark:border-sky-700/40", dot: "bg-sky-500", bar: "bg-sky-400/70" },
    { bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-700/40", dot: "bg-emerald-500", bar: "bg-emerald-400/70" },
    { bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-700/40", dot: "bg-amber-500", bar: "bg-amber-400/70" },
    { bg: "bg-rose-50 dark:bg-rose-950/30", border: "border-rose-200 dark:border-rose-700/40", dot: "bg-rose-500", bar: "bg-rose-400/70" },
    { bg: "bg-indigo-50 dark:bg-indigo-950/30", border: "border-indigo-200 dark:border-indigo-700/40", dot: "bg-indigo-500", bar: "bg-indigo-400/70" },
];

export function SemesterView({ instances, rangeStart, byDate, onMonthClick }: Props) {
    return (
        <div className="grid grid-cols-3 gap-3 h-full pb-2 pr-1 overscroll-y-none">
            {Array.from({ length: 6 }).map((_, i) => {
                const md = addMonths(rangeStart, i);
                const ms = startOfMonth(md);
                const me = endOfMonth(md);
                const pal = PALETTES[i];
                const items = instances.filter(inst => { const d = new Date(inst.date); return d >= ms && d <= me; });
                const exams = items.filter(x => x.source === "exam").length;
                const isCur = format(md, "yyyy-MM") === format(new Date(), "yyyy-MM");
                const days = me.getDate();
                const maxD = Math.max(1, ...Array.from({ length: days }, (_, d) =>
                    (byDate[format(addDays(ms, d), "yyyy-MM-dd")] ?? []).length
                ));

                return (
                    <button
                        key={i}
                        onClick={() => onMonthClick(md)}
                        className={[
                            "relative text-left p-5 rounded-2xl border transition-all duration-200",
                            "hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-none",
                            pal.bg, pal.border,
                            isCur ? "ring-2 ring-primary/30 ring-offset-2" : "",
                        ].join(" ")}
                    >
                        {isCur && (
                            <span className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                Зараз
                            </span>
                        )}

                        <div className="flex items-center gap-2 mb-3">
                            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${pal.dot}`} />
                            <span className="font-bold text-sm capitalize tracking-tight">
                                {format(md, "LLLL yyyy", { locale: uk })}
                            </span>
                        </div>

                        <div className="flex items-end justify-between mb-3">
                            <div>
                                <span className="text-4xl font-black tabular-nums leading-none">{items.length}</span>
                                <span className="text-xs text-muted-foreground ml-2">подій</span>
                            </div>
                            <div className="text-right text-xs text-muted-foreground space-y-0.5">
                                <div>{items.length - exams} пар</div>
                                {exams > 0 && (
                                    <div className="text-amber-600 font-bold">
                                        {exams} іспит{exams === 1 ? "" : exams < 5 ? "и" : "ів"}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sparkline */}
                        <div className="flex items-end gap-px h-8">
                            {Array.from({ length: days }).map((_, d) => {
                                const cnt = (byDate[format(addDays(ms, d), "yyyy-MM-dd")] ?? []).length;
                                return (
                                    <div
                                        key={d}
                                        className={`flex-1 rounded-[1px] ${cnt > 0 ? pal.bar : "bg-black/5 dark:bg-white/5"}`}
                                        style={{ height: cnt > 0 ? `${Math.max((cnt / maxD) * 100, 18)}%` : "6%" }}
                                    />
                                );
                            })}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
