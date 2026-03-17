import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import usePageTitle from "@/shared/hooks/usePageTitle"
import { GOOGLE_FONTS_URL } from "@/app/config/app.config.ts"
import logoConfig from "@/app/config/logo.config"
import { Button } from "@/shared/shadcn/ui/button"
import {
    ArrowRightIcon, CalendarIcon, ClockIcon, TagIcon,
    BriefcaseIcon, MapPinIcon, ZapIcon, HeartIcon, UsersIcon,
    TrendingUpIcon, MailIcon, MessageCircleIcon, SendIcon,
    SparklesIcon, RocketIcon, CheckCircleIcon, ArrowUpRightIcon,
    GlobeIcon,
} from "lucide-react"
import { LandingFooter } from "@/widgets/landing"

// ─── Shared tokens ────────────────────────────────────────────────────────────
const T = {
    bg: "#f5f4f0", card: "#fff", border: "#e4e2dc",
    text: "#0d0d12", muted: "#71717a", accent: "#6d28d9",
    accentSoft: "#ede9fe", accentMid: "#c4b5fd",
    dark: "#09090f", darkCard: "#0f0f1a", darkBorder: "#1c1c28", darkMuted: "#52525b",
    green: "#059669", blue: "#0284c7", orange: "#d97706",
    grad: "linear-gradient(135deg,#6d28d9,#5b21b6)",
    gradFull: "linear-gradient(135deg,#6d28d9,#7c3aed,#0ea5e9)",
}

const FONTS = `
    @import url('${GOOGLE_FONTS_URL}');
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,800;1,9..40,400&family=DM+Serif+Display:ital@0;1&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    .serif { font-family: 'DM Serif Display', serif; }
`

// Shared nav
function PageNav({ label }: { label: string }) {
    return (
        <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(9,9,15,0.96)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex h-16 items-center justify-between px-6" style={{ maxWidth: 1200, margin: "0 auto" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <Link to="/"><img src={logoConfig['full-logo-white-no-bg']} alt="Univa" style={{ height: 28 }} /></Link>
                    <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)" }} />
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{label}</span>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" asChild className="text-white/40 hover:text-white hover:bg-white/5">
                        <Link to="/">← Головна</Link>
                    </Button>
                    <Button size="sm" asChild style={{ background: T.grad, border: "none", borderRadius: 8, fontWeight: 600 }}>
                        <Link to="/dashboard">Відкрити <ArrowRightIcon className="size-3.5 ml-1" /></Link>
                    </Button>
                </div>
            </div>
        </nav>
    )
}

// ══════════════════════════════════════════════════════════════════════════════
// BLOG PAGE
// ══════════════════════════════════════════════════════════════════════════════
const blogPosts = [
    {
        id: 1, featured: true,
        category: "Продукт", tag: "#оновлення",
        title: "Univa 2.0: AI-помічник, мобільний вигляд і групові простори",
        excerpt: "Найбільше оновлення за всю історію платформи. Розповідаємо про кожну зміну і чому ми прийняли саме такі рішення.",
        author: "Олександр М.", authorRole: "CEO", date: "12 берез. 2026", readTime: "7 хв",
        color: T.accent, bg: T.accentSoft,
    },
    {
        id: 2, featured: false,
        category: "Навчання", tag: "#поради",
        title: "5 способів організувати сесію без стресу за допомогою Univa",
        excerpt: "Практичний гайд від студентів, які вже пережили не одну сесію. Конкретні шаблони та техніки.",
        author: "Марія К.", authorRole: "CTO", date: "3 берез. 2026", readTime: "5 хв",
        color: T.blue, bg: "#e0f2fe",
    },
    {
        id: 3, featured: false,
        category: "AI", tag: "#технології",
        title: "Як AI-помічник розуміє твої конспекти: пояснення для нетехнарів",
        excerpt: "Катерина Л., наш Head of AI, пояснює що відбувається «під капотом» коли ти просиш пояснити складну тему.",
        author: "Катерина Л.", authorRole: "Head of AI", date: "24 лют. 2026", readTime: "6 хв",
        color: T.accent, bg: T.accentSoft,
    },
    {
        id: 4, featured: false,
        category: "Команда", tag: "#культура",
        title: "Як ми будуємо продукт для студентів, залишаючись студентами",
        excerpt: "Чесна розповідь про те, як поєднувати навчання, роботу та будівництво стартапу в одних і тих же умовах.",
        author: "Дмитро П.", authorRole: "Head of Product", date: "15 лют. 2026", readTime: "4 хв",
        color: T.orange, bg: "#fef3c7",
    },
    {
        id: 5, featured: false,
        category: "Інтеграції", tag: "#оновлення",
        title: "Google Calendar + Univa: повний гайд по налаштуванню",
        excerpt: "Покрокова інструкція як синхронізувати розклад, дедлайни та події між двома платформами.",
        author: "Ігор С.", authorRole: "Lead Engineer", date: "8 лют. 2026", readTime: "3 хв",
        color: T.green, bg: "#d1fae5",
    },
]

