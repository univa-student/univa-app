import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
    CopyIcon,
    DatabaseIcon,
    EyeIcon,
    HardDriveIcon,
    RefreshCwIcon,
    RotateCcwIcon,
    SearchIcon,
    TrashIcon,
    XIcon,
    LayersIcon, ClipboardCheckIcon,
} from "lucide-react";
import type { QueryStatusFilter } from "../types";
import { SectionHeader } from "../ui/SectionHeader";
import { Pill } from "../ui/Pill";

// ─── helpers ────────────────────────────────────────────────────────────────

function safeJson(value: unknown, space = 2) {
    try {
        return JSON.stringify(value, null, space);
    } catch {
        return String(value);
    }
}

function formatTime(ts?: number) {
    if (!ts) return "—";
    return new Date(ts).toLocaleString("uk-UA");
}

function getQueryKeyString(queryKey: unknown) {
    return safeJson(queryKey, 0);
}

function matchesFilter(value: string, filter: string) {
    return value.toLowerCase().includes(filter.trim().toLowerCase());
}

// ─── LocalStorage helpers ───────────────────────────────────────────────────

function getAllLocalStorageEntries(): { key: string; value: string; size: number }[] {
    try {
        return Object.keys(localStorage).map((key) => {
            const value = localStorage.getItem(key) ?? "";
            return { key, value, size: new Blob([value]).size };
        });
    } catch {
        return [];
    }
}

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function tryParseJson(value: string) {
    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
}

// ─── useCopyToClipboard ─────────────────────────────────────────────────────

function useCopyToClipboard(timeout = 1500) {
    const [copied, setCopied] = useState<string | null>(null);

    const copy = useCallback(async (text: string, id: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(id);
            setTimeout(() => setCopied(null), timeout);
        } catch { /* noop */ }
    }, [timeout]);

    return { copied, copy };
}

// ─── ActiveTabType ──────────────────────────────────────────────────────────

type ActiveTabType = "query" | "localstorage";

// ─── JsonDisplay ────────────────────────────────────────────────────────────

function JsonDisplay({ value, className }: { value: unknown; className?: string }) {
    const text = safeJson(value);

    // Very simple syntax colouring via regex replacement
    const highlighted = (text || "").replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        (match) => {
            let cls = "text-blue-300";

            if (/^"/.test(match)) {
                cls = /:$/.test(match) ? "text-violet-300" : "text-emerald-300";
            } else if (/true|false/.test(match)) {
                cls = "text-amber-300";
            } else if (/null/.test(match)) {
                cls = "text-red-300";
            }

            return `<span class="${cls}">${match}</span>`;
        }
    );

    return (
        <pre
            className={`overflow-auto p-3 font-mono text-[12px] leading-5 text-zinc-300 ${className ?? ""}`}
            dangerouslySetInnerHTML={{ __html: highlighted }}
        />
    );
}

// ─── CacheTab ───────────────────────────────────────────────────────────────

