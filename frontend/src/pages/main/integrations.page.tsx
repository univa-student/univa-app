import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import usePageTitle from "@/shared/hooks/usePageTitle"
import { GOOGLE_FONTS_URL } from "@/app/config/app.config.ts"
import logoConfig from "@/app/config/logo.config"
import { Button } from "@/shared/shadcn/ui/button"
import {
    ArrowRightIcon, ZapIcon, CheckCircleIcon, ChevronDownIcon,
    PlugIcon, SearchIcon, ShieldCheckIcon,
} from "lucide-react"
import { LandingFooter } from "@/widgets/landing"

// ─── Tokens ───────────────────────────────────────────────────────────────────
const T = {
    bg: "#f5f4f0",
    card: "#ffffff",
    text: "#0d0d12",
    muted: "#71717a",
    border: "#e4e2dc",
    accent: "#6d28d9",
    accentSoft: "#ede9fe",
    dark: "#09090f",
    darkCard: "#111118",
    darkBorder: "#1c1c28",
    darkMuted: "#52525b",
    green: "#059669",
    blue: "#0284c7",
    orange: "#d97706",
    red: "#dc2626",
    teal: "#0d9488",
    pink: "#db2777",
}

// ─── Integrations data ────────────────────────────────────────────────────────
const integrations = [
    {
        id: "google-calendar",
        name: "Google Calendar",
        category: "Розклад",
        desc: "Автоматично синхронізуй пари, дедлайни та події між Univa і Google Calendar.",
        color: "#0284c7",
        bg: "#e0f2fe",
        status: "available",
        icon: () => (
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
                <rect x="3" y="4" width="18" height="17" rx="2" fill="#fff" stroke="#0284c7" strokeWidth="1.5"/>
                <path d="M3 9h18" stroke="#0284c7" strokeWidth="1.5"/>
                <path d="M8 2v4M16 2v4" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round"/>
                <rect x="7" y="13" width="4" height="3" rx="1" fill="#0284c7" opacity="0.6"/>
                <rect x="13" y="13" width="4" height="3" rx="1" fill="#0284c7" opacity="0.3"/>
            </svg>
        ),
        features: ["Двостороння синхронізація", "Авто-імпорт розкладу", "Нагадування в обох системах"],
    },
    {
        id: "moodle",
        name: "Moodle",
        category: "Навчання",
        desc: "Підключи університетський Moodle та отримуй завдання, оцінки і матеріали прямо в Univa.",
        color: "#d97706",
        bg: "#fef3c7",
        status: "available",
        icon: () => (
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
                <path d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9z" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5"/>
                <path d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4z" fill="#d97706" opacity="0.3"/>
                <circle cx="12" cy="12" r="2" fill="#d97706"/>
            </svg>
        ),
        features: ["Імпорт завдань і дедлайнів", "Синхронізація оцінок", "Завантаження матеріалів"],
    },
    {
        id: "telegram",
        name: "Telegram",
        category: "Сповіщення",
        desc: "Отримуй персональні сповіщення про дедлайни, нові повідомлення та зміни розкладу у Telegram.",
        color: "#0284c7",
        bg: "#e0f2fe",
        status: "available",
        icon: () => (
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
                <circle cx="12" cy="12" r="9" fill="#0284c7" opacity="0.1" stroke="#0284c7" strokeWidth="1.5"/>
                <path d="M6 12l3 3 6-6" stroke="#0284c7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 10l2 1M10 16l1 2" stroke="#0284c7" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
            </svg>
        ),
        features: ["Push-сповіщення", "Бот для швидких дій", "Особистий та груповий режим"],
    },
    {
        id: "google-drive",
        name: "Google Drive",
        category: "Файли",
        desc: "Імпортуй файли з Google Drive або зберігай матеріали Univa прямо у своє хмарне сховище.",
        color: "#059669",
        bg: "#d1fae5",
        status: "available",
        icon: () => (
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
                <path d="M12 4L4 18h16L12 4z" fill="#d1fae5" stroke="#059669" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M4 18h16" stroke="#059669" strokeWidth="1.5"/>
                <path d="M8 11h8" stroke="#059669" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
            </svg>
        ),
        features: ["Двосторонній імпорт/експорт", "Авто-бекап файлів", "Спільний доступ до папок"],
    },
    {
        id: "microsoft-teams",
        name: "Microsoft Teams",
        category: "Комунікація",
        desc: "Синхронізуй університетські канали Teams з груповими чатами Univa.",
        color: "#6d28d9",
        bg: "#ede9fe",
        status: "soon",
        icon: () => (
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
                <rect x="3" y="8" width="13" height="10" rx="2" fill="#ede9fe" stroke="#6d28d9" strokeWidth="1.5"/>
                <circle cx="17" cy="7" r="3" fill="#6d28d9" opacity="0.2" stroke="#6d28d9" strokeWidth="1.5"/>
                <path d="M16 18v-4a2 2 0 012-2h2" stroke="#6d28d9" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
            </svg>
        ),
        features: ["Синхронізація чатів", "Спільні файли", "Єдині сповіщення"],
    },
    {
        id: "notion",
        name: "Notion",
        category: "Нотатки",
        desc: "Підключи Notion workspace та перенось нотатки і конспекти між платформами.",
        color: "#0d0d12",
        bg: "#f4f4f5",
        status: "soon",
        icon: () => (
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
                <rect x="4" y="3" width="16" height="18" rx="2" fill="#f4f4f5" stroke="#0d0d12" strokeWidth="1.5"/>
                <path d="M8 8h8M8 12h5M8 16h6" stroke="#0d0d12" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
            </svg>
        ),
        features: ["Імпорт/експорт сторінок", "Синхронізація баз даних", "Спільні шаблони"],
    },
    {
        id: "slack",
        name: "Slack",
        category: "Комунікація",
        desc: "Отримуй сповіщення Univa у Slack-каналах своєї команди або студентської групи.",
        color: "#db2777",
        bg: "#fce7f3",
        status: "soon",
        icon: () => (
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
                <rect x="3" y="10" width="5" height="5" rx="1.5" fill="#fce7f3" stroke="#db2777" strokeWidth="1.5"/>
                <rect x="10" y="3" width="5" height="5" rx="1.5" fill="#db2777" opacity="0.3" stroke="#db2777" strokeWidth="1.5"/>
                <rect x="16" y="10" width="5" height="5" rx="1.5" fill="#fce7f3" stroke="#db2777" strokeWidth="1.5"/>
                <rect x="10" y="16" width="5" height="5" rx="1.5" fill="#db2777" opacity="0.5" stroke="#db2777" strokeWidth="1.5"/>
            </svg>
        ),
        features: ["Webhook-сповіщення", "Командні канали", "Slash-команди"],
    },
    {
        id: "api",
        name: "Відкритий API",
        category: "Розробникам",
        desc: "Будуй власні інтеграції за допомогою REST API Univa. Повна документація та SDK.",
        color: "#0d9488",
        bg: "#ccfbf1",
        status: "available",
        icon: () => (
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
                <path d="M8 6l-4 6 4 6M16 6l4 6-4 6" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 4l-4 16" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
            </svg>
        ),
        features: ["REST API + Webhooks", "OAuth 2.0 автентифікація", "Rate limit: 1000 req/хв"],
    },
]