const categories = ["Всі", "Продукт", "Навчання", "AI", "Команда", "Інтеграції"]

export function BlogPage() {
    usePageTitle("Блог — Univa")
    const [activeCategory, setActiveCategory] = useState("Всі")
    const featured = blogPosts.find(p => p.featured)!
    const rest = blogPosts.filter(p => !p.featured).filter(p => activeCategory === "Всі" || p.category === activeCategory)

    return (
        <div style={{ background: T.bg, minHeight: "100vh", color: T.text, fontFamily: "'DM Sans', sans-serif" }}>
            <style>{FONTS + `
                .post-card { transition: all 0.22s ease; cursor: pointer; }
                .post-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.08); }
                .cat-pill { transition: all 0.18s; cursor: pointer; border: none; }
                .tag { font-size: 11px; font-weight: 700; letter-spacing: 0.06em; }
            `}</style>
            <PageNav label="Блог" />

            {/* Hero */}
            <section style={{ padding: "72px 24px 56px", background: T.dark, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 50% at 30% 50%, rgba(109,40,217,0.1) 0%, transparent 65%)" }} />
                <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>Блог Univa</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
                        <div>
                            <h1 className="serif" style={{ fontSize: "clamp(36px,4.5vw,58px)", fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.08, color: "#fff", marginBottom: 16 }}>
                                Думки, оновлення<br />
                                <span style={{ fontStyle: "italic", background: T.gradFull, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>та інсайти</span>
                            </h1>
                            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.38)", lineHeight: 1.7 }}>
                                Команда Univa ділиться досвідом побудови продукту, порадами для студентів та думками про майбутнє освіти.
                            </p>
                        </div>
                        {/* Featured post preview */}
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                                    style={{ padding: 28, borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", cursor: "pointer" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                                <div style={{ padding: "3px 10px", borderRadius: 100, background: "rgba(109,40,217,0.2)", fontSize: 10, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.06em" }}>FEATURED</div>
                                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{featured.category}</span>
                            </div>
                            <h2 style={{ fontWeight: 700, fontSize: 18, color: "#fff", lineHeight: 1.35, marginBottom: 10, letterSpacing: "-0.02em" }}>{featured.title}</h2>
                            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.65, marginBottom: 18 }}>{featured.excerpt}</p>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <div style={{ width: 28, height: 28, borderRadius: 8, background: T.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>
                                        {featured.author.split(" ").map(w => w[0]).join("")}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{featured.author}</div>
                                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{featured.date} · {featured.readTime}</div>
                                    </div>
                                </div>
                                <ArrowUpRightIcon size={16} style={{ color: "#a78bfa" }} />
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </section>

            {/* Posts */}
            <section style={{ padding: "64px 24px 100px", maxWidth: 1100, margin: "0 auto" }}>
                {/* Category filter */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 48 }}>
                    {categories.map(cat => (
                        <button key={cat} className="cat-pill" onClick={() => setActiveCategory(cat)}
                                style={{ padding: "7px 16px", borderRadius: 100, background: activeCategory === cat ? T.accentSoft : T.card, color: activeCategory === cat ? T.accent : T.muted, fontSize: 13, fontWeight: activeCategory === cat ? 600 : 400, border: `1px solid ${activeCategory === cat ? T.accentMid : T.border}`, fontFamily: "inherit" }}>
                            {cat}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="popLayout">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
                        {rest.map((post, i) => (
                            <motion.article key={post.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ delay: i * 0.06 }}
                                            className="post-card" style={{ padding: 28, borderRadius: 18, border: `1px solid ${T.border}`, background: T.card }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 100, background: post.bg, fontSize: 11, fontWeight: 700, color: post.color }}>
                                        <TagIcon size={10} /> {post.category}
                                    </div>
                                    <div style={{ fontSize: 11, color: T.muted }}>{post.readTime} читання</div>
                                </div>
                                <h2 style={{ fontWeight: 700, fontSize: 17, lineHeight: 1.38, letterSpacing: "-0.02em", marginBottom: 10, color: T.text }}>{post.title}</h2>
                                <p style={{ fontSize: 13, lineHeight: 1.7, color: T.muted, marginBottom: 20 }}>{post.excerpt}</p>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <div style={{ width: 28, height: 28, borderRadius: 8, background: `${post.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: post.color }}>
                                            {post.author.split(" ").map(w => w[0]).join("")}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{post.author}</div>
                                            <div style={{ fontSize: 11, color: T.muted }}>{post.date}</div>
                                        </div>
                                    </div>
                                    <ArrowUpRightIcon size={14} style={{ color: T.muted }} />
                                </div>
                            </motion.article>
                        ))}
                    </div>
                </AnimatePresence>
            </section>

            <LandingFooter />
        </div>
    )
}

// ══════════════════════════════════════════════════════════════════════════════
// CAREER PAGE
// ══════════════════════════════════════════════════════════════════════════════
const perks = [
    { icon: RocketIcon, title: "Реальний вплив", desc: "Твій код та рішення використовують тисячі студентів вже з першого дня.", color: T.accent },
    { icon: HeartIcon, title: "Місія, що надихає", desc: "Ми покращуємо освіту. Щодня це відчутно.", color: "#e11d48" },
    { icon: ZapIcon, title: "Швидке зростання", desc: "Стартап-швидкість: нові виклики, швидкі рішення, прокачка навичок.", color: T.orange },
    { icon: UsersIcon, title: "Крута команда", desc: "Невелика, але сильна команда без зайвої бюрократії та мікроменеджменту.", color: T.blue },
    { icon: TrendingUpIcon, title: "Кар'єрний ріст", desc: "Чіткий шлях росту, менторство від досвідчених фаундерів.", color: T.green },
    { icon: GlobeIcon, title: "Гнучкість", desc: "Remote-first, гнучкий графік, асинхронна комунікація.", color: T.accent },
]

const openings = [
    { title: "Senior Frontend Engineer", team: "Інженерія", type: "Full-time", location: "Remote (Україна)", level: "Senior", color: T.blue, bg: "#e0f2fe" },
    { title: "Product Designer", team: "Дизайн", type: "Full-time", location: "Remote (Україна)", level: "Middle", color: T.accent, bg: T.accentSoft },
    { title: "ML Engineer (NLP)", team: "AI", type: "Full-time", location: "Remote", level: "Senior", color: "#7c3aed", bg: "#f5f3ff" },
    { title: "Backend Engineer (Laravel)", team: "Інженерія", type: "Full-time", location: "Remote (Україна)", level: "Middle/Senior", color: T.orange, bg: "#fef3c7" },
    { title: "Growth Marketer", team: "Маркетинг", type: "Part-time", location: "Remote", level: "Middle", color: T.green, bg: "#d1fae5" },
    { title: "Student Ambassador", team: "Community", type: "Part-time", location: "Будь-яке місто", level: "Student", color: "#e11d48", bg: "#ffe4e6" },
]

export function CareerPage() {
    usePageTitle("Кар'єра — Univa")
    const [activeLevel, setActiveLevel] = useState("Всі")
    const levels = ["Всі", "Student", "Middle", "Senior"]
    const filtered = openings.filter(o => activeLevel === "Всі" || o.level.includes(activeLevel))

    return (
        <div style={{ background: T.bg, minHeight: "100vh", color: T.text, fontFamily: "'DM Sans', sans-serif" }}>
            <style>{FONTS + `
                .job-card { transition: all 0.22s ease; }
                .job-card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.07); border-color: rgba(109,40,217,0.25) !important; }
                .perk-card { transition: box-shadow 0.2s; }
                .perk-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.06); }
            `}</style>
            <PageNav label="Кар'єра" />

            {/* Hero */}
            <section style={{ padding: "80px 24px 72px", background: T.dark, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 15% 50%, rgba(109,40,217,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 85% 30%, rgba(14,165,233,0.08) 0%, transparent 55%)" }} />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", position: "relative" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 14px", borderRadius: 100, background: "rgba(109,40,217,0.12)", border: "1px solid rgba(109,40,217,0.28)", fontSize: 11, fontWeight: 700, color: "#a78bfa", marginBottom: 24, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        <BriefcaseIcon size={11} /> Ми шукаємо тебе
                    </div>
                    <h1 className="serif" style={{ fontSize: "clamp(40px,5vw,66px)", fontWeight: 400, letterSpacing: "-0.025em", lineHeight: 1.07, color: "#fff", marginBottom: 18 }}>
                        Будуй майбутнє освіти<br />
                        <span style={{ fontStyle: "italic", background: T.gradFull, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>разом з нами</span>
                    </h1>
                    <p style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", lineHeight: 1.75, marginBottom: 36, maxWidth: 500, margin: "0 auto 36px" }}>
                        Univa — це маленька команда з великою місією. Приєднуйся, якщо хочеш будувати продукт, яким реально користуються студенти.
                    </p>
                    <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
                        {[{ val: `${openings.length}`, label: "Відкритих позицій" }, { val: "Remote", label: "Формат роботи" }, { val: "Equity", label: "Для ключових ролей" }].map(s => (
                            <div key={s.label} style={{ textAlign: "center" }}>
                                <div className="serif" style={{ fontSize: 28, color: "#fff" }}>{s.val}</div>
                                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* Perks */}
            <section style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}>
                <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 48 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.accent, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>Чому Univa</div>
                    <h2 className="serif" style={{ fontSize: "clamp(26px,3.5vw,40px)", fontWeight: 400, letterSpacing: "-0.02em" }}>Що ми пропонуємо</h2>
                </motion.div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                    {perks.map((p, i) => (
                        <motion.div key={p.title} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                                    className="perk-card" style={{ padding: 26, borderRadius: 16, border: `1px solid ${T.border}`, background: T.card }}>
                            <div style={{ width: 40, height: 40, borderRadius: 11, background: `${p.color}12`, border: `1px solid ${p.color}20`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                                <p.icon size={18} style={{ color: p.color }} />
                            </div>
                            <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{p.title}</h3>
                            <p style={{ fontSize: 13, lineHeight: 1.65, color: T.muted }}>{p.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Openings */}
            <section style={{ padding: "0 24px 100px", maxWidth: 1100, margin: "0 auto" }}>
                <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 36 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
                        <h2 className="serif" style={{ fontSize: "clamp(24px,3.5vw,36px)", fontWeight: 400, letterSpacing: "-0.02em" }}>Відкриті позиції</h2>
                        <div style={{ display: "flex", gap: 8 }}>
                            {levels.map(l => (
                                <button key={l} onClick={() => setActiveLevel(l)}
                                        style={{ padding: "6px 14px", borderRadius: 100, border: `1px solid ${activeLevel === l ? T.accentMid : T.border}`, background: activeLevel === l ? T.accentSoft : T.card, color: activeLevel === l ? T.accent : T.muted, fontSize: 12, fontWeight: activeLevel === l ? 600 : 400, cursor: "pointer", fontFamily: "inherit", transition: "all 0.18s" }}>
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <AnimatePresence mode="popLayout">
                        {filtered.map((job, i) => (
                            <motion.div key={job.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ delay: i * 0.04 }}
                                        className="job-card" style={{ padding: "22px 28px", borderRadius: 16, border: `1px solid ${T.border}`, background: T.card, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: job.bg, border: `1px solid ${job.color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        <BriefcaseIcon size={18} style={{ color: job.color }} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.01em", color: T.text, marginBottom: 4 }}>{job.title}</div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                                            <span style={{ fontSize: 12, color: T.muted }}>{job.team}</span>
                                            <span style={{ width: 3, height: 3, borderRadius: "50%", background: T.border, display: "inline-block" }} />
                                            <span style={{ fontSize: 12, color: T.muted }}>{job.location}</span>
                                            <span style={{ width: 3, height: 3, borderRadius: "50%", background: T.border, display: "inline-block" }} />
                                            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 100, background: job.bg, color: job.color, fontWeight: 600 }}>{job.level}</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 100, background: T.bg, border: `1px solid ${T.border}`, color: T.muted }}>{job.type}</span>
                                    <Button size="sm" asChild style={{ background: T.grad, border: "none", borderRadius: 8, fontWeight: 600, fontSize: 13 }}>
                                        <a href={`mailto:careers@univa.app?subject=Вакансія: ${job.title}`}>Подати заявку</a>
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Open application */}
                <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                            style={{ marginTop: 24, padding: "28px 32px", borderRadius: 18, border: "1px dashed rgba(109,40,217,0.3)", background: T.accentSoft, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 16, color: T.text, marginBottom: 4 }}>Не знайшов підходящої вакансії?</div>
                        <div style={{ fontSize: 13, color: T.muted }}>Надішли відкриту заявку — можливо, ти саме той, кого ми ще не знаємо що шукаємо.</div>
                    </div>
                    <Button asChild style={{ background: T.grad, border: "none", borderRadius: 10, fontWeight: 600 }}>
                        <a href="mailto:careers@univa.app?subject=Відкрита заявка">Надіслати резюме <ArrowRightIcon className="size-4 ml-2" /></a>
                    </Button>
                </motion.div>
            </section>

            <LandingFooter />
        </div>
    )
}

