// src/shared/ui/router-error-page.tsx
import { useState, useEffect, useCallback } from "react";
import {
    isRouteErrorResponse,
    useLocation,
    useNavigate,
    useRouteError,
} from "react-router-dom";
import {
    ArrowLeft, Bug, Check, ChevronRight, Code2, Copy,
    Home, Moon, RefreshCw, ScrollText, Server, Sparkles,
    Sun, Terminal,
} from "lucide-react";
import { CodeFrame } from "./code-frame";
import { pickHints } from "@/shared/errors/error-hints";
import { APP_NAME, APP_VERSION, API_BASE_URL, LS_KEY_ERR_THEME } from "@/app/config/app.config.ts";

// ─── types ───────────────────────────────────────────────────────────────────
type Theme = "dark" | "light";
type TabId = "overview" | "code" | "laravel" | "stack";

// ─── helpers ─────────────────────────────────────────────────────────────────
function safeStringify(v: unknown) {
    try { return JSON.stringify(v, null, 2); } catch { return String(v); }
}

async function copyToClipboard(text: string) {
    try { await navigator.clipboard.writeText(text); } catch {
        const el = document.createElement("textarea");
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
    }
}

function extractDevSourceLocation(stack?: string) {
    if (!stack) return null;
    const fm = /fileName:\s*"([^"]+)"/.exec(stack);
    const lm = /lineNumber:\s*(\d+)/.exec(stack);
    const cm = /columnNumber:\s*(\d+)/.exec(stack);
    if (fm && lm) {
        const fp = fm[1].replace(/\\/g, "/");
        const i = fp.indexOf("/src/");
        return {
            file: i !== -1 ? `src/${fp.slice(i + 5)}` : fp,
            line: Number(lm[1]),
            column: cm ? Number(cm[1]) : undefined,
        };
    }
    const um = /(https?:\/\/[^\s)]+\/src\/[^\s)]+):(\d+):(\d+)/.exec(stack);
    if (um) {
        const url = um[1].split("?")[0];
        const i2 = url.indexOf("/src/");
        return {
            file: i2 !== -1 ? `src/${url.slice(i2 + 5)}` : url,
            line: Number(um[2]),
            column: Number(um[3]),
        };
    }
    return null;
}

// ─── CSS-variable themes ─────────────────────────────────────────────────────
const THEMES: Record<Theme, Record<string, string>> = {
    dark: {
        "--bg": "#09090b",
        "--bg-subtle": "#18181b",
        "--bg-muted": "rgba(24,24,27,.5)",
        "--border": "#27272a",
        "--border-muted": "rgba(39,39,42,.6)",
        "--text": "#f4f4f5",
        "--text-muted": "#a1a1aa",
        "--text-faint": "#52525b",
        "--accent": "#ef4444",
        "--accent-bg": "rgba(69,10,10,.3)",
        "--accent-border": "rgba(127,29,29,.45)",
        "--accent-text": "#fca5a5",
        "--accent-subtle": "rgba(69,10,10,.12)",
        "--amber-text": "#fcd34d",
        "--amber-bg": "rgba(78,47,0,.35)",
        "--amber-border": "rgba(120,80,0,.4)",
        "--nav-active": "#27272a",
        "--topbar-bg": "rgba(9,9,11,.88)",
        "--code-bg": "#0d1117",
        "--code-header-bg": "#161b22",
        "--code-text": "#c9d1d9",
        "--code-muted": "#6e7681",
    },
    light: {
        "--bg": "#f3f3f6",
        "--bg-subtle": "#ffffff",
        "--bg-muted": "rgba(255,255,255,.75)",
        "--border": "#e0e0e8",
        "--border-muted": "rgba(200,200,215,.55)",
        "--text": "#1a1a20",
        "--text-muted": "#6b6b78",
        "--text-faint": "#9a9aaa",
        "--accent": "#e3342f",
        "--accent-bg": "rgba(227,52,47,.07)",
        "--accent-border": "rgba(220,40,36,.22)",
        "--accent-text": "#b91c1c",
        "--accent-subtle": "rgba(227,52,47,.04)",
        "--amber-text": "#92400e",
        "--amber-bg": "rgba(255,237,213,.65)",
        "--amber-border": "rgba(180,120,40,.28)",
        "--nav-active": "#ebebf0",
        "--topbar-bg": "rgba(243,243,246,.92)",
        "--code-bg": "#1e1e2e",
        "--code-header-bg": "#181825",
        "--code-text": "#cdd6f4",
        "--code-muted": "#6c7086",
    },
};

