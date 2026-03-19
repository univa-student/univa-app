import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import usePageTitle from "@/shared/hooks/usePageTitle"
import { GOOGLE_FONTS_URL } from "@/app/config/app.config.ts"
import logoConfig from "@/app/config/logo.config"
import { Button } from "@/shared/shadcn/ui/button"
import {
    CheckCircleIcon, AlertTriangleIcon, XCircleIcon, ClockIcon,
    RefreshCwIcon, BellIcon, ChevronDownIcon, ActivityIcon,
    ServerIcon, BrainIcon, FolderIcon, CalendarIcon,
    MessageCircleIcon, ShieldCheckIcon, PlugIcon, ArrowRightIcon,
} from "lucide-react"

// ─── Tokens ───────────────────────────────────────────────────────────────────
const T = {
    bg: "#f5f4f0",
    card: "#ffffff",
    text: "#0d0d12",
    muted: "#71717a",
    border: "#e4e2dc",
    dark: "#09090f",
    darkCard: "#111118",
    darkBorder: "#1c1c28",
    green: "#059669",
    greenBg: "#dcfce7",
    greenBorder: "#86efac",
    yellow: "#d97706",
    yellowBg: "#fef9c3",
    yellowBorder: "#fde047",
    red: "#dc2626",
    redBg: "#fee2e2",
    redBorder: "#fca5a5",
    blue: "#0284c7",
    blueBg: "#e0f2fe",
    accent: "#6d28d9",
    accentBg: "#ede9fe",
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Status = "operational" | "degraded" | "outage" | "maintenance"
type IncidentStatus = "resolved" | "monitoring" | "investigating" | "identified"

// ─── Mock data ────────────────────────────────────────────────────────────────
const services = [
    {
        id: "api", name: "API", icon: ServerIcon, color: T.blue,
        status: "operational" as Status,
        uptime: 99.97, latency: 142,
        history: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0.9,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    },
    {
        id: "ai", name: "AI-помічник", icon: BrainIcon, color: T.accent,
        status: "operational" as Status,
        uptime: 99.85, latency: 890,
        history: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0.5,0.5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    },
    {
        id: "storage", name: "Файлове сховище", icon: FolderIcon, color: "#059669",
        status: "operational" as Status,
        uptime: 99.99, latency: 68,
        history: Array(90).fill(1),
    },
    {
        id: "schedule", name: "Розклад", icon: CalendarIcon, color: "#0d9488",
        status: "operational" as Status,
        uptime: 100, latency: 55,
        history: Array(90).fill(1),
    },
    {
        id: "chat", name: "Групові чати", icon: MessageCircleIcon, color: "#db2777",
        status: "degraded" as Status,
        uptime: 98.72, latency: 310,
        history: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0.4,0.4,0.4],
    },
    {
        id: "auth", name: "Автентифікація", icon: ShieldCheckIcon, color: "#0284c7",
        status: "operational" as Status,
        uptime: 100, latency: 89,
        history: Array(90).fill(1),
    },
    {
        id: "integrations", name: "Інтеграції", icon: PlugIcon, color: "#d97706",
        status: "operational" as Status,
        uptime: 99.61, latency: 220,
        history: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    },
]

const incidents = [
    {
        id: 1,
        title: "Підвищена затримка в груповому чаті",
        status: "investigating" as IncidentStatus,
        severity: "degraded" as Status,
        affectedServices: ["Групові чати"],
        startedAt: "Сьогодні о 14:32",
        updates: [
            { time: "15:10", text: "Команда інфраструктури виявила першопричину — перевантаження одного з WebSocket-серверів. Працюємо над розв'язанням." },
            { time: "14:45", text: "Підтверджено підвищену затримку в чатах. Проблема не впливає на доставку повідомлень — лише на швидкість." },
            { time: "14:32", text: "Отримали перші репорти від користувачів щодо повільного завантаження чатів. Починаємо дослідження." },
        ],
    },
    {
        id: 2,
        title: "Тимчасова недоступність AI-помічника",
        status: "resolved" as IncidentStatus,
        severity: "degraded" as Status,
        affectedServices: ["AI-помічник"],
        startedAt: "3 дні тому о 09:15",
        resolvedAt: "3 дні тому о 11:42",
        updates: [
            { time: "11:42", text: "Проблему вирішено. Всі запити до AI обробляються в нормальному режимі. Дякуємо за терпіння." },
            { time: "10:30", text: "Ідентифіковано причину — збій у хмарного провайдера. Перенаправляємо трафік на резервний кластер." },
            { time: "09:15", text: "Фіксуємо часткову недоступність AI-функцій. Розслідування розпочато." },
        ],
    },
]