const steps = [
    { step: "01", icon: SearchIcon, title: "Обери інтеграцію", desc: "Знайди потрібний сервіс у каталозі або скористайся пошуком.", color: T.blue },
    { step: "02", icon: ShieldCheckIcon, title: "Авторизуй доступ", desc: "Безпечна OAuth-авторизація — ми ніколи не зберігаємо твої паролі.", color: T.green },
    { step: "03", icon: ZapIcon, title: "Налаштуй синхронізацію", desc: "Вибери що і куди синхронізувати. Зміни набудуть чинності одразу.", color: T.accent },
]

const faqs = [
    { q: "Чи безпечні інтеграції?", a: "Так. Ми використовуємо OAuth 2.0 для авторизації та ніколи не зберігаємо паролі від сторонніх сервісів. Усі з'єднання шифруються TLS 1.3." },
    { q: "Чи можу я відключити інтеграцію у будь-який момент?", a: "Звісно. В налаштуваннях акаунту можна відключити будь-яку інтеграцію одним кліком. Усі збережені дані залишаться в Univa." },
    { q: "Інтеграції доступні на всіх планах?", a: "Базові інтеграції (Google Calendar, Telegram) доступні безкоштовно. Розширені (Moodle, Microsoft Teams) — на планах Pro та Team." },
    { q: "Мій університет використовує власну систему. Чи є API?", a: "Так! Відкритий REST API дозволяє підключити будь-яку систему. Для університетів надаємо безкоштовне enterprise-підключення — напиши нам." },
    { q: "Як часто відбувається синхронізація?", a: "Залежно від інтеграції: Google Calendar — в реальному часі, Moodle — кожні 15 хв, файли — при зміні. Частоту можна налаштувати вручну." },
]