function applyTheme(el: HTMLElement, t: Theme) {
    const vars = THEMES[t];
    Object.entries(vars).forEach(([k, v]) => el.style.setProperty(k, v));
}

// ─── tab config ───────────────────────────────────────────────────────────────
const TAB_CONFIG: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Огляд", icon: Sparkles },
    { id: "code", label: "Код", icon: Code2 },
    { id: "laravel", label: "Laravel", icon: Server },
    { id: "stack", label: "Stack", icon: ScrollText },
];

// ─── tiny styled helpers ──────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: ".12em", color: "var(--text-faint)", marginBottom: 8 }}>
            {children}
        </div>
    );
}

function MetaRow({ label, value }: { label: string; value: string }) {
    return (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "7px 0", borderBottom: "1px solid var(--border-muted)" }}>
            <span style={{ width: 72, flexShrink: 0, fontFamily: "ui-monospace,monospace", fontSize: 13, color: "var(--text-faint)" }}>{label}</span>
            <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 13, color: "var(--text-muted)", wordBreak: "break-all" as const }}>{value}</span>
        </div>
    );
}

function JsonBlock({ title, data }: { title: string; data: unknown }) {
    return (
        <div style={{ borderRadius: 8, border: "1px solid var(--border)", overflow: "hidden", background: "var(--code-bg)" }}>
            <div style={{ padding: "7px 14px", borderBottom: "1px solid var(--border)", background: "var(--code-header-bg)", fontFamily: "ui-monospace,monospace", fontSize: 10, fontWeight: 600, color: "var(--code-muted)", textTransform: "uppercase" as const, letterSpacing: ".08em" }}>
                {title}
            </div>
            <pre style={{ maxHeight: 280, overflow: "auto", padding: 16, fontFamily: "ui-monospace,monospace", fontSize: 11, lineHeight: 1.7, color: "var(--code-text)", margin: 0 }}>
                {safeStringify(data)}
            </pre>
        </div>
    );
}

function EmptyState({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-subtle)", padding: "48px 24px", textAlign: "center" as const, fontSize: 13, color: "var(--text-faint)", lineHeight: 1.7 }}>
            {children}
        </div>
    );
}