const statusConfig: Record<Status, { label: string; color: string; bg: string; border: string; icon: any }> = {
    operational: { label: "Працює", color: T.green, bg: T.greenBg, border: T.greenBorder, icon: CheckCircleIcon },
    degraded: { label: "Знижена продуктивність", color: T.yellow, bg: T.yellowBg, border: T.yellowBorder, icon: AlertTriangleIcon },
    outage: { label: "Недоступно", color: T.red, bg: T.redBg, border: T.redBorder, icon: XCircleIcon },
    maintenance: { label: "Технічні роботи", color: T.blue, bg: T.blueBg, border: "#93c5fd", icon: ClockIcon },
}

const incidentStatusConfig: Record<IncidentStatus, { label: string; color: string; bg: string }> = {
    investigating: { label: "Розслідується", color: T.red, bg: T.redBg },
    identified: { label: "Ідентифіковано", color: T.yellow, bg: T.yellowBg },
    monitoring: { label: "Моніторинг", color: T.blue, bg: T.blueBg },
    resolved: { label: "Вирішено", color: T.green, bg: T.greenBg },
}

// ─── Uptime bar ───────────────────────────────────────────────────────────────
function UptimeBar({ history }: { history: number[] }) {
    return (
        <div style={{ display: "flex", gap: 2, alignItems: "center", height: 28 }}>
            {history.map((val, i) => (
                <div key={i} style={{
                    flex: 1, height: val === 1 ? 20 : val >= 0.5 ? 14 : 8,
                    borderRadius: 3,
                    background: val === 1 ? T.green : val >= 0.5 ? T.yellow : T.red,
                    opacity: val === 1 ? 0.7 : 1,
                    transition: "height 0.2s",
                }} title={val === 1 ? "Operational" : val >= 0.5 ? "Degraded" : "Outage"} />
            ))}
        </div>
    )
}