const categories = ["Всі", "Розклад", "Навчання", "Файли", "Сповіщення", "Комунікація", "Нотатки", "Розробникам"]

// ─── Component ────────────────────────────────────────────────────────────────
export function IntegrationsPage() {
    usePageTitle("Інтеграції — Univa")
    const [activeCategory, setActiveCategory] = useState("Всі")
    const [openFaq, setOpenFaq] = useState<number | null>(null)
    const [search, setSearch] = useState("")

    const filtered = integrations.filter(i => {
        const matchCat = activeCategory === "Всі" || i.category === activeCategory
        const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) || i.desc.toLowerCase().includes(search.toLowerCase())
        return matchCat && matchSearch
    })

    const available = integrations.filter(i => i.status === "available").length
    const soon = integrations.filter(i => i.status === "soon").length

    return (
        <div style={{ background: T.bg, minHeight: "100vh", color: T.text, fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`
                @import url('${GOOGLE_FONTS_URL}');
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,700;9..40,800&family=DM+Serif+Display:ital@0;1&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                .serif { font-family: 'DM Serif Display', serif; }
                .int-card { transition: all 0.22s ease; }
                .int-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.09); border-color: rgba(109,40,217,0.2) !important; }
                .cat-pill { transition: all 0.18s ease; cursor: pointer; }
                .faq-item { transition: background 0.18s ease; cursor: pointer; }
                .faq-item:hover { background: rgba(109,40,217,0.03); }
                .step-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.06); }
                input:focus { outline: none; border-color: rgba(109,40,217,0.4) !important; box-shadow: 0 0 0 3px rgba(109,40,217,0.08); }
            `}</style>

            {/* ── Nav ── */}
            <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(9,9,15,0.95)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex h-16 items-center justify-between px-6" style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <Link to="/" style={{ textDecoration: "none" }}>
                        <img src={logoConfig['full-logo-white-no-bg']} alt="Univa" style={{ height: 30 }} />
                    </Link>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" asChild className="text-white/50 hover:text-white hover:bg-white/5">
                            <Link to="/">← Головна</Link>
                        </Button>
                        <Button size="sm" asChild style={{ background: "linear-gradient(135deg,#6d28d9,#5b21b6)", border: "none", borderRadius: 8, fontWeight: 600 }}>
                            <Link to="/dashboard">Відкрити Univa <ArrowRightIcon className="size-3.5 ml-1.5" /></Link>
                        </Button>
                    </div>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section style={{ padding: "90px 24px 72px", background: T.dark, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(109,40,217,0.14) 0%, transparent 65%)" }} />
                <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                            style={{ maxWidth: 680, margin: "0 auto", textAlign: "center", position: "relative" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 14px", borderRadius: 100, background: "rgba(109,40,217,0.12)", border: "1px solid rgba(109,40,217,0.28)", fontSize: 11, fontWeight: 700, color: "#a78bfa", marginBottom: 24, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        <PlugIcon size={11} /> Інтеграції
                    </div>
                    <h1 className="serif" style={{ fontSize: "clamp(40px,5.5vw,72px)", fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.07, marginBottom: 20, color: "#fff" }}>
                        Univa працює<br />
                        <span style={{ fontStyle: "italic", background: "linear-gradient(135deg,#a78bfa,#38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                            разом з твоїми
                        </span><br />
                        інструментами
                    </h1>
                    <p style={{ fontSize: 17, lineHeight: 1.75, color: "rgba(255,255,255,0.42)", marginBottom: 36, maxWidth: 480, margin: "0 auto 36px" }}>
                        Підключи сервіси, якими ти вже користуєшся. Жодного зайвого ПЗ — лише синхронізація того, що важливо.
                    </p>

                    {/* Stats row */}
                    <div style={{ display: "flex", gap: 32, justifyContent: "center", flexWrap: "wrap" }}>
                        {[
                            { val: `${available}`, label: "Доступно зараз" },
                            { val: `${soon}+`, label: "Скоро" },
                            { val: "REST API", label: "Для розробників" },
                        ].map(s => (
                            <div key={s.label} style={{ textAlign: "center" }}>
                                <div className="serif" style={{ fontSize: 28, color: "#fff", letterSpacing: "-0.02em" }}>{s.val}</div>
                                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* ── Search + Filter + Grid ── */}
            <section style={{ padding: "72px 24px 100px" }}>
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    {/* Search */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                                style={{ position: "relative", maxWidth: 440, margin: "0 auto 32px" }}>
                        <SearchIcon size={16} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: T.muted }} />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Знайти інтеграцію..."
                            style={{ width: "100%", padding: "12px 16px 12px 44px", borderRadius: 12, border: `1px solid ${T.border}`, background: T.card, fontSize: 14, color: T.text, transition: "all 0.2s", fontFamily: "inherit" }}
                        />
                    </motion.div>

                    {/* Category pills */}
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 48 }}>
                        {categories.map(cat => (
                            <button key={cat} className="cat-pill" onClick={() => setActiveCategory(cat)}
                                    style={{ padding: "7px 16px", borderRadius: 100, border: `1px solid ${activeCategory === cat ? T.accent : T.border}`, background: activeCategory === cat ? T.accentSoft : T.card, color: activeCategory === cat ? T.accent : T.muted, fontSize: 13, fontWeight: activeCategory === cat ? 600 : 400, fontFamily: "inherit" }}>
                                {cat}
                            </button>
                        ))}
                    </motion.div>

                    {/* Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
                        <AnimatePresence mode="popLayout">
                            {filtered.map((int, i) => (
                                <motion.div key={int.id}
                                            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: i * 0.04, duration: 0.2 }}
                                            className="int-card"
                                            style={{ padding: 28, borderRadius: 18, border: `1px solid ${T.border}`, background: T.card, position: "relative" }}>

                                    {/* Status badge */}
                                    {int.status === "soon" && (
                                        <div style={{ position: "absolute", top: 16, right: 16, padding: "3px 10px", borderRadius: 100, background: "#fef9c3", border: "1px solid #fde047", fontSize: 10, fontWeight: 700, color: "#92400e", letterSpacing: "0.06em" }}>
                                            СКОРО
                                        </div>
                                    )}
                                    {int.status === "available" && (
                                        <div style={{ position: "absolute", top: 16, right: 16, padding: "3px 10px", borderRadius: 100, background: "#dcfce7", border: "1px solid #86efac", fontSize: 10, fontWeight: 700, color: "#166534", letterSpacing: "0.06em" }}>
                                            ДОСТУПНО
                                        </div>
                                    )}

                                    <div style={{ width: 52, height: 52, borderRadius: 14, background: int.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, border: `1px solid ${int.color}18` }}>
                                        <int.icon />
                                    </div>

                                    <div style={{ fontSize: 11, fontWeight: 700, color: int.color, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>{int.category}</div>
                                    <h3 style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em", marginBottom: 8, color: T.text }}>{int.name}</h3>
                                    <p style={{ fontSize: 13, lineHeight: 1.68, color: T.muted, marginBottom: 18 }}>{int.desc}</p>

                                    <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 20 }}>
                                        {int.features.map(f => (
                                            <div key={f} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: T.muted }}>
                                                <CheckCircleIcon size={13} style={{ color: T.green, flexShrink: 0 }} /> {f}
                                            </div>
                                        ))}
                                    </div>

                                    <Button size="sm" disabled={int.status === "soon"} asChild={int.status === "available"}
                                            style={{ width: "100%", borderRadius: 10, fontWeight: 600, fontSize: 13, background: int.status === "available" ? `${int.color}10` : T.bg, color: int.status === "available" ? int.color : T.muted, border: `1px solid ${int.status === "available" ? int.color + "30" : T.border}`, cursor: int.status === "soon" ? "not-allowed" : "pointer" }}>
                                        {int.status === "available"
                                            ? <Link to="/dashboard/settings/integrations" style={{ color: "inherit", textDecoration: "none" }}>Підключити →</Link>
                                            : "Незабаром"}
                                    </Button>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {filtered.length === 0 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 24px", color: T.muted }}>
                                <PlugIcon size={32} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                                <div style={{ fontSize: 15 }}>Нічого не знайдено. Спробуй інший запит.</div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </section>

            {/* ── How it works ── */}
            <section style={{ padding: "80px 24px 100px", background: T.dark, borderTop: `1px solid ${T.darkBorder}` }}>
                <div style={{ maxWidth: 1000, margin: "0 auto" }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 60 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Як це працює</div>
                        <h2 className="serif" style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 400, letterSpacing: "-0.02em", color: "#fff" }}>Три кроки до з'єднання</h2>
                    </motion.div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
                        {steps.map((s, i) => (
                            <motion.div key={s.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                                        className="step-card" style={{ padding: 32, borderRadius: 18, border: `1px solid ${T.darkBorder}`, background: "rgba(255,255,255,0.02)", transition: "box-shadow 0.22s ease" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                                    <div style={{ width: 42, height: 42, borderRadius: 12, background: `${s.color}18`, border: `1px solid ${s.color}28`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <s.icon size={19} style={{ color: s.color }} />
                                    </div>
                                    <div className="serif" style={{ fontSize: 36, color: "rgba(255,255,255,0.06)", letterSpacing: "-0.05em", fontWeight: 400 }}>{s.step}</div>
                                </div>
                                <h3 style={{ fontWeight: 700, fontSize: 17, color: "#f1f0ee", marginBottom: 8 }}>{s.title}</h3>
                                <p style={{ fontSize: 13, lineHeight: 1.68, color: T.darkMuted }}>{s.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FAQ ── */}
            <section style={{ padding: "90px 24px 100px", background: T.bg }}>
                <div style={{ maxWidth: 720, margin: "0 auto" }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 56 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: T.accent, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>FAQ</div>
                        <h2 className="serif" style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 400, letterSpacing: "-0.02em", color: T.text }}>Часті запитання</h2>
                    </motion.div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {faqs.map((faq, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                                        className="faq-item" onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                        style={{ borderRadius: 14, padding: "20px 24px", border: `1px solid ${openFaq === i ? "rgba(109,40,217,0.2)" : T.border}`, background: openFaq === i ? T.accentSoft : T.card, marginBottom: 6 }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                                    <span style={{ fontWeight: 600, fontSize: 15, color: T.text }}>{faq.q}</span>
                                    <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                        <ChevronDownIcon size={18} style={{ color: T.muted, flexShrink: 0 }} />
                                    </motion.div>
                                </div>
                                <AnimatePresence>
                                    {openFaq === i && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}
                                                    style={{ overflow: "hidden" }}>
                                            <p style={{ fontSize: 14, lineHeight: 1.72, color: T.muted, marginTop: 12 }}>{faq.a}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section style={{ padding: "90px 24px", background: T.dark, textAlign: "center", borderTop: `1px solid ${T.darkBorder}` }}>
                <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ maxWidth: 520, margin: "0 auto" }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg,#6d28d9,#5b21b6)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px", boxShadow: "0 8px 32px rgba(109,40,217,0.35)" }}>
                        <ZapIcon size={24} style={{ color: "#fff" }} />
                    </div>
                    <h2 className="serif" style={{ fontWeight: 400, fontSize: "clamp(26px,4vw,42px)", letterSpacing: "-0.02em", marginBottom: 14, color: "#fff" }}>
                        Готовий з'єднати все разом?
                    </h2>
                    <p style={{ fontSize: 15, color: "rgba(255,255,255,0.38)", marginBottom: 32, lineHeight: 1.7 }}>
                        Підключи перші інтеграції за хвилину. Безкоштовно, без кредитної картки.
                    </p>
                    <Button asChild style={{ background: "linear-gradient(135deg,#6d28d9,#5b21b6)", border: "none", borderRadius: 10, padding: "14px 32px", fontWeight: 600, fontSize: 15, boxShadow: "0 4px 20px rgba(109,40,217,0.4)" }}>
                        <Link to="/dashboard">Почати безкоштовно <ArrowRightIcon className="size-4 ml-2" /></Link>
                    </Button>
                    <div style={{ marginTop: 20, fontSize: 13, color: "rgba(255,255,255,0.25)" }}>
                        Є питання? <a href="mailto:support@univa.app" style={{ color: "#a78bfa", textDecoration: "none" }}>Напиши нам →</a>
                    </div>
                </motion.div>
            </section>

            <LandingFooter />
        </div>
    )
}