// src/shared/ui/code-frame.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, ChevronDown, ChevronUp, FileCode2, Loader2 } from "lucide-react";

type Props = {
    file?:    string;
    line?:    number;   // 1-based
    column?:  number;   // 1-based
    context?: number;
};

function formatPath(p: string) {
    const n = p.replace(/\\/g, "/");
    return n.startsWith("src/") ? n : `src/${n}`;
}

function getLangLabel(file: string) {
    const ext = file.split(".").pop()?.toLowerCase();
    return ({ tsx: "TSX", ts: "TS", jsx: "JSX", js: "JS", css: "CSS", scss: "SCSS", json: "JSON", html: "HTML", php: "PHP" } as Record<string, string>)[ext ?? ""] ?? ext?.toUpperCase() ?? "FILE";
}

export function CodeFrame({ file, line, column, context = 8 }: Props) {
    const [source,   setSource]   = useState<string | null>(null);
    const [err,      setErr]      = useState<string | null>(null);
    const [loading,  setLoading]  = useState(false);
    const [expanded, setExpanded] = useState(false);
    const errorRowRef = useRef<HTMLTableRowElement>(null);

    const srcFile = useMemo(() => (file ? formatPath(file) : null), [file]);

    useEffect(() => {
        let cancelled = false;
        if (!srcFile) return;
        setLoading(true);
        setErr(null);
        setSource(null);

        fetch(`/__source?file=${encodeURIComponent(srcFile)}`, { cache: "no-store" })
            .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); })
            .then(t  => { if (!cancelled) { setSource(t); setLoading(false); } })
            .catch(e => { if (!cancelled) { setErr(e instanceof Error ? e.message : String(e)); setLoading(false); } });

        return () => { cancelled = true; };
    }, [srcFile]);

    // scroll error line into view
    useEffect(() => {
        errorRowRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, [source]);

    const frame = useMemo(() => {
        if (!source || !line) return null;
        const lines = source.split("\n");
        const ctx   = expanded ? 30 : context;
        const start = Math.max(1, line - ctx);
        const end   = Math.min(lines.length, line + ctx);
        const chunk = [];
        for (let i = start; i <= end; i++) chunk.push({ n: i, text: lines[i - 1] ?? "" });
        return { chunk, total: lines.length };
    }, [source, line, context, expanded]);

    if (!srcFile) return null;

    const fileName = srcFile.split("/").pop() ?? srcFile;
    const dirPath  = srcFile.split("/").slice(0, -1).join("/");
    const lang     = getLangLabel(srcFile);

    return (
        <div style={{
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "var(--code-bg)",
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,.25)",
            fontFamily: "ui-monospace,'Cascadia Code','Fira Code',monospace",
            fontSize: 13,
        }}>
            {/* ── header ────────────────────────────────────────────────── */}
            <div style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "var(--code-header-bg)",
                borderBottom: "1px solid rgba(255,255,255,.06)",
                padding: "8px 14px",
            }}>
                {/* traffic lights */}
                <div style={{ display: "flex", gap: 6 }}>
                    {["#ff5f57","#febc2e","#28c840"].map(c => (
                        <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c, opacity: .75 }} />
                    ))}
                </div>

                {/* path */}
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 5, overflow: "hidden" }}>
                    <FileCode2 size={12} style={{ color: "var(--code-muted)", flexShrink: 0 }} />
                    <span style={{ color: "var(--code-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {dirPath}/
                    </span>
                    <span style={{ color: "#e2e8f0", fontWeight: 600, flexShrink: 0 }}>{fileName}</span>
                </div>

                {/* badges */}
                <span style={{ borderRadius: 4, background: "rgba(255,255,255,.06)", padding: "2px 6px", fontSize: 10, color: "var(--code-muted)", flexShrink: 0 }}>
                    {lang}
                </span>
                {line && (
                    <span style={{ borderRadius: 4, background: "rgba(239,68,68,.18)", padding: "2px 7px", fontSize: 10, fontWeight: 700, color: "#fca5a5", boxShadow: "inset 0 0 0 1px rgba(239,68,68,.25)", flexShrink: 0 }}>
                        :{line}{typeof column === "number" ? `:${column}` : ""}
                    </span>
                )}
            </div>

            {/* ── body ──────────────────────────────────────────────────── */}
            {loading && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "20px 16px", color: "var(--code-muted)" }}>
                    <Loader2 size={14} className="animate-spin" /> Завантаження...
                </div>
            )}

            {err && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "14px 16px", color: "#f87171" }}>
                    <AlertCircle size={14} style={{ marginTop: 1, flexShrink: 0 }} />
                    <div>
                        <div style={{ fontWeight: 600 }}>Не вдалося завантажити файл</div>
                        <div style={{ marginTop: 2, opacity: .65 }}>{err}</div>
                    </div>
                </div>
            )}

            {frame && (
                <>
                    <div style={{ maxHeight: 420, overflowY: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <tbody>
                            {frame.chunk.map(row => {
                                const isErr = row.n === line;
                                return (
                                    <tr
                                        key={row.n}
                                        ref={isErr ? errorRowRef : null}
                                        style={{ background: isErr ? "rgba(239,68,68,.12)" : undefined }}
                                    >
                                        {/* gutter */}
                                        <td style={{
                                            width: 48, textAlign: "right", padding: "2px 10px 2px 0",
                                            verticalAlign: "top", userSelect: "none",
                                            borderRight: isErr ? "1px solid rgba(239,68,68,.3)" : "1px solid rgba(255,255,255,.05)",
                                            color: isErr ? "#f87171" : "var(--code-muted)",
                                            fontWeight: isErr ? 700 : 400, lineHeight: 1.7,
                                        }}>
                                            {isErr ? `▶ ${row.n}` : row.n}
                                        </td>

                                        {/* code */}
                                        <td style={{ padding: "2px 14px", verticalAlign: "top", lineHeight: 1.7 }}>
                                                <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all", color: isErr ? "#f1f5f9" : "var(--code-text)" }}>
                                                    {row.text}
                                                </pre>
                                            {/* column caret */}
                                            {isErr && typeof column === "number" && column > 1 && (
                                                <pre style={{ margin: 0, color: "rgba(248,113,113,.55)" }}>
                                                        {" ".repeat(column - 1)}^
                                                    </pre>
                                            )}
                                        </td>

                                        {/* error strip */}
                                        <td style={{ width: 3, background: isErr ? "#ef4444" : undefined }} />
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>

                    {/* expand toggle */}
                    <button
                        onClick={() => setExpanded(v => !v)}
                        style={{
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                            width: "100%", padding: "7px 0",
                            borderTop: "1px solid rgba(255,255,255,.05)",
                            background: "rgba(255,255,255,.02)",
                            color: "var(--code-muted)", fontSize: 11,
                            border: "none", borderTopWidth: 1, borderTopStyle: "solid", borderTopColor: "rgba(255,255,255,.05)",
                            cursor: "pointer", transition: "background .15s",
                        }}
                    >
                        {expanded
                            ? <><ChevronUp size={12} /> Згорнути</>
                            : <><ChevronDown size={12} /> Більше контексту ({frame.total} рядків)</>}
                    </button>
                </>
            )}
        </div>
    );
}