// ─── main component ───────────────────────────────────────────────────────────
export function RouterErrorPage() {
    const error = useRouteError();
    const navigate = useNavigate();
    const location = useLocation();
    const isDev = import.meta.env.DEV;

    const [rootRef, setRootRef] = useState<HTMLDivElement | null>(null);
    const [activeTab, setActiveTab] = useState<TabId>("overview");
    const [copied, setCopied] = useState(false);
    const [theme, setTheme] = useState<Theme>(() => {
        try {
            const saved = localStorage.getItem(LS_KEY_ERR_THEME) as Theme | null;
            if (saved === "dark" || saved === "light") return saved;
        } catch { /* ignore */ }
        return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    });

    // apply theme vars onto root div (not document — keeps it scoped)
    useEffect(() => {
        if (rootRef) applyTheme(rootRef, theme);
    }, [rootRef, theme]);

    const toggleTheme = useCallback(() => {
        setTheme(t => {
            const next: Theme = t === "dark" ? "light" : "dark";
            try { localStorage.setItem(LS_KEY_ERR_THEME, next); } catch { /* ignore */ }
            return next;
        });
    }, []);

    // ── parse error ───────────────────────────────────────────────────────────
    let title: string;
    let message = "Спробуй оновити сторінку або повернутися назад.";
    let status: number | null = null;
    let data: unknown = null;
    let stack = "";
    let kind: "route" | "runtime" | "unknown";

    if (isRouteErrorResponse(error)) {
        kind = "route";
        status = error.status;
        title = `${error.status} ${error.statusText || ""}`.trim();
        data = error.data;
        message = typeof error.data === "string"
            ? error.data
            : "Помилка під час завантаження маршруту (loader/action).";
    } else if (error instanceof Error) {
        kind = "runtime";
        title = error.name || "Error";
        message = error.message || message;
        data = error.cause ?? null;
        stack = error.stack ?? "";
    } else {
        kind = "unknown";
        title = "Unknown error";
        message = typeof error === "string" ? error : "Невідома помилка.";
        data = error;
    }

    const top = extractDevSourceLocation(stack);
    const hints = pickHints({ title, message, status, kind, topFile: top?.file }, 3);

    // ── laravel payload ───────────────────────────────────────────────────────
    const laravel = (() => {
        if (!data || typeof data !== "object") return null;
        const a = data as Record<string, unknown>;
        const msg = typeof a.message === "string" ? a.message : null;
        const errs = typeof a.errors === "object" ? a.errors : null;
        const exc = typeof a.exception === "string" ? a.exception : null;
        const file = typeof a.file === "string" ? a.file : null;
        const ln = typeof a.line === "number" ? a.line : null;
        const tr = Array.isArray(a.trace) ? a.trace : null;
        if (!msg && !errs && !exc && !file && !tr) return null;
        return { message: msg, errors: errs, exception: exc, file, line: ln, trace: tr, raw: a };
    })();

    // ── app meta ──────────────────────────────────────────────────────────────
    const appMeta = {
        name: APP_NAME,
        version: APP_VERSION,
        apiUrl: API_BASE_URL,
        mode: import.meta.env.MODE,
        route: location.pathname + location.search + location.hash,
        time: new Date().toISOString(),
        ua: navigator.userAgent,
    };

    const reportText = [
        `Kind: ${kind}`, `Title: ${title}`, `Message: ${message}`,
        status ? `Status: ${status}` : null,
        top?.file ? `Source: ${top.file}:${top.line}:${top.column}` : null,
        "", "App:", safeStringify(appMeta),
        "", "Laravel:", safeStringify(laravel?.raw ?? null),
        "", "Stack:", stack || "—",
    ].filter(Boolean).join("\n");

    const handleCopy = async () => {
        await copyToClipboard(reportText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
    };

    // status badge style
    const statusBadgeStyle: React.CSSProperties =
        !status ? {} :
            status >= 500 ? { background: "var(--accent-bg)", color: "var(--accent-text)", boxShadow: "inset 0 0 0 1px var(--accent-border)" } :
                status >= 400 ? { background: "var(--amber-bg)", color: "var(--amber-text)", boxShadow: "inset 0 0 0 1px var(--amber-border)" } :
                    { background: "var(--bg-subtle)", color: "var(--text-faint)" };

    const tabBadges: Partial<Record<TabId, string>> = {
        laravel: laravel ? "data" : undefined,
        stack: !isDev ? "prod" : undefined,
    };

    // shared inline style shortcuts
    const card = (extra?: React.CSSProperties): React.CSSProperties => ({
        borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-subtle)", ...extra,
    });

    return (
        <div
            ref={setRootRef}
            style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "ui-sans-serif,system-ui,-apple-system,sans-serif", fontSize: 14 }}
        >
            {/* ── topbar ────────────────────────────────────────────────────── */}
            <header style={{
                position: "sticky", top: 0, zIndex: 50,
                borderBottom: "1px solid var(--border)",
                background: "var(--topbar-bg)", backdropFilter: "blur(12px)",
                padding: "10px 20px",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                maxWidth: 1700,
            }} className="mx-auto">
                <div style={{ display: "flex", alignItems: "center", gap: 12, overflow: "hidden" }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                        background: "var(--accent-bg)", border: "1px solid var(--accent-border)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <Bug size={15} style={{ color: "var(--accent-text)" }} />
                    </div>
                    <div style={{ overflow: "hidden" }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{appMeta.name} — Runtime Error</div>
                        <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, color: "var(--text-faint)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {appMeta.route}
                        </div>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    {status && (
                        <span style={{ borderRadius: 4, padding: "2px 8px", fontFamily: "ui-monospace,monospace", fontSize: 11, fontWeight: 700, ...statusBadgeStyle }}>
                            {status}
                        </span>
                    )}
                    <span style={{ borderRadius: 4, padding: "2px 8px", border: "1px solid var(--border)", background: "var(--bg-subtle)", fontFamily: "ui-monospace,monospace", fontSize: 11, color: "var(--text-faint)" }}>
                        {appMeta.mode}
                    </span>

                    {/* theme toggle */}
                    <button
                        onClick={toggleTheme}
                        title={theme === "dark" ? "Switch to light" : "Switch to dark"}
                        style={{
                            display: "flex", alignItems: "center", justifyContent: "center",
                            width: 32, height: 32, borderRadius: 8,
                            border: "1px solid var(--border)", background: "var(--bg-subtle)",
                            color: "var(--text-muted)", cursor: "pointer", transition: "all .15s",
                            flexShrink: 0,
                        }}
                    >
                        {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
                    </button>

                    <button
                        onClick={handleCopy}
                        style={{
                            display: "flex", alignItems: "center", gap: 6,
                            border: "1px solid var(--border)", background: "var(--bg-subtle)",
                            color: "var(--text-muted)", borderRadius: 8,
                            padding: "6px 12px", fontSize: 12, cursor: "pointer", transition: "all .15s",
                        }}
                    >
                        {copied
                            ? <><Check size={13} style={{ color: "#4ade80" }} /> Скопійовано</>
                            : <><Copy size={13} /> Copy report</>}
                    </button>
                </div>
            </header>

            {/* ── layout ────────────────────────────────────────────────────── */}
            <div style={{ maxWidth: 1700, margin: "0 auto", display: "flex", gap: 0, padding: "28px 20px" }}>

                {/* ── sidebar ───────────────────────────────────────────────── */}
                <aside style={{ width: 200, flexShrink: 0, marginRight: 24, position: "sticky", top: 68, height: "fit-content" }}>

                    {/* nav tabs */}
                    <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {TAB_CONFIG.map(({ id, label, icon: Icon }) => {
                            const badge = tabBadges[id];
                            const active = activeTab === id;
                            const disabled = id === "laravel" && !laravel;
                            return (
                                <button
                                    key={id}
                                    onClick={() => !disabled && setActiveTab(id)}
                                    disabled={disabled}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 9,
                                        padding: "8px 11px", borderRadius: 8, fontSize: 13,
                                        border: "none", textAlign: "left", width: "100%",
                                        cursor: disabled ? "not-allowed" : "pointer",
                                        background: active ? "var(--nav-active)" : "transparent",
                                        color: active ? "var(--text)" : disabled ? "var(--text-faint)" : "var(--text-muted)",
                                        fontWeight: active ? 600 : 400,
                                        transition: "all .12s",
                                    }}
                                >
                                    <Icon size={20} style={{ flexShrink: 0 }} />
                                    <span style={{ flex: 1 }}>{label}</span>
                                    {badge && (
                                        <span style={{ borderRadius: 4, padding: "1px 5px", background: "var(--border)", fontFamily: "ui-monospace,monospace", fontSize: 14, color: "var(--text-faint)" }}>
                                            {badge}
                                        </span>
                                    )}
                                    {active && <ChevronRight size={20} style={{ color: "var(--text-faint)", flexShrink: 0 }} />}
                                </button>
                            );
                        })}
                    </nav>

                    {/* actions */}
                    <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 2 }}>
                        {[
                            { label: "Reload", icon: RefreshCw, action: () => window.location.reload() },
                            { label: "Back", icon: ArrowLeft, action: () => navigate(-1) },
                            { label: "Dashboard", icon: Home, action: () => navigate("/dashboard", { replace: true }) },
                        ].map(({ label, icon: Icon, action }) => (
                            <button key={label} onClick={action} style={{
                                display: "flex", alignItems: "center", gap: 8,
                                padding: "7px 11px", borderRadius: 8, fontSize: 13,
                                color: "var(--text-muted)", background: "none", border: "none",
                                cursor: "pointer", transition: "color .12s", textAlign: "left",
                            }}>
                                <Icon size={20} />{label}
                            </button>
                        ))}
                    </div>

                    {/* app info mini-card */}
                    <div style={{ ...card(), marginTop: 20, overflow: "hidden" }}>
                        <div style={{ padding: "7px 12px", borderBottom: "1px solid var(--border)", fontSize: 12, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: ".12em", color: "var(--text-faint)" }}>
                            App info
                        </div>
                        <div style={{ padding: "1px 12px 10px" }}>
                            {[
                                ["v", appMeta.version],
                                ["mode", appMeta.mode],
                                ["api", appMeta.apiUrl],
                            ].map(([k, v]) => (
                                <div key={k} style={{ paddingTop: 7 }}>
                                    <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 13, color: "var(--text-faint)" }}>{k}</div>
                                    <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 14, color: "var(--text-muted)", wordBreak: "break-all" as const, marginTop: 1 }}>{v}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* ── main content ──────────────────────────────────────────── */}
                <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>

                    {/* ══ OVERVIEW ══════════════════════════════════════════ */}
                    {activeTab === "overview" && <>

                        {/* error headline */}
                        <div style={{ borderRadius: 12, border: "1px solid var(--accent-border)", background: "var(--accent-subtle)", padding: 24 }}>
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                                <div style={{
                                    width: 38, height: 38, borderRadius: 9, flexShrink: 0, marginTop: 2,
                                    background: "var(--accent-bg)", border: "1px solid var(--accent-border)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    <Terminal size={20} style={{ color: "var(--accent-text)" }} />
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <h1 style={{ fontFamily: "ui-monospace,monospace", fontSize: 24, fontWeight: 700, color: "var(--accent-text)", lineHeight: 1.2, margin: 0 }}>
                                        {title}
                                    </h1>
                                    <p style={{ marginTop: 6, fontSize: 15, color: "var(--text-muted)", lineHeight: 1.65, marginBottom: 0 }}>
                                        {message}
                                    </p>
                                    {top?.file && (
                                        <button
                                            onClick={() => setActiveTab("code")}
                                            style={{
                                                marginTop: 12, display: "flex", alignItems: "center", gap: 5,
                                                fontFamily: "ui-monospace,monospace", fontSize: 13,
                                                color: "var(--text-faint)", background: "none",
                                                border: "none", cursor: "pointer", padding: 0, transition: "color .12s",
                                            }}
                                        >
                                            <Code2 size={14} />
                                            {top.file}
                                            <span style={{ color: "var(--accent)" }}>:{top.line}</span>
                                            {top.column && <span style={{ color: "var(--text-faint)" }}>:{top.column}</span>}
                                            <ChevronRight size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* hints */}
                        {hints.length > 0 && (
                            <div>
                                <SectionLabel>Можливі причини</SectionLabel>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    {hints.map(h => (
                                        <div key={h.id} style={{ ...card(), padding: "12px 16px" }}>
                                            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>{h.title}</div>
                                            <div style={{ marginTop: 4, fontSize: 14, color: "var(--text-muted)", lineHeight: 1.65 }}>{h.description}</div>
                                            {h.tags && (
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                                                    {h.tags.map(t => (
                                                        <span key={t} style={{ borderRadius: 4, border: "1px solid var(--border)", padding: "1px 6px", fontFamily: "ui-monospace,monospace", fontSize: 12, color: "var(--text-faint)" }}>
                                                            #{t}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* context meta */}
                        <div>
                            <SectionLabel>Контекст запиту</SectionLabel>
                            <div style={{ ...card(), overflow: "hidden" }}>
                                <div style={{ padding: "0 16px" }}>
                                    {[
                                        ["mode", appMeta.mode],
                                        ["version", appMeta.version],
                                        ["api", appMeta.apiUrl],
                                        ["route", appMeta.route],
                                        ["time", appMeta.time],
                                        ["ua", appMeta.ua],
                                    ].map(([k, v]) => <MetaRow key={k} label={k} value={v} />)}
                                </div>
                            </div>
                        </div>
                    </>}

                    {/* ══ CODE ════════════════════════════════════════════ */}
                    {activeTab === "code" && (
                        top?.file
                            ? <CodeFrame file={top.file} line={top.line} column={top.column} />
                            : <EmptyState>Не вдалося витягнути файл / рядок зі stack trace</EmptyState>
                    )}

                    {/* ══ LARAVEL ═════════════════════════════════════════ */}
                    {activeTab === "laravel" && (
                        !laravel
                            ? <EmptyState>Нема Laravel payload. Тут зʼявиться інфо коли loader/action поверне дані з Laravel (422, 500 тощо).</EmptyState>
                            : <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {laravel.exception && (
                                    <div style={{ borderRadius: 8, border: "1px solid var(--amber-border)", background: "var(--amber-bg)", padding: "10px 16px", fontFamily: "ui-monospace,monospace", fontSize: 13, color: "var(--amber-text)" }}>
                                        {laravel.exception}
                                    </div>
                                )}
                                {laravel.message && (
                                    <div style={{ ...card(), padding: "10px 16px", fontSize: 13, color: "var(--text-muted)" }}>
                                        {laravel.message}
                                    </div>
                                )}
                                {laravel.file && (
                                    <CodeFrame file={laravel.file} line={laravel.line ?? undefined} />
                                )}
                                {laravel.errors && <JsonBlock title="errors — 422 validation" data={laravel.errors} />}
                                <JsonBlock title="raw payload" data={laravel.raw} />
                            </div>
                    )}

                    {/* ══ STACK ═══════════════════════════════════════════ */}
                    {activeTab === "stack" && (
                        !isDev
                            ? <EmptyState>Stack прихований у production-режимі.</EmptyState>
                            : <div style={{ borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden", background: "var(--code-bg)" }}>
                                <div style={{ borderBottom: "1px solid var(--border)", background: "var(--code-header-bg)", padding: "8px 16px", fontFamily: "ui-monospace,monospace", fontSize: 10, fontWeight: 600, color: "var(--code-muted)", textTransform: "uppercase" as const, letterSpacing: ".08em" }}>
                                    Stack trace
                                </div>
                                <pre style={{ maxHeight: 600, overflow: "auto", padding: 20, fontFamily: "ui-monospace,monospace", fontSize: 11, lineHeight: 1.75, color: "var(--code-text)", margin: 0 }}>
                                    {stack || "—"}
                                </pre>
                            </div>
                    )}

                </main>
            </div>
        </div>
    );
}
