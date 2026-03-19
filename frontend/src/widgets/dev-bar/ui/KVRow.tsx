import React, { useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";

interface KVRowProps {
    label: string;
    value: React.ReactNode;
    accent?: string;
    copyable?: string;
    mono?: boolean;
}

export function KVRow({ label, value, accent, copyable, mono = true }: KVRowProps) {
    const [copied, setCopied] = useState(false);

    const copy = () => {
        if (!copyable) return;
        navigator.clipboard.writeText(copyable).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };

    return (
        <div className="group flex items-center justify-between gap-3 px-3 py-2 hover:bg-zinc-800/40 border-b border-zinc-800/30 transition-colors">
            <span className="text-[15px] text-zinc-500 shrink-0 w-32 truncate">{label}</span>
            <div className="flex items-center gap-1.5 min-w-0">
                <span className={`text-[15px] ${mono ? "font-mono" : ""} ${accent ?? "text-zinc-300"} truncate max-w-[180px]`}>
                    {value}
                </span>
                {copyable && (
                    <button
                        onClick={copy}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-zinc-300"
                    >
                        {copied ? <CheckIcon className="size-3 text-emerald-400" /> : <CopyIcon className="size-3" />}
                    </button>
                )}
            </div>
        </div>
    );
}