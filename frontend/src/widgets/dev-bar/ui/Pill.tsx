import React from "react";

interface PillProps {
    children: React.ReactNode;
    color?: 'zinc' | 'emerald' | 'red' | 'amber' | 'blue' | 'violet';
}

export function Pill({ children, color = 'zinc' }: PillProps) {
    const styles: Record<string, string> = {
        zinc: 'bg-zinc-800 text-zinc-300 border-zinc-700',
        emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
        red: 'bg-red-500/10 text-red-300 border-red-500/20',
        amber: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
        blue: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
        violet: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
    };

    return (
        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[12px] font-medium ${styles[color]}`}>
            {children}
        </span>
    );
}