// ══════════════════════════════════════════════════════════════════════════════
// CONTACT PAGE
// ══════════════════════════════════════════════════════════════════════════════
const contactChannels = [
    { icon: MailIcon, title: "Загальні питання", value: "hello@univa.app", href: "mailto:hello@univa.app", desc: "Партнерства, питання про продукт", color: T.accent, bg: T.accentSoft },
    { icon: MessageCircleIcon, title: "Підтримка", value: "support@univa.app", href: "mailto:support@univa.app", desc: "Технічні проблеми, допомога з акаунтом", color: T.blue, bg: "#e0f2fe" },
    { icon: BriefcaseIcon, title: "Кар'єра", value: "careers@univa.app", href: "mailto:careers@univa.app", desc: "Вакансії та відкриті заявки", color: T.green, bg: "#d1fae5" },
    { icon: SparklesIcon, title: "Преса та медіа", value: "press@univa.app", href: "mailto:press@univa.app", desc: "Інтерв'ю, прес-матеріали, цитати", color: T.orange, bg: "#fef3c7" },
]

const offices = [
    { city: "Київ", address: "вул. Хрещатик 22, офіс 501", emoji: "🇺🇦", primary: true },
    { city: "Вінниця", address: "вул. Соборна 35, коворкінг", emoji: "🇺🇦", primary: false },
]

