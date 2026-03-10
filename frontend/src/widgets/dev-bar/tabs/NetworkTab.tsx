import { useState, useMemo } from "react";
import { TrashIcon, ChevronDownIcon, ChevronUpIcon, XIcon } from "lucide-react";
import type { NetworkEntry } from "../types";
import { SectionHeader } from "../ui/SectionHeader";

interface NetworkTabProps {
    entries: NetworkEntry[];
    clear: () => void;
}

export function NetworkTab({ entries, clear }: NetworkTabProps) {
    const [filter, setFilter] = useState("");
    const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
    const [methodFilter, setMethodFilter] = useState<string[]>([]);
    const [statusFilter, setStatusFilter] = useState<string[]>([]);

    const filtered = useMemo(
        () => entries.filter(e => {
            // Text filter
            const matchesText = !filter ||
                e.url.toLowerCase().includes(filter.toLowerCase()) ||
                e.method.includes(filter.toUpperCase());

            // Method filter
            const matchesMethod = methodFilter.length === 0 || methodFilter.includes(e.method);

            // Status filter
            const matchesStatus = statusFilter.length === 0 || statusFilter.some(sf => {
                if (sf === "2xx") return e.status !== null && e.status >= 200 && e.status < 300;
                if (sf === "3xx") return e.status !== null && e.status >= 300 && e.status < 400;
                if (sf === "4xx") return e.status !== null && e.status >= 400 && e.status < 500;
                if (sf === "5xx") return e.status !== null && e.status >= 500;
                if (sf === "pending") return e.pending;
                if (sf === "error") return e.status === null && !e.pending;
                return false;
            });

            return matchesText && matchesMethod && matchesStatus;
        }),
        [entries, filter, methodFilter, statusFilter]
    );

    // Statistics
    const stats = useMemo(() => {
        const completed = entries.filter(e => !e.pending && e.duration != null);
        const totalDuration = completed.reduce((sum, e) => sum + (e.duration || 0), 0);
        const totalSize = entries.reduce((sum, e) => sum + (e.size || 0), 0);

        return {
            total: entries.length,
            completed: completed.length,
            pending: entries.filter(e => e.pending).length,
            failed: entries.filter(e => !e.pending && e.status === null).length,
            totalDuration,
            avgDuration: completed.length > 0 ? totalDuration / completed.length : 0,
            totalSize,
        };
    }, [entries]);

    const methodColor: Record<string, string> = {
        GET: "text-emerald-400",
        POST: "text-sky-400",
        PUT: "text-amber-400",
        PATCH: "text-orange-400",
        DELETE: "text-red-400",
    };

    const statusColor = (s: number | null) => {
        if (s === null) return "text-zinc-600";
        if (s >= 500) return "text-red-400";
        if (s >= 400) return "text-orange-400";
        if (s >= 300) return "text-sky-400";
        if (s >= 200) return "text-emerald-400";
        return "text-zinc-500";
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
    };

    const toggleMethodFilter = (method: string) => {
        setMethodFilter(prev =>
            prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]
        );
    };

    const toggleStatusFilter = (status: string) => {
        setStatusFilter(prev =>
            prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
        );
    };

    const availableMethods = useMemo(() =>
        [...new Set(entries.map(e => e.method))].sort(),
        [entries]
    );

    return (
        <div className="flex flex-col flex-1 overflow-hidden">
            <SectionHeader
                title={`Network (${entries.length})`}
                action={
                    <button onClick={clear} className="text-[14px] text-red-400 hover:text-red-300 flex items-center gap-1">
                        <TrashIcon className="size-2.5" /> Clear
                    </button>
                }
            />

            {/* Statistics */}
            <div className="px-3 py-2 border-b border-zinc-800 bg-zinc-900/50">
                <div className="grid grid-cols-2 gap-2 text-[13px]">
                    <div className="flex justify-between">
                        <span className="text-zinc-500">Requests:</span>
                        <span className="text-zinc-300 font-mono">{stats.total}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-zinc-500">Completed:</span>
                        <span className="text-emerald-400 font-mono">{stats.completed}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-zinc-500">Total time:</span>
                        <span className="text-zinc-300 font-mono">
                            {stats.totalDuration < 1000 ? `${stats.totalDuration}ms` : `${(stats.totalDuration / 1000).toFixed(2)}s`}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-zinc-500">Avg time:</span>
                        <span className="text-zinc-300 font-mono">
                            {stats.avgDuration < 1000 ? `${Math.round(stats.avgDuration)}ms` : `${(stats.avgDuration / 1000).toFixed(2)}s`}
                        </span>
                    </div>
                    {stats.totalSize > 0 && (
                        <div className="flex justify-between col-span-2">
                            <span className="text-zinc-500">Total size:</span>
                            <span className="text-zinc-300 font-mono">{formatBytes(stats.totalSize)}</span>
                        </div>
                    )}
                    {stats.pending > 0 && (
                        <div className="flex justify-between">
                            <span className="text-zinc-500">Pending:</span>
                            <span className="text-sky-400 font-mono">{stats.pending}</span>
                        </div>
                    )}
                    {stats.failed > 0 && (
                        <div className="flex justify-between">
                            <span className="text-zinc-500">Failed:</span>
                            <span className="text-red-400 font-mono">{stats.failed}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="px-3 py-2 border-b border-zinc-800 space-y-2">
                <input
                    type="text"
                    placeholder="Filter by URL or method…"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    className="w-full bg-zinc-800 rounded px-2 py-1 text-[15px] text-zinc-300 font-mono placeholder-zinc-600 outline-none focus:ring-1 focus:ring-zinc-600"
                />

                {/* Method filters */}
                <div className="flex flex-wrap gap-1.5">
                    <span className="text-[12px] text-zinc-600 self-center">Method:</span>
                    {availableMethods.map(method => (
                        <button
                            key={method}
                            onClick={() => toggleMethodFilter(method)}
                            className={`px-2 py-0.5 rounded text-[12px] font-mono transition-colors ${methodFilter.includes(method)
                                    ? `${methodColor[method] || "text-zinc-300"} bg-zinc-800`
                                    : "text-zinc-600 hover:text-zinc-400"
                                }`}
                        >
                            {method}
                        </button>
                    ))}
                    {methodFilter.length > 0 && (
                        <button
                            onClick={() => setMethodFilter([])}
                            className="px-1.5 py-0.5 text-[11px] text-zinc-500 hover:text-zinc-300"
                        >
                            <XIcon className="size-3" />
                        </button>
                    )}
                </div>

                {/* Status filters */}
                <div className="flex flex-wrap gap-1.5">
                    <span className="text-[12px] text-zinc-600 self-center">Status:</span>
                    {["2xx", "3xx", "4xx", "5xx", "pending", "error"].map(status => (
                        <button
                            key={status}
                            onClick={() => toggleStatusFilter(status)}
                            className={`px-2 py-0.5 rounded text-[12px] font-mono transition-colors ${statusFilter.includes(status)
                                    ? "text-zinc-300 bg-zinc-800"
                                    : "text-zinc-600 hover:text-zinc-400"
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                    {statusFilter.length > 0 && (
                        <button
                            onClick={() => setStatusFilter([])}
                            className="px-1.5 py-0.5 text-[11px] text-zinc-500 hover:text-zinc-300"
                        >
                            <XIcon className="size-3" />
                        </button>
                    )}
                </div>
            </div>

            <div className="overflow-y-auto flex-1">
                {filtered.length === 0 ? (
                    <p className="px-3 py-4 text-[15px] text-zinc-600">
                        {entries.length === 0 ? "No requests captured yet." : "No results for filter."}
                    </p>
                ) : (
                    filtered.map(e => {
                        const path = (() => {
                            try {
                                return new URL(e.url).pathname;
                            } catch {
                                return e.url;
                            }
                        })();

                        const isExpanded = selectedEntry === String(e.id);

                        return (
                            <div key={e.id} className="border-b border-zinc-800/30">
                                <div
                                    className="group flex items-center gap-2 px-3 py-2 hover:bg-zinc-800/30 transition-colors cursor-pointer"
                                    onClick={() => setSelectedEntry(isExpanded ? null : String(e.id))}
                                >
                                    <span className={`text-[14px] font-mono font-bold shrink-0 w-12 ${methodColor[e.method] ?? "text-zinc-400"}`}>
                                        {e.method}
                                    </span>
                                    <span className={`text-[14px] font-mono font-bold shrink-0 w-8 ${statusColor(e.status)}`}>
                                        {e.pending ? "…" : (e.status ?? "err")}
                                    </span>
                                    <span className="text-[15px] font-mono text-zinc-400 flex-1 truncate" title={e.url}>{path}</span>
                                    <span className="text-[14px] text-zinc-600 shrink-0">
                                        {e.duration != null ? (e.duration < 1000 ? `${e.duration}ms` : `${(e.duration / 1000).toFixed(1)}s`) : ""}
                                    </span>
                                    {e.size != null && e.size > 0 && (
                                        <span className="text-[14px] text-zinc-600 shrink-0">
                                            {formatBytes(e.size)}
                                        </span>
                                    )}
                                    <span className="text-[14px] text-zinc-700 shrink-0">
                                        {new Date(e.ts).toLocaleTimeString("uk-UA")}
                                    </span>
                                    {isExpanded ? (
                                        <ChevronUpIcon className="size-4 text-zinc-500 shrink-0" />
                                    ) : (
                                        <ChevronDownIcon className="size-4 text-zinc-500 shrink-0" />
                                    )}
                                </div>

                                {/* Expanded details */}
                                {isExpanded && (
                                    <div className="px-3 pb-3 bg-zinc-900/50 space-y-3">
                                        {/* URL */}
                                        <div>
                                            <div className="text-[12px] text-zinc-500 mb-1">URL</div>
                                            <div className="text-[13px] font-mono text-zinc-300 bg-zinc-800 rounded px-2 py-1.5 break-all">
                                                {e.url}
                                            </div>
                                        </div>

                                        {/* Headers */}
                                        {e.headers && Object.keys(e.headers).length > 0 && (
                                            <div>
                                                <div className="text-[12px] text-zinc-500 mb-1">Request Headers</div>
                                                <div className="bg-zinc-800 rounded px-2 py-1.5 max-h-40 overflow-y-auto">
                                                    {Object.entries(e.headers).map(([key, value]) => (
                                                        <div key={key} className="text-[12px] font-mono">
                                                            <span className="text-zinc-500">{key}:</span>{" "}
                                                            <span className="text-zinc-300">{value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Request Body */}
                                        {e.requestBody && (
                                            <div>
                                                <div className="text-[12px] text-zinc-500 mb-1">Request Body</div>
                                                <div className="text-[12px] font-mono text-zinc-300 bg-zinc-800 rounded px-2 py-1.5 max-h-40 overflow-y-auto break-all">
                                                    {typeof e.requestBody === 'string'
                                                        ? e.requestBody
                                                        : JSON.stringify(e.requestBody, null, 2)}
                                                </div>
                                            </div>
                                        )}

                                        {/* Response Headers */}
                                        {e.responseHeaders && Object.keys(e.responseHeaders).length > 0 && (
                                            <div>
                                                <div className="text-[12px] text-zinc-500 mb-1">Response Headers</div>
                                                <div className="bg-zinc-800 rounded px-2 py-1.5 max-h-40 overflow-y-auto">
                                                    {Object.entries(e.responseHeaders).map(([key, value]) => (
                                                        <div key={key} className="text-[12px] font-mono">
                                                            <span className="text-zinc-500">{key}:</span>{" "}
                                                            <span className="text-zinc-300">{value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Response Body */}
                                        {e.responseBody && (
                                            <div>
                                                <div className="text-[12px] text-zinc-500 mb-1">Response Body</div>
                                                <div className="text-[12px] font-mono text-zinc-300 bg-zinc-800 rounded px-2 py-1.5 max-h-60 overflow-y-auto">
                                                    <pre className="whitespace-pre-wrap break-all">
                                                        {typeof e.responseBody === 'string'
                                                            ? e.responseBody
                                                            : JSON.stringify(e.responseBody, null, 2)}
                                                    </pre>
                                                </div>
                                            </div>
                                        )}

                                        {/* Error */}
                                        {e.error && (
                                            <div>
                                                <div className="text-[12px] text-red-400 mb-1">Error</div>
                                                <div className="text-[12px] font-mono text-red-300 bg-zinc-800 rounded px-2 py-1.5">
                                                    {e.error}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}