export function CacheTab() {
    const qc = useQueryClient();
    const { copied, copy } = useCopyToClipboard();

    // ── tab switcher ──────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState<ActiveTabType>("query");

    // ── react-query state ─────────────────────────────────────────────────
    const [filter, setFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState<QueryStatusFilter>("all");
    const [selectedHash, setSelectedHash] = useState<string | null>(null);
    const [expandedSection, setExpandedSection] = useState<"data" | "error" | "meta">("data");
    const [allQueries, setAllQueries] = useState(() => qc.getQueryCache().getAll());

    useEffect(() => {
        const update = () => setAllQueries(qc.getQueryCache().getAll());
        const u1 = qc.getQueryCache().subscribe(update);
        const u2 = qc.getMutationCache().subscribe(update);
        return () => { u1(); u2(); };
    }, [qc]);

    const queries = useMemo(() => {
        return [...allQueries]
            .filter((q) => {
                const key = getQueryKeyString(q.queryKey);
                const matchesText =
                    !filter ||
                    matchesFilter(key, filter) ||
                    matchesFilter(String(q.queryHash), filter);
                const matchesStatus =
                    statusFilter === "all" ? true : q.state.status === statusFilter;
                return matchesText && matchesStatus;
            })
            .sort((a, b) => (b.state.dataUpdatedAt || 0) - (a.state.dataUpdatedAt || 0));
    }, [allQueries, filter, statusFilter]);

    const counts = useMemo(() => {
        let success = 0, error = 0, pending = 0;
        for (const q of allQueries) {
            if (q.state.status === "success") success++;
            if (q.state.status === "error") error++;
            if (q.state.status === "pending") pending++;
        }
        return { all: allQueries.length, success, error, pending };
    }, [allQueries]);

    useEffect(() => {
        if (!queries.length) { setSelectedHash(null); return; }
        if (!selectedHash || !queries.some((q) => q.queryHash === selectedHash)) {
            setSelectedHash(queries[0].queryHash);
        }
    }, [queries, selectedHash]);

    const selectedQuery = useMemo(
        () => queries.find((q) => q.queryHash === selectedHash) ?? null,
        [queries, selectedHash]
    );

    // ── localstorage state ────────────────────────────────────────────────
    const [lsFilter, setLsFilter] = useState("");
    const [lsEntries, setLsEntries] = useState(getAllLocalStorageEntries);
    const [selectedLsKey, setSelectedLsKey] = useState<string | null>(null);
    const [editingLsValue, setEditingLsValue] = useState<string | null>(null);
    const [lsError, setLsError] = useState<string | null>(null);

    const refreshLs = useCallback(() => {
        setLsEntries(getAllLocalStorageEntries());
    }, []);

    useEffect(() => {
        const handler = () => refreshLs();
        window.addEventListener("storage", handler);
        return () => window.removeEventListener("storage", handler);
    }, [refreshLs]);

    const filteredLsEntries = useMemo(
        () => lsEntries.filter((e) => matchesFilter(e.key, lsFilter) || matchesFilter(e.value, lsFilter)),
        [lsEntries, lsFilter]
    );

    const selectedLsEntry = useMemo(
        () => lsEntries.find((e) => e.key === selectedLsKey) ?? null,
        [lsEntries, selectedLsKey]
    );

    const lsTotalSize = useMemo(
        () => lsEntries.reduce((acc, e) => acc + e.size, 0),
        [lsEntries]
    );

    const deleteLsEntry = (key: string) => {
        try {
            localStorage.removeItem(key);
            if (selectedLsKey === key) setSelectedLsKey(null);
            refreshLs();
        } catch (e) { setLsError(String(e)); }
    };

    const saveLsEdit = () => {
        if (selectedLsKey === null || editingLsValue === null) return;
        try {
            localStorage.setItem(selectedLsKey, editingLsValue);
            setLsError(null);
            refreshLs();
            setEditingLsValue(null);
        } catch (e) { setLsError(String(e)); }
    };

    const clearLs = () => {
        try {
            localStorage.clear();
            setSelectedLsKey(null);
            refreshLs();
        } catch (e) { setLsError(String(e)); }
    };

    // ── status colours ────────────────────────────────────────────────────
    const statusColor: Record<string, string> = {
        success: "text-emerald-400",
        error: "text-red-400",
        pending: "text-amber-400",
    };

    const statusDot: Record<string, string> = {
        success: "bg-emerald-400",
        error: "bg-red-400",
        pending: "bg-amber-400",
    };

    // ── keyboard navigation ───────────────────────────────────────────────
    const listRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (activeTab !== "query") return;
        const handler = (e: KeyboardEvent) => {
            if (!queries.length) return;
            const idx = queries.findIndex((q) => q.queryHash === selectedHash);
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedHash(queries[Math.min(idx + 1, queries.length - 1)].queryHash);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedHash(queries[Math.max(idx - 1, 0)].queryHash);
            } else if (e.key === "r" && selectedQuery) {
                qc.refetchQueries({ queryKey: selectedQuery.queryKey, type: "active" });
            } else if (e.key === "i" && selectedQuery) {
                qc.invalidateQueries({ queryKey: selectedQuery.queryKey });
            } else if (e.key === "Backspace" && selectedQuery) {
                qc.removeQueries({ queryKey: selectedQuery.queryKey });
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [activeTab, queries, selectedHash, selectedQuery, qc]);

    // ─────────────────────────────────────────────────────────────────────
    return (
        <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-zinc-950 text-zinc-100">

            {/* ── top tab switcher ───────────────────────────────────────── */}
            <div className="flex shrink-0 items-center gap-1 border-b border-zinc-800 bg-zinc-950 px-3 py-2">
                <button
                    onClick={() => setActiveTab("query")}
                    className={[
                        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium uppercase tracking-wider transition-colors",
                        activeTab === "query"
                            ? "bg-zinc-800 text-zinc-100"
                            : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300",
                    ].join(" ")}
                >
                    <LayersIcon className="size-3.5" />
                    React Query
                    <span className="ml-0.5 rounded bg-zinc-700 px-1 py-0.5 text-[10px] text-zinc-300">
                        {counts.all}
                    </span>
                </button>

                <button
                    onClick={() => { setActiveTab("localstorage"); refreshLs(); }}
                    className={[
                        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium uppercase tracking-wider transition-colors",
                        activeTab === "localstorage"
                            ? "bg-zinc-800 text-zinc-100"
                            : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300",
                    ].join(" ")}
                >
                    <HardDriveIcon className="size-3.5" />
                    LocalStorage
                    <span className="ml-0.5 rounded bg-zinc-700 px-1 py-0.5 text-[10px] text-zinc-300">
                        {lsEntries.length}
                    </span>
                </button>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                REACT QUERY TAB
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === "query" && (
                <div className="flex min-h-0 flex-1 overflow-hidden">

                    {/* ── left: query list ──────────────────────────────── */}
                    <div className="flex min-w-0 flex-1 flex-col border-r border-zinc-800">

                        {/* header */}
                        <SectionHeader
                            title={`Queries (${queries.length})`}
                            action={
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => qc.invalidateQueries()}
                                        title="Invalidate all"
                                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
                                    >
                                        <RefreshCwIcon className="size-3" />
                                        Invalidate
                                    </button>
                                    <button
                                        onClick={() => qc.refetchQueries({ type: "active" })}
                                        title="Refetch active"
                                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
                                    >
                                        <RotateCcwIcon className="size-3" />
                                        Refetch
                                    </button>
                                    <button
                                        onClick={() => qc.clear()}
                                        title="Clear cache"
                                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                    >
                                        <TrashIcon className="size-3" />
                                        Clear
                                    </button>
                                </div>
                            }
                        />

                        {/* filter + status pills */}
                        <div className="shrink-0 border-b border-zinc-800 px-3 py-2 space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <SearchIcon className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />
                                    <input
                                        type="text"
                                        placeholder="Filter by key or hash…"
                                        value={filter}
                                        onChange={(e) => setFilter(e.target.value)}
                                        className="w-full rounded-md border border-zinc-800 bg-zinc-900 py-1.5 pl-7 pr-7 text-[13px] text-zinc-300 outline-none placeholder:text-zinc-600 focus:border-zinc-600"
                                    />
                                    {filter && (
                                        <button
                                            onClick={() => setFilter("")}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                                        >
                                            <XIcon className="size-3.5" />
                                        </button>
                                    )}
                                </div>

                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as QueryStatusFilter)}
                                    className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-[13px] text-zinc-300 outline-none"
                                >
                                    <option value="all">All</option>
                                    <option value="success">Success</option>
                                    <option value="error">Error</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>

                            {/* stats row */}
                            <div className="flex flex-wrap items-center gap-1.5">
                                <Pill color="zinc">All: {counts.all}</Pill>
                                <Pill color="emerald">✓ {counts.success}</Pill>
                                <Pill color="red">✗ {counts.error}</Pill>
                                <Pill color="amber">⋯ {counts.pending}</Pill>
                                <Pill color="blue">↻ {qc.isFetching()}</Pill>
                            </div>
                        </div>

                        {/* query rows */}
                        <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto">
                            {queries.length === 0 ? (
                                <div className="px-4 py-6 text-[13px] text-zinc-500">
                                    No queries{filter || statusFilter !== "all" ? " match current filters" : ""}.
                                </div>
                            ) : (
                                queries.map((q) => {
                                    const key = getQueryKeyString(q.queryKey);
                                    const state = q.state.status;
                                    const fetchStatus = q.state.fetchStatus;
                                    const obs = q.getObserversCount();
                                    const isSelected = q.queryHash === selectedHash;

                                    return (
                                        <button
                                            key={q.queryHash}
                                            onClick={() => setSelectedHash(q.queryHash)}
                                            className={[
                                                "group w-full border-b border-zinc-800/50 px-3 py-2 text-left transition-colors",
                                                isSelected ? "bg-zinc-900" : "hover:bg-zinc-900/60",
                                            ].join(" ")}
                                        >
                                            <div className="flex items-start gap-2.5">
                                                {/* status dot */}
                                                <span className="mt-[6px] shrink-0">
                                                    <span
                                                        className={[
                                                            "block size-1.5 rounded-full",
                                                            fetchStatus === "fetching"
                                                                ? "bg-blue-400 animate-pulse"
                                                                : statusDot[state] ?? "bg-zinc-500",
                                                        ].join(" ")}
                                                    />
                                                </span>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`shrink-0 font-mono text-[11px] font-bold uppercase ${statusColor[state] ?? "text-zinc-400"}`}>
                                                            {state}
                                                        </span>
                                                        {q.isStale() && <Pill color="amber">stale</Pill>}
                                                        {q.state.isInvalidated && <Pill color="red">inv</Pill>}
                                                        {fetchStatus === "fetching" && <Pill color="blue">fetching</Pill>}
                                                    </div>

                                                    <div className="mt-0.5 break-all font-mono text-[12px] leading-relaxed text-zinc-300">
                                                        {key}
                                                    </div>

                                                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-600">
                                                        <span>{formatTime(q.state.dataUpdatedAt)}</span>
                                                        <span>{obs} obs</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>

                        {/* keyboard hint */}
                        <div className="shrink-0 border-t border-zinc-800/60 px-3 py-1.5">
                            <p className="text-[11px] text-zinc-600">
                                ↑↓ navigate · <kbd className="font-mono">r</kbd> refetch · <kbd className="font-mono">i</kbd> invalidate · <kbd className="font-mono">⌫</kbd> remove
                            </p>
                        </div>
                    </div>

                    {/* ── right: query detail ───────────────────────────── */}
                    <div className="flex w-[46%] min-w-[320px] max-w-[680px] flex-col">
                        <SectionHeader
                            title={selectedQuery ? "Query Details" : "Details"}
                            action={
                                selectedQuery ? (
                                    <div className="flex items-center gap-0.5">
                                        <button
                                            onClick={() => copy(getQueryKeyString(selectedQuery.queryKey), "key")}
                                            className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                                            title="Copy key"
                                        >
                                            {copied === "key" ? <ClipboardCheckIcon className="size-3.5 text-emerald-400" /> : <CopyIcon className="size-3.5" />}
                                        </button>
                                        <button
                                            onClick={() => qc.invalidateQueries({ queryKey: selectedQuery.queryKey })}
                                            className="rounded p-1.5 text-amber-400 hover:bg-amber-500/10"
                                            title="Invalidate (i)"
                                        >
                                            <RefreshCwIcon className="size-3.5" />
                                        </button>
                                        <button
                                            onClick={() => qc.refetchQueries({ queryKey: selectedQuery.queryKey, type: "active" })}
                                            className="rounded p-1.5 text-blue-400 hover:bg-blue-500/10"
                                            title="Refetch (r)"
                                        >
                                            <RotateCcwIcon className="size-3.5" />
                                        </button>
                                        <button
                                            onClick={() => qc.resetQueries({ queryKey: selectedQuery.queryKey })}
                                            className="rounded p-1.5 text-zinc-300 hover:bg-zinc-800"
                                            title="Reset"
                                        >
                                            <EyeIcon className="size-3.5" />
                                        </button>
                                        <button
                                            onClick={() => qc.removeQueries({ queryKey: selectedQuery.queryKey })}
                                            className="rounded p-1.5 text-red-400 hover:bg-red-500/10"
                                            title="Remove (⌫)"
                                        >
                                            <TrashIcon className="size-3.5" />
                                        </button>
                                    </div>
                                ) : null
                            }
                        />

                        {!selectedQuery ? (
                            <div className="flex flex-1 items-center justify-center px-6 text-center text-[13px] text-zinc-500">
                                Select a query to inspect its state, data, and errors.
                            </div>
                        ) : (
                            <>
                                {/* meta grid */}
                                <div className="shrink-0 border-b border-zinc-800 px-3 py-2.5">
                                    <div className="mb-2 break-all font-mono text-[12px] text-zinc-400">
                                        {getQueryKeyString(selectedQuery.queryKey)}
                                    </div>
                                    <div className="grid grid-cols-3 gap-1.5 text-[12px]">
                                        {[
                                            { label: "Status", value: selectedQuery.state.status },
                                            { label: "Fetch status", value: selectedQuery.state.fetchStatus },
                                            { label: "Observers", value: selectedQuery.getObserversCount() },
                                            { label: "Updated at", value: formatTime(selectedQuery.state.dataUpdatedAt) },
                                            { label: "Stale", value: selectedQuery.isStale() ? "true" : "false" },
                                            { label: "Invalidated", value: selectedQuery.state.isInvalidated ? "true" : "false" },
                                        ].map(({ label, value }) => (
                                            <div key={label} className="rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1.5">
                                                <div className="text-[11px] text-zinc-500">{label}</div>
                                                <div className="mt-0.5 truncate font-mono text-zinc-200">{String(value)}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* section tabs */}
                                <div className="flex shrink-0 items-center gap-1 border-b border-zinc-800 px-3 py-1.5">
                                    {(["data", "error", "meta"] as const).map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setExpandedSection(s)}
                                            className={[
                                                "rounded-md px-2.5 py-1 text-[12px] uppercase tracking-wider transition-colors",
                                                expandedSection === s
                                                    ? "bg-zinc-800 text-zinc-100"
                                                    : "text-zinc-500 hover:text-zinc-300",
                                            ].join(" ")}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>

                                {/* section content */}
                                <div className="min-h-0 flex-1 overflow-auto px-3 py-3">
                                    <div className="rounded-xl border border-zinc-800 bg-zinc-950">
                                        <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-1.5">
                                            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-zinc-500">
                                                <DatabaseIcon className="size-3" />
                                                {expandedSection}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const payload =
                                                        expandedSection === "data" ? selectedQuery.state.data
                                                            : expandedSection === "error" ? selectedQuery.state.error
                                                                : { queryHash: selectedQuery.queryHash };
                                                    copy(safeJson(payload), "section");
                                                }}
                                                className="text-zinc-500 hover:text-zinc-300"
                                                title="Copy"
                                            >
                                                {copied === "section" ? <ClipboardCheckIcon className="size-3.5 text-emerald-400" /> : <CopyIcon className="size-3.5" />}
                                            </button>
                                        </div>

                                        {expandedSection === "data" && (
                                            <JsonDisplay value={selectedQuery.state.data} />
                                        )}
                                        {expandedSection === "error" && (
                                            <pre className="overflow-auto p-3 font-mono text-[12px] leading-5 text-red-300">
                                                {safeJson(selectedQuery.state.error)}
                                            </pre>
                                        )}
                                        {expandedSection === "meta" && (
                                            <JsonDisplay value={{
                                                queryHash: selectedQuery.queryHash,
                                                queryKey: selectedQuery.queryKey,
                                                meta: selectedQuery.meta,
                                                state: {
                                                    status: selectedQuery.state.status,
                                                    fetchStatus: selectedQuery.state.fetchStatus,
                                                    dataUpdateCount: selectedQuery.state.dataUpdateCount,
                                                    errorUpdateCount: selectedQuery.state.errorUpdateCount,
                                                    dataUpdatedAt: selectedQuery.state.dataUpdatedAt,
                                                    errorUpdatedAt: selectedQuery.state.errorUpdatedAt,
                                                    fetchFailureCount: selectedQuery.state.fetchFailureCount,
                                                    isInvalidated: selectedQuery.state.isInvalidated,
                                                },
                                            }} />
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                LOCAL STORAGE TAB
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === "localstorage" && (
                <div className="flex min-h-0 flex-1 overflow-hidden">

                    {/* ── left: entries list ────────────────────────────── */}
                    <div className="flex min-w-0 flex-1 flex-col border-r border-zinc-800">
                        <SectionHeader
                            title={`LocalStorage (${filteredLsEntries.length})`}
                            action={
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={refreshLs}
                                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] text-blue-400 hover:bg-blue-500/10"
                                        title="Refresh"
                                    >
                                        <RotateCcwIcon className="size-3" />
                                        Refresh
                                    </button>
                                    <button
                                        onClick={clearLs}
                                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] text-red-400 hover:bg-red-500/10"
                                        title="Clear all"
                                    >
                                        <TrashIcon className="size-3" />
                                        Clear
                                    </button>
                                </div>
                            }
                        />

                        {/* filter + total size */}
                        <div className="shrink-0 border-b border-zinc-800 px-3 py-2 space-y-2">
                            <div className="relative">
                                <SearchIcon className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />
                                <input
                                    type="text"
                                    placeholder="Filter by key or value…"
                                    value={lsFilter}
                                    onChange={(e) => setLsFilter(e.target.value)}
                                    className="w-full rounded-md border border-zinc-800 bg-zinc-900 py-1.5 pl-7 pr-7 text-[13px] text-zinc-300 outline-none placeholder:text-zinc-600 focus:border-zinc-600"
                                />
                                {lsFilter && (
                                    <button
                                        onClick={() => setLsFilter("")}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                                    >
                                        <XIcon className="size-3.5" />
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5">
                                <Pill color="zinc">Keys: {lsEntries.length}</Pill>
                                <Pill color="blue">Size: {formatBytes(lsTotalSize)}</Pill>
                            </div>
                        </div>

                        {/* entries */}
                        <div className="min-h-0 flex-1 overflow-y-auto">
                            {filteredLsEntries.length === 0 ? (
                                <div className="px-4 py-6 text-[13px] text-zinc-500">
                                    {lsEntries.length === 0 ? "LocalStorage is empty." : "No entries match the filter."}
                                </div>
                            ) : (
                                filteredLsEntries.map((entry) => {
                                    const isSelected = entry.key === selectedLsKey;
                                    const parsed = tryParseJson(entry.value);
                                    const isJson = parsed !== null;

                                    return (
                                        <button
                                            key={entry.key}
                                            onClick={() => { setSelectedLsKey(entry.key); setEditingLsValue(null); }}
                                            className={[
                                                "group w-full border-b border-zinc-800/50 px-3 py-2 text-left transition-colors",
                                                isSelected ? "bg-zinc-900" : "hover:bg-zinc-900/60",
                                            ].join(" ")}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="truncate font-mono text-[13px] text-violet-300">
                                                            {entry.key}
                                                        </span>
                                                        {isJson && <Pill color="blue">JSON</Pill>}
                                                    </div>
                                                    <div className="mt-0.5 truncate font-mono text-[11px] text-zinc-500">
                                                        {entry.value.slice(0, 80)}{entry.value.length > 80 ? "…" : ""}
                                                    </div>
                                                </div>
                                                <span className="shrink-0 text-[11px] text-zinc-600">{formatBytes(entry.size)}</span>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* ── right: entry detail ───────────────────────────── */}
                    <div className="flex w-[46%] min-w-[320px] max-w-[680px] flex-col">
                        <SectionHeader
                            title={selectedLsEntry ? "Entry Details" : "Details"}
                            action={
                                selectedLsEntry ? (
                                    <div className="flex items-center gap-0.5">
                                        <button
                                            onClick={() => copy(selectedLsEntry.key, "ls-key")}
                                            className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                                            title="Copy key"
                                        >
                                            {copied === "ls-key" ? <ClipboardCheckIcon className="size-3.5 text-emerald-400" /> : <CopyIcon className="size-3.5" />}
                                        </button>
                                        <button
                                            onClick={() => copy(selectedLsEntry.value, "ls-val")}
                                            className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                                            title="Copy value"
                                        >
                                            {copied === "ls-val" ? <ClipboardCheckIcon className="size-3.5 text-emerald-400" /> : <DatabaseIcon className="size-3.5" />}
                                        </button>
                                        <button
                                            onClick={() => setEditingLsValue(editingLsValue === null ? selectedLsEntry.value : null)}
                                            className="rounded p-1.5 text-blue-400 hover:bg-blue-500/10"
                                            title="Edit value"
                                        >
                                            <EyeIcon className="size-3.5" />
                                        </button>
                                        <button
                                            onClick={() => deleteLsEntry(selectedLsEntry.key)}
                                            className="rounded p-1.5 text-red-400 hover:bg-red-500/10"
                                            title="Delete"
                                        >
                                            <TrashIcon className="size-3.5" />
                                        </button>
                                    </div>
                                ) : null
                            }
                        />

                        {!selectedLsEntry ? (
                            <div className="flex flex-1 items-center justify-center px-6 text-center text-[13px] text-zinc-500">
                                Select an entry to inspect or edit its value.
                            </div>
                        ) : (
                            <div className="min-h-0 flex-1 overflow-auto px-3 py-3 space-y-3">
                                {/* key + size */}
                                <div className="grid grid-cols-2 gap-1.5 text-[12px]">
                                    <div className="col-span-2 rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1.5">
                                        <div className="text-[11px] text-zinc-500">Key</div>
                                        <div className="mt-0.5 break-all font-mono text-violet-300">{selectedLsEntry.key}</div>
                                    </div>
                                    <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1.5">
                                        <div className="text-[11px] text-zinc-500">Size</div>
                                        <div className="mt-0.5 font-mono text-zinc-200">{formatBytes(selectedLsEntry.size)}</div>
                                    </div>
                                    <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1.5">
                                        <div className="text-[11px] text-zinc-500">Type</div>
                                        <div className="mt-0.5 font-mono text-zinc-200">
                                            {tryParseJson(selectedLsEntry.value) !== null ? "JSON" : "String"}
                                        </div>
                                    </div>
                                </div>

                                {/* value display / edit */}
                                <div className="rounded-xl border border-zinc-800 bg-zinc-950">
                                    <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-1.5">
                                        <span className="text-[11px] uppercase tracking-wider text-zinc-500">Value</span>
                                        {editingLsValue !== null && (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={saveLsEdit}
                                                    className="rounded px-2 py-0.5 text-[11px] bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => { setEditingLsValue(null); setLsError(null); }}
                                                    className="rounded px-2 py-0.5 text-[11px] text-zinc-500 hover:text-zinc-300"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {lsError && (
                                        <div className="border-b border-red-500/20 bg-red-500/10 px-3 py-1.5 text-[12px] text-red-300">
                                            {lsError}
                                        </div>
                                    )}

                                    {editingLsValue !== null ? (
                                        <textarea
                                            value={editingLsValue}
                                            onChange={(e) => setEditingLsValue(e.target.value)}
                                            className="w-full bg-transparent p-3 font-mono text-[12px] leading-5 text-zinc-300 outline-none resize-none min-h-[200px]"
                                            spellCheck={false}
                                        />
                                    ) : (
                                        tryParseJson(selectedLsEntry.value) !== null
                                            ? <JsonDisplay value={tryParseJson(selectedLsEntry.value)} />
                                            : <pre className="overflow-auto p-3 font-mono text-[12px] leading-5 text-emerald-300">{selectedLsEntry.value}</pre>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}