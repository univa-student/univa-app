import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useState } from "react"
import usePageTitle from "@/shared/hooks/usePageTitle"
import { GOOGLE_FONTS_URL } from "@/app/config/app.config.ts"
import logoConfig from "@/app/config/logo.config"
import { Button } from "@/shared/shadcn/ui/button"
import {
    CodeIcon, KeyIcon, ZapIcon,
    CopyIcon, CheckIcon, ChevronDownIcon, ServerIcon, LockIcon,
    GlobeIcon, TerminalIcon,
} from "lucide-react"
import { LandingFooter } from "@/widgets/landing"

const T = {
    bg: "#09090f", card: "#0f0f1a", border: "#1c1c28",
    text: "#f1f0ee", muted: "#52525b", accent: "#6d28d9",
    accentSoft: "rgba(109,40,217,0.12)", green: "#059669",
    blue: "#0284c7", orange: "#d97706", red: "#dc2626",
}

const endpoints = [
    {
        method: "GET", path: "/v1/schedule", color: T.blue,
        desc: "Отримати розклад поточного користувача",
        response: `{\n  "data": [\n    {\n      "id": "cls_01",\n      "subject": "Алгоритми",\n      "time": "08:30",\n      "room": "301"\n    }\n  ]\n}`,
    },
    {
        method: "POST", path: "/v1/tasks", color: T.green,
        desc: "Створити нове завдання / дедлайн",
        response: `{\n  "data": {\n    "id": "task_01",\n    "title": "Здати курсову",\n    "due": "2026-06-01T23:59:00Z",\n    "done": false\n  }\n}`,
    },
    {
        method: "GET", path: "/v1/files", color: T.blue,
        desc: "Список файлів у сховищі",
        response: `{\n  "data": [],\n  "meta": { "total": 0, "page": 1 }\n}`,
    },
    {
        method: "POST", path: "/v1/ai/ask", color: T.orange,
        desc: "Поставити запитання AI-помічнику",
        response: `{\n  "answer": "...",\n  "tokens_used": 312\n}`,
    },
    {
        method: "DELETE", path: "/v1/tasks/:id", color: T.red,
        desc: "Видалити завдання за ID",
        response: `{\n  "deleted": true\n}`,
    },
]

const sdks = [
    { lang: "JavaScript", color: "#f7df1e", bg: "#1a1a00", snippet: `import { UnivaClient } from "@univa/sdk"\n\nconst client = new UnivaClient({ apiKey: "your_key" })\nconst schedule = await client.schedule.list()` },
    { lang: "Python", color: "#3572a5", bg: "#001020", snippet: `from univa import UnivaClient\n\nclient = UnivaClient(api_key="your_key")\nschedule = client.schedule.list()` },
    { lang: "cURL", color: "#52525b", bg: "#0a0a0a", snippet: `curl https://api.univa.app/v1/schedule \\\n  -H "Authorization: Bearer your_key" \\\n  -H "Content-Type: application/json"` },
]

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false)
    return (
        <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", fontSize: 11, color: copied ? "#34d399" : "rgba(255,255,255,0.4)", cursor: "pointer", fontFamily: "inherit", transition: "all 0.18s" }}>
            {copied ? <CheckIcon size={11} /> : <CopyIcon size={11} />}
            {copied ? "Скопійовано" : "Копіювати"}
        </button>
    )
}

