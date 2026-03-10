import {
    APP_VERSION, APP_NAME, APP_ENV, API_BASE_URL,
    WS_HOST, WS_PORT, WS_KEY,
    QUERY_RETRY, QUERY_STALE_MS, PAGE_SIZE_DEFAULT,
    WS_RECONNECT_DELAY_MS, WS_HEARTBEAT_MS,
} from "@/app/config/app.config";
import { useViewport } from "../hooks/useViewport";
import { useOnline } from "../hooks/useOnline";
import { useMemory } from "../hooks/useMemory";
import { useUptime } from "../hooks/useUptime";
import { SectionHeader } from "../ui/SectionHeader";
import { KVRow } from "../ui/KVRow";

export function EnvTab() {
    const vp = useViewport();
    const online = useOnline();
    const mem = useMemory();
    const uptime = useUptime();
    const VpIcon = vp.icon;

    return (
        <div className="overflow-y-auto flex-1">
            <SectionHeader title="App" />
            <KVRow label="Name" value={APP_NAME} accent="text-emerald-400" />
            <KVRow label="Version" value={`v${APP_VERSION}`} accent="text-violet-400" />
            <KVRow label="Env" value={APP_ENV} accent={APP_ENV === "production" ? "text-red-400" : "text-amber-400"} />
            <KVRow label="Session up" value={uptime} accent="text-sky-400" />

            <SectionHeader title="API / WS" />
            <KVRow label="API base" value={API_BASE_URL} copyable={API_BASE_URL} />
            <KVRow label="WS host" value={`${WS_HOST}:${WS_PORT}`} copyable={`${WS_HOST}:${WS_PORT}`} />
            <KVRow label="WS key" value={WS_KEY ? `${WS_KEY.slice(0, 6)}…` : "—"} copyable={WS_KEY} />

            <SectionHeader title="React Query" />
            <KVRow label="Stale time" value={`${QUERY_STALE_MS / 1000}s`} />
            <KVRow label="Retry" value={String(QUERY_RETRY)} />
            <KVRow label="Page size" value={String(PAGE_SIZE_DEFAULT)} />

            <SectionHeader title="WS Internals" />
            <KVRow label="Reconnect" value={`${WS_RECONNECT_DELAY_MS}ms`} />
            <KVRow label="Heartbeat" value={`${WS_HEARTBEAT_MS / 1000}s`} />

            <SectionHeader title="Runtime" />
            <KVRow
                label="Network"
                value={online ? "Online" : "Offline"}
                accent={online ? "text-emerald-400" : "text-red-400"}
            />
            <KVRow
                label="Viewport"
                value={
                    <span className="flex items-center gap-1">
                        <VpIcon className="size-3" />
                        {vp.label} — {vp.vw}×{vp.vh}px
                    </span>
                }
            />
            {mem && (
                <>
                    <KVRow
                        label="JS Heap"
                        value={`${mem.used} MB / ${mem.total} MB (${mem.pct}%)`}
                        accent={mem.pct > 80 ? "text-red-400" : mem.pct > 50 ? "text-amber-400" : "text-emerald-400"}
                    />
                    <div className="px-3 py-2 border-b border-zinc-800/30">
                        <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ${
                                    mem.pct > 80 ? "bg-red-500" : mem.pct > 50 ? "bg-amber-500" : "bg-emerald-500"
                                }`}
                                style={{ width: `${mem.pct}%` }}
                            />
                        </div>
                    </div>
                </>
            )}
            <KVRow label="User agent" value={navigator.userAgent.split(" ")[0]} mono={false} />
            <KVRow label="Language" value={navigator.language} />
            <KVRow label="Timezone" value={Intl.DateTimeFormat().resolvedOptions().timeZone} />
        </div>
    );
}