// ─── Component ────────────────────────────────────────────────────────────────
export function StatusPage() {
    usePageTitle("Статус системи — Univa")
    const [expandedIncident, setExpandedIncident] = useState<number | null>(1)
    const [email, setEmail] = useState("")
    const [subscribed, setSubscribed] = useState(false)
    const [lastUpdated, setLastUpdated] = useState(new Date())
    const [refreshing, setRefreshing] = useState(false)

    const overallStatus: Status = services.some(s => s.status === "outage")
        ? "outage"
        : services.some(s => s.status === "degraded")
            ? "degraded"
            : services.some(s => s.status === "maintenance")
                ? "maintenance"
                : "operational"

    const overall = statusConfig[overallStatus]
    const activeIncidents = incidents.filter(i => i.status !== "resolved")

    function handleRefresh() {
        setRefreshing(true)
        setTimeout(() => { setLastUpdated(new Date()); setRefreshing(false) }, 800)
    }

    function handleSubscribe(e: React.FormEvent) {
        e.preventDefault()
        if (email) setSubscribed(true)
    }

    return (
        <div style={{ background: T.bg, minHeight: "100vh", color: T.text, fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`
                @import url('${GOOGLE_FONTS_URL}');
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,700;9..40,800&family=DM+Mono:wght@400;500&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                .mono { font-family: 'DM Mono', monospace; }
                .service-row { transition: background 0.18s ease; }
                .service-row:hover { background: rgba(109,40,217,0.02); }
                .incident-row { transition: background 0.18s ease; cursor: pointer; }
                .incident-row:hover { background: rgba(0,0,0,0.01); }
                input:focus { outline: none; border-color: rgba(109,40,217,0.4) !important; box-shadow: 0 0 0 3px rgba(109,40,217,0.08); }
                @keyframes pulse-dot { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.85); } }
                .pulse { animation: pulse-dot 2s ease-in-out infinite; }
            `}</style>

            {/* ── Nav ── */}
            <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(9,9,15,0.96)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex h-16 items-center justify-between px-6" style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <Link to="/" style={{ textDecoration: "none" }}>
                            <img src={logoConfig['full-logo-white-no-bg']} alt="Univa" style={{ height: 28 }} />
                        </Link>
                        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)" }} />
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>Статус системи</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={handleRefresh} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", fontSize: 12, color: "rgba(255,255,255,0.5)", cursor: "pointer", fontFamily: "inherit", transition: "all 0.18s" }}>
                            <RefreshCwIcon size={13} style={{ transition: "transform 0.6s", transform: refreshing ? "rotate(360deg)" : "rotate(0deg)" }} />
                            Оновити
                        </button>
                        <Button size="sm" asChild style={{ background: "linear-gradient(135deg,#6d28d9,#5b21b6)", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 13 }}>
                            <Link to="/dashboard">Відкрити Univa <ArrowRightIcon className="size-3 ml-1" /></Link>
                        </Button>
                    </div>
                </div>
            </nav>

            <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px 100px" }}>

                {/* ── Overall status banner ── */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                            style={{ padding: "28px 32px", borderRadius: 20, border: `1px solid ${overall.border}`, background: overall.bg, marginBottom: 40, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ position: "relative" }}>
                            <div className="pulse" style={{ width: 14, height: 14, borderRadius: "50%", background: overall.color }} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: 20, color: overall.color, letterSpacing: "-0.02em" }}>
                                {overallStatus === "operational" ? "Всі системи працюють штатно" :
                                    overallStatus === "degraded" ? "Часткові перебої в роботі" :
                                        overallStatus === "outage" ? "Критичні збої системи" : "Технічне обслуговування"}
                            </div>
                            <div style={{ fontSize: 12, color: overall.color, opacity: 0.7, marginTop: 2 }}>
                                Оновлено: {lastUpdated.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })} · {lastUpdated.toLocaleDateString("uk-UA", { day: "numeric", month: "long" })}
                            </div>
                        </div>
                    </div>
                    {activeIncidents.length > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 100, background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.2)", fontSize: 12, fontWeight: 600, color: T.red }}>
                            <AlertTriangleIcon size={12} /> {activeIncidents.length} активний інцидент
                        </div>
                    )}
                </motion.div>

                {/* ── Active incident alert ── */}
                <AnimatePresence>
                    {activeIncidents.map(inc => (
                        <motion.div key={inc.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                    style={{ padding: "16px 20px", borderRadius: 14, border: `1px solid ${T.yellowBorder}`, background: T.yellowBg, marginBottom: 16, display: "flex", alignItems: "flex-start", gap: 12 }}>
                            <AlertTriangleIcon size={16} style={{ color: T.yellow, flexShrink: 0, marginTop: 1 }} />
                            <div>
                                <span style={{ fontWeight: 600, fontSize: 14, color: T.yellow }}>{inc.title}</span>
                                <span style={{ fontSize: 13, color: T.muted, marginLeft: 8 }}>— {inc.startedAt}</span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* ── Services ── */}
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                                style={{ background: T.card, borderRadius: 20, border: `1px solid ${T.border}`, overflow: "hidden", marginBottom: 32 }}>
                    <div style={{ padding: "20px 28px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <ActivityIcon size={16} style={{ color: T.muted }} />
                            <span style={{ fontWeight: 700, fontSize: 15, color: T.text }}>Сервіси</span>
                        </div>
                        <span style={{ fontSize: 12, color: T.muted }}>Uptime за 90 днів</span>
                    </div>

                    {services.map((svc, i) => {
                        const cfg = statusConfig[svc.status]
                        const StatusIcon = cfg.icon
                        return (
                            <div key={svc.id} className="service-row"
                                 style={{ padding: "18px 28px", borderBottom: i < services.length - 1 ? `1px solid ${T.border}` : "none" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <div style={{ width: 32, height: 32, borderRadius: 9, background: `${svc.color}12`, border: `1px solid ${svc.color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <svc.icon size={15} style={{ color: svc.color }} />
                                        </div>
                                        <span style={{ fontWeight: 600, fontSize: 14, color: T.text }}>{svc.name}</span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                                        <div className="mono" style={{ fontSize: 11, color: T.muted }}>
                                            {svc.latency}ms
                                        </div>
                                        <div className="mono" style={{ fontSize: 11, color: T.muted }}>
                                            {svc.uptime}%
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 100, background: cfg.bg, border: `1px solid ${cfg.border}`, fontSize: 11, fontWeight: 600, color: cfg.color }}>
                                            <StatusIcon size={11} /> {cfg.label}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <span style={{ fontSize: 10, color: T.muted, whiteSpace: "nowrap" }}>90 дн. тому</span>
                                    <div style={{ flex: 1 }}>
                                        <UptimeBar history={svc.history} />
                                    </div>
                                    <span style={{ fontSize: 10, color: T.muted, whiteSpace: "nowrap" }}>Сьогодні</span>
                                </div>
                            </div>
                        )
                    })}
                </motion.section>

                {/* ── Uptime summary ── */}
                <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 32 }}>
                    {[
                        { label: "Загальний uptime", value: "99.87%", sub: "за 90 днів", color: T.green },
                        { label: "Середня затримка", value: "253ms", sub: "за 24 год", color: T.blue },
                        { label: "Інциденти", value: "3", sub: "за 90 днів", color: T.yellow },
                        { label: "MTTR", value: "1.8 год", sub: "середній час відновлення", color: T.accent },
                    ].map(s => (
                        <div key={s.label} style={{ padding: "20px", borderRadius: 14, border: `1px solid ${T.border}`, background: T.card, textAlign: "center" }}>
                            <div className="mono" style={{ fontSize: 26, fontWeight: 500, color: s.color, letterSpacing: "-0.03em", marginBottom: 4 }}>{s.value}</div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 2 }}>{s.label}</div>
                            <div style={{ fontSize: 11, color: T.muted }}>{s.sub}</div>
                        </div>
                    ))}
                </motion.div>

                {/* ── Incidents ── */}
                <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                                style={{ background: T.card, borderRadius: 20, border: `1px solid ${T.border}`, overflow: "hidden", marginBottom: 32 }}>
                    <div style={{ padding: "20px 28px", borderBottom: `1px solid ${T.border}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <ClockIcon size={16} style={{ color: T.muted }} />
                            <span style={{ fontWeight: 700, fontSize: 15, color: T.text }}>Історія інцидентів</span>
                        </div>
                    </div>

                    {incidents.map((inc, i) => {
                        const cfg = incidentStatusConfig[inc.status]
                        const isOpen = expandedIncident === inc.id
                        return (
                            <div key={inc.id} style={{ borderBottom: i < incidents.length - 1 ? `1px solid ${T.border}` : "none" }}>
                                <div className="incident-row" onClick={() => setExpandedIncident(isOpen ? null : inc.id)}
                                     style={{ padding: "20px 28px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                                            <span style={{ fontWeight: 600, fontSize: 15, color: T.text }}>{inc.title}</span>
                                            <div style={{ padding: "2px 9px", borderRadius: 100, background: cfg.bg, fontSize: 11, fontWeight: 700, color: cfg.color }}>{cfg.label}</div>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                                            <span style={{ fontSize: 12, color: T.muted }}>{inc.startedAt}</span>
                                            {inc.resolvedAt && <span style={{ fontSize: 12, color: T.green }}>✓ {inc.resolvedAt}</span>}
                                            {inc.affectedServices.map(s => (
                                                <span key={s} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 100, background: T.border, color: T.muted }}>{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ flexShrink: 0 }}>
                                        <ChevronDownIcon size={16} style={{ color: T.muted }} />
                                    </motion.div>
                                </div>

                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}
                                                    style={{ overflow: "hidden" }}>
                                            <div style={{ padding: "0 28px 24px 28px" }}>
                                                <div style={{ borderLeft: `2px solid ${T.border}`, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                                                    {inc.updates.map((upd, j) => (
                                                        <div key={j} style={{ position: "relative" }}>
                                                            <div style={{ position: "absolute", left: -26, top: 4, width: 8, height: 8, borderRadius: "50%", background: j === 0 ? statusConfig[inc.severity].color : T.border, border: `2px solid ${T.card}` }} />
                                                            <div className="mono" style={{ fontSize: 11, color: T.muted, marginBottom: 3 }}>{upd.time}</div>
                                                            <div style={{ fontSize: 13, lineHeight: 1.65, color: T.text }}>{upd.text}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )
                    })}
                </motion.section>

                {/* ── Subscribe ── */}
                <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                                style={{ background: T.dark, borderRadius: 20, padding: "36px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32, flexWrap: "wrap" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(109,40,217,0.2)", border: "1px solid rgba(109,40,217,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <BellIcon size={16} style={{ color: "#a78bfa" }} />
                            </div>
                            <span style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>Підпишись на оновлення</span>
                        </div>
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", maxWidth: 300, lineHeight: 1.6 }}>
                            Отримуй email-сповіщення про інциденти та технічні роботи.
                        </p>
                    </div>

                    {subscribed ? (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", borderRadius: 12, background: "rgba(5,150,105,0.12)", border: "1px solid rgba(5,150,105,0.25)", fontSize: 14, fontWeight: 600, color: "#34d399" }}>
                            <CheckCircleIcon size={16} /> Підписку оформлено!
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubscribe} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <input
                                type="email" value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="твій@email.com" required
                                style={{ padding: "11px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)", fontSize: 14, color: "#fff", fontFamily: "inherit", minWidth: 220, transition: "all 0.2s" }}
                            />
                            <Button type="submit" style={{ background: "linear-gradient(135deg,#6d28d9,#5b21b6)", border: "none", borderRadius: 10, padding: "11px 22px", fontWeight: 600, fontSize: 14 }}>
                                Підписатись
                            </Button>
                        </form>
                    )}
                </motion.section>

                {/* ── Footer note ── */}
                <div style={{ textAlign: "center", marginTop: 40, fontSize: 12, color: T.muted }}>
                    Є проблема? <a href="mailto:support@univa.app" style={{ color: T.accent, textDecoration: "none", fontWeight: 500 }}>Напиши нам →</a>
                    <span style={{ margin: "0 12px", opacity: 0.4 }}>·</span>
                    Сторінка оновлюється автоматично кожні 60 секунд
                </div>
            </div>
        </div>
    )
}