export function ContactPage() {
    usePageTitle("Контакти — Univa")
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" })
    const [sent, setSent] = useState(false)
    const [sending, setSending] = useState(false)

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSending(true)
        setTimeout(() => { setSent(true); setSending(false) }, 1200)
    }

    const inputStyle = {
        width: "100%", padding: "12px 16px", borderRadius: 10,
        border: `1px solid ${T.border}`, background: T.bg, fontSize: 14,
        color: T.text, fontFamily: "inherit", transition: "all 0.2s",
    }

    return (
        <div style={{ background: T.bg, minHeight: "100vh", color: T.text, fontFamily: "'DM Sans', sans-serif" }}>
            <style>{FONTS + `
                input:focus, textarea:focus, select:focus { outline: none; border-color: rgba(109,40,217,0.4) !important; box-shadow: 0 0 0 3px rgba(109,40,217,0.08); }
                .ch-card { transition: all 0.2s; }
                .ch-card:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(0,0,0,0.06); }
            `}</style>
            <PageNav label="Контакти" />

            {/* Hero */}
            <section style={{ padding: "72px 24px 60px", background: T.dark, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(109,40,217,0.12) 0%, transparent 65%)" }} />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", position: "relative" }}>
                    <h1 className="serif" style={{ fontSize: "clamp(36px,5vw,58px)", fontWeight: 400, letterSpacing: "-0.025em", color: "#fff", marginBottom: 14 }}>
                        Зв'яжись з нами
                    </h1>
                    <p style={{ fontSize: 16, color: "rgba(255,255,255,0.38)", lineHeight: 1.7 }}>
                        Ми невелика команда і читаємо кожен лист. Зазвичай відповідаємо протягом дня.
                    </p>
                </motion.div>
            </section>

            <div style={{ maxWidth: 1000, margin: "0 auto", padding: "64px 24px 100px" }}>

                {/* Channels */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14, marginBottom: 64 }}>
                    {contactChannels.map((ch, i) => (
                        <motion.a key={ch.title} href={ch.href} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                                  className="ch-card" style={{ padding: "22px 24px", borderRadius: 16, border: `1px solid ${T.border}`, background: T.card, textDecoration: "none", display: "block" }}>
                            <div style={{ width: 40, height: 40, borderRadius: 11, background: ch.bg, border: `1px solid ${ch.color}18`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                                <ch.icon size={18} style={{ color: ch.color }} />
                            </div>
                            <div style={{ fontWeight: 700, fontSize: 13, color: T.text, marginBottom: 2 }}>{ch.title}</div>
                            <div style={{ fontSize: 12, color: ch.color, fontWeight: 500, marginBottom: 6 }}>{ch.value}</div>
                            <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>{ch.desc}</div>
                        </motion.a>
                    ))}
                </motion.div>

                {/* Form + Offices */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 32, alignItems: "start" }}>

                    {/* Form */}
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                                style={{ padding: "36px 40px", borderRadius: 20, border: `1px solid ${T.border}`, background: T.card }}>
                        <h2 style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.02em", marginBottom: 6 }}>Написати повідомлення</h2>
                        <p style={{ fontSize: 13, color: T.muted, marginBottom: 28 }}>Заповни форму і ми відповімо на твій email.</p>

                        {sent ? (
                            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                                        style={{ textAlign: "center", padding: "48px 24px" }}>
                                <CheckCircleIcon size={40} style={{ color: T.green, margin: "0 auto 16px" }} />
                                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Повідомлення надіслано!</div>
                                <div style={{ fontSize: 14, color: T.muted }}>Відповімо протягом 24 годин на твій email.</div>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                    <div>
                                        <label style={{ fontSize: 12, fontWeight: 600, color: T.text, display: "block", marginBottom: 6 }}>Ім'я</label>
                                        <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Олексій" style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 12, fontWeight: 600, color: T.text, display: "block", marginBottom: 6 }}>Email</label>
                                        <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="hello@example.com" style={inputStyle} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: T.text, display: "block", marginBottom: 6 }}>Тема</label>
                                    <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} style={{ ...inputStyle, appearance: "none" as any }}>
                                        <option value="">Оберіть тему...</option>
                                        <option>Технічна підтримка</option>
                                        <option>Партнерство / Університет</option>
                                        <option>Кар'єра</option>
                                        <option>Преса та медіа</option>
                                        <option>Інше</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: T.text, display: "block", marginBottom: 6 }}>Повідомлення</label>
                                    <textarea required rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Розкажи детальніше..."
                                              style={{ ...inputStyle, resize: "vertical", minHeight: 120 }} />
                                </div>
                                <Button type="submit" disabled={sending} style={{ background: T.grad, border: "none", borderRadius: 10, padding: "13px", fontWeight: 600, fontSize: 15, opacity: sending ? 0.7 : 1 }}>
                                    {sending ? "Надсилаємо..." : <><SendIcon className="size-4 mr-2" /> Надіслати</>}
                                </Button>
                            </form>
                        )}
                    </motion.div>

                    {/* Offices + social */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                                    style={{ padding: "28px", borderRadius: 18, border: `1px solid ${T.border}`, background: T.card }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                                <MapPinIcon size={16} style={{ color: T.muted }} />
                                <span style={{ fontWeight: 700, fontSize: 14 }}>Офіси</span>
                            </div>
                            {offices.map((o, i) => (
                                <div key={o.city} style={{ paddingBottom: i < offices.length - 1 ? 16 : 0, marginBottom: i < offices.length - 1 ? 16 : 0, borderBottom: i < offices.length - 1 ? `1px solid ${T.border}` : "none" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                        <span style={{ fontSize: 16 }}>{o.emoji}</span>
                                        <span style={{ fontWeight: 600, fontSize: 14, color: T.text }}>{o.city}</span>
                                        {o.primary && <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 100, background: T.accentSoft, color: T.accent, fontWeight: 700 }}>HQ</span>}
                                    </div>
                                    <div style={{ fontSize: 12, color: T.muted, paddingLeft: 24 }}>{o.address}</div>
                                </div>
                            ))}
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                                    style={{ padding: "24px 28px", borderRadius: 18, background: T.dark, border: `1px solid ${T.darkBorder}` }}>
                            <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 14 }}>Соціальні мережі</div>
                            {[
                                { name: "Telegram", handle: "@univa_app", href: "#", color: "#0284c7" },
                                { name: "Instagram", handle: "@univa.app", href: "#", color: "#e11d48" },
                                { name: "LinkedIn", handle: "Univa", href: "#", color: "#0284c7" },
                                { name: "GitHub", handle: "univa-app", href: "#", color: "#f1f0ee" },
                            ].map(s => (
                                <a key={s.name} href={s.href} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.darkBorder}`, textDecoration: "none" }}>
                                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{s.name}</span>
                                    <span style={{ fontSize: 12, color: s.color, fontWeight: 500 }}>{s.handle}</span>
                                </a>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>

            <LandingFooter />
        </div>
    )
}