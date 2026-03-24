import { WifiIcon, MonitorIcon } from "lucide-react";

export function ModeBadge({ code }: { code: string }) {
    if (code === "online")
        return (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-sky-600 bg-sky-100 dark:bg-sky-900/40 dark:text-sky-400 px-1.5 py-0.5 rounded-full">
                <WifiIcon className="w-3 h-3" />Онлайн
            </span>
        );
    if (code === "hybrid")
        return (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-violet-600 bg-violet-100 dark:bg-violet-900/40 dark:text-violet-400 px-1.5 py-0.5 rounded-full">
                <MonitorIcon className="w-3 h-3" />Гібрид
            </span>
        );
    return null;
}
