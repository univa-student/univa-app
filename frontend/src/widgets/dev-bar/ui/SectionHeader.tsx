import React from "react";

interface SectionHeaderProps {
    title: string;
    action?: React.ReactNode;
}

export function SectionHeader({ title, action }: SectionHeaderProps) {
    return (
        <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-950 sticky top-0 z-20">
            <span className="text-[13px] font-bold tracking-[0.18em] uppercase text-zinc-500">
                {title}
            </span>
            {action}
        </div>
    );
}