export function ApiPage() {
    usePageTitle("API — Univa")
    const [activeSdk, setActiveSdk] = useState(0)
    const [openEndpoint, setOpenEndpoint] = useState<number | null>(0)

    return (
        <div style={{ background: T.bg, minHeight: "100vh", color: T.text, fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`
                @import url('${GOOGLE_FONTS_URL}');
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700;9..40,800&family=DM+Mono:wght@400;500&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                .mono { font-family: 'DM Mono', monospace; }
                .serif { font-family: 'DM Serif Display', serif; }
                .ep-row { transition: background 0.18s; cursor: pointer; }
                .ep-row:hover { background: rgba(255,255,255,0.02); }
            `}</style>

            {/* Nav */}
            <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(9,9,15,0.97)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex h-16 items-center justify-between px-6" style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <Link to="/"><img src={logoConfig['full-logo-white-no-bg']} alt="Univa" style={{ height: 28 }} /></Link>
                        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)" }} />
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>API Reference</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" asChild className="text-white/40 hover:text-white hover:bg-white/5">
                            <Link to="/">← Головна</Link>
                        </Button>
                        <Button size="sm" asChild style={{ background: "linear-gradient(135deg,#6d28d9,#5b21b6)", border: "none", borderRadius: 8, fontWeight: 600 }}>
                            <Link to="/dashboard">Отримати ключ <KeyIcon className="size-3.5 ml-1.5" /></Link>
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section style={{ padding: "80px 24px 64px", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(109,40,217,0.12) 0%, transparent 65%)" }} />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 640, margin: "0 auto", textAlign: "center", position: "relative" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 14px", borderRadius: 100, background: "rgba(109,40,217,0.12)", border: "1px solid rgba(109,40,217,0.28)", fontSize: 11, fontWeight: 700, color: "#a78bfa", marginBottom: 22, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        <TerminalIcon size={11} /> REST API v1
                    </div>
                    <h1 style={{ fontSize: "clamp(36px,5vw,60px)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 18, lineHeight: 1.08 }}>
                        Будуй на базі Univa
                    </h1>
                    <p style={{ fontSize: 16, lineHeight: 1.75, color: "rgba(255,255,255,0.4)", marginBottom: 32 }}>
                        Повний REST API з автентифікацією через Bearer token. Інтегруй розклад, файли, AI та завдання у власні продукти.
                    </p>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                        {[{ icon: ZapIcon, label: "1000 req/хв" }, { icon: LockIcon, label: "OAuth 2.0" }, { icon: GlobeIcon, label: "REST + Webhooks" }].map(b => (
                            <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 100, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                                <b.icon size={12} style={{ color: "#a78bfa" }} /> {b.label}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </section>

            <div style={{ maxWidth: 1000, margin: "0 auto", padding: "60px 24px 100px" }}>

                {/* Base URL */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            style={{ padding: "18px 24px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: T.card, marginBottom: 48, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                    <div>
                        <div style={{ fontSize: 11, color: T.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Base URL</div>
                        <code className="mono" style={{ fontSize: 15, color: "#a78bfa" }}>https://api.univa.app/v1</code>
                    </div>
                    <CopyButton text="https://api.univa.app/v1" />
                </motion.div>

                {/* Auth */}
                <motion.section initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 56 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                        <KeyIcon size={16} style={{ color: "#a78bfa" }} />
                        <h2 style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.02em" }}>Автентифікація</h2>
                    </div>
                    <div style={{ padding: 24, borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", background: T.card, marginBottom: 16 }}>
                        <p style={{ fontSize: 14, lineHeight: 1.75, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>
                            Передавай API ключ у заголовку <code className="mono" style={{ color: "#a78bfa", fontSize: 13 }}>Authorization</code>:
                        </p>
                        <div style={{ position: "relative" }}>
                            <pre className="mono" style={{ padding: "16px 20px", borderRadius: 10, background: "#0a0a0f", border: "1px solid rgba(255,255,255,0.06)", fontSize: 13, color: "#34d399", overflowX: "auto", lineHeight: 1.7 }}>
{`Authorization: Bearer univa_live_xxxxxxxxxxxxxxxx`}
                            </pre>
                            <div style={{ position: "absolute", top: 10, right: 12 }}>
                                <CopyButton text="Authorization: Bearer univa_live_xxxxxxxxxxxxxxxx" />
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Endpoints */}
                <motion.section initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 56 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                        <ServerIcon size={16} style={{ color: "#a78bfa" }} />
                        <h2 style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.02em" }}>Endpoints</h2>
                    </div>
                    <div style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
                        {endpoints.map((ep, i) => (
                            <div key={i}>
                                <div className="ep-row" onClick={() => setOpenEndpoint(openEndpoint === i ? null : i)}
                                     style={{ padding: "16px 24px", borderBottom: i < endpoints.length - 1 || openEndpoint === i ? "1px solid rgba(255,255,255,0.05)" : "none", display: "flex", alignItems: "center", gap: 16, background: openEndpoint === i ? "rgba(255,255,255,0.02)" : T.card }}>
                                    <span className="mono" style={{ fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 6, background: `${ep.color}18`, color: ep.color, minWidth: 52, textAlign: "center" }}>{ep.method}</span>
                                    <code className="mono" style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", flex: 1 }}>{ep.path}</code>
                                    <span style={{ fontSize: 12, color: T.muted, flex: 2 }}>{ep.desc}</span>
                                    <motion.div animate={{ rotate: openEndpoint === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                        <ChevronDownIcon size={14} style={{ color: T.muted }} />
                                    </motion.div>
                                </div>
                                {openEndpoint === i && (
                                    <div style={{ padding: "16px 24px", background: "#0a0a0f", borderBottom: i < endpoints.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                                        <div style={{ fontSize: 11, color: T.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Response 200</div>
                                        <pre className="mono" style={{ fontSize: 12, color: "#34d399", lineHeight: 1.7, overflowX: "auto" }}>{ep.response}</pre>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* SDKs */}
                <motion.section initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 56 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                        <CodeIcon size={16} style={{ color: "#a78bfa" }} />
                        <h2 style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.02em" }}>SDK та приклади</h2>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                        {sdks.map((sdk, i) => (
                            <button key={sdk.lang} onClick={() => setActiveSdk(i)}
                                    style={{ padding: "7px 16px", borderRadius: 8, border: `1px solid ${activeSdk === i ? "rgba(109,40,217,0.4)" : "rgba(255,255,255,0.08)"}`, background: activeSdk === i ? "rgba(109,40,217,0.12)" : T.card, fontSize: 13, fontWeight: activeSdk === i ? 600 : 400, color: activeSdk === i ? "#a78bfa" : T.muted, cursor: "pointer", fontFamily: "inherit", transition: "all 0.18s" }}>
                                {sdk.lang}
                            </button>
                        ))}
                    </div>
                    <div style={{ position: "relative", borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: sdks[activeSdk].bg, padding: "20px 24px" }}>
                        <div style={{ position: "absolute", top: 12, right: 14 }}>
                            <CopyButton text={sdks[activeSdk].snippet} />
                        </div>
                        <pre className="mono" style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.75, overflowX: "auto" }}>{sdks[activeSdk].snippet}</pre>
                    </div>
                </motion.section>

                {/* Rate limits */}
                <motion.section initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <div style={{ padding: "28px 32px", borderRadius: 16, border: "1px solid rgba(109,40,217,0.2)", background: "rgba(109,40,217,0.06)" }}>
                        <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Rate Limits</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
                            {[
                                { plan: "Free", limit: "100 req/хв", color: T.muted },
                                { plan: "Pro", limit: "1 000 req/хв", color: "#a78bfa" },
                                { plan: "Team", limit: "10 000 req/хв", color: T.green },
                            ].map(r => (
                                <div key={r.plan} style={{ padding: "14px 18px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                    <div style={{ fontSize: 11, color: T.muted, marginBottom: 4 }}>{r.plan}</div>
                                    <div className="mono" style={{ fontSize: 18, fontWeight: 500, color: r.color }}>{r.limit}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.section>
            </div>

            <LandingFooter />
        </div>
    )
}