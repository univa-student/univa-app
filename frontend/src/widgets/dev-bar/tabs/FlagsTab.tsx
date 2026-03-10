import { useState } from "react";
import { RotateCcwIcon } from "lucide-react";
import type { FlagOverrides } from "../types";
import { ALL_FLAGS, LS_FLAGS_KEY } from "../constants";
import { SectionHeader } from "../ui/SectionHeader";
import { Pill } from "../ui/Pill";

function loadFlags(): FlagOverrides {
    try {
        return JSON.parse(localStorage.getItem(LS_FLAGS_KEY) ?? "{}");
    } catch {
        return {};
    }
}

function saveFlags(f: FlagOverrides) {
    localStorage.setItem(LS_FLAGS_KEY, JSON.stringify(f));
}

export function FlagsTab() {
    const [flags, setFlags] = useState<FlagOverrides>(loadFlags);

    const toggle = (key: string, base: boolean) => {
        const next = { ...flags };
        if (next[key] === undefined) {
            next[key] = !base;
        } else {
            delete next[key];
        }
        saveFlags(next);
        setFlags(next);
    };

    const reset = () => {
        saveFlags({});
        setFlags({});
    };

    const overrideCount = Object.keys(flags).length;

    return (
        <div className="overflow-y-auto flex-1">
            <SectionHeader
                title={`Feature Flags${overrideCount ? ` (${overrideCount} override)` : ""}`}
                action={
                    overrideCount > 0 && (
                        <button
                            onClick={reset}
                            className="flex items-center gap-1 text-[14px] text-amber-400 hover:text-amber-300 transition-colors"
                        >
                            <RotateCcwIcon className="size-3" /> Reset all
                        </button>
                    )
                }
            />
            <div className="p-2 flex flex-col gap-1.5">
                {ALL_FLAGS.map(({ key, base, desc }) => {
                    const overridden = flags[key] !== undefined;
                    const active = overridden ? flags[key] : base;

                    return (
                        <button
                            key={key}
                            onClick={() => toggle(key, base)}
                            className={`
                                group flex items-center justify-between gap-3 rounded-lg px-3 py-2.5
                                border transition-all duration-150 text-left w-full
                                ${active
                                ? "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/15"
                                : "bg-zinc-800/40 border-zinc-700/40 hover:bg-zinc-800/60"}
                            `}
                        >
                            <div className="flex flex-col gap-0.5 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className={`text-[15px] font-bold font-mono ${active ? "text-emerald-400" : "text-zinc-500 line-through"}`}>
                                        {key}
                                    </span>
                                    {overridden && (
                                        <Pill color="amber">overridden</Pill>
                                    )}
                                </div>
                                <span className={`text-[14px] ${active ? "text-zinc-400" : "text-zinc-600"}`}>{desc}</span>
                            </div>
                            <div className={`shrink-0 w-8 h-4 rounded-full flex items-center transition-colors duration-200 ${active ? "bg-emerald-500 justify-end" : "bg-zinc-700 justify-start"}`}>
                                <div className="w-3 h-3 rounded-full bg-white mx-0.5 shadow" />
                            </div>
                        </button>
                    );
                })}
            </div>
            <div className="px-3 py-2 border-t border-zinc-800 mt-2">
                <p className="text-[14px] text-zinc-600">
                    Overrides stored in <code className="text-zinc-500">{LS_FLAGS_KEY}</code>.
                    Base values from <code className="text-zinc-500">feature-flags.ts</code>.
                    Refresh to apply changes in guards.
                </p>
            </div>
        </div>
    );
}