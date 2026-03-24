import { Link } from "react-router-dom"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import usePageTitle from "@/shared/hooks/usePageTitle.ts"
import { GOOGLE_FONTS_URL } from "@/app/config/app.config.ts"
import logoConfig from "@/app/config/logo.config.ts"
import { Button } from "@/shared/shadcn/ui/button.tsx"
import {
    ArrowRightIcon, HeartIcon, TargetIcon, EyeIcon, ShieldCheckIcon,
    SparklesIcon, UsersIcon, RocketIcon, StarIcon, GraduationCapIcon,
    BrainIcon, CalendarIcon, FolderIcon, MessageCircleIcon, TrendingUpIcon,
    CheckCircleIcon, QuoteIcon,
} from "lucide-react"
import { LandingFooter } from "@/landing/components"

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
    bg: "#f8f7f4",
    card: "#ffffff",
    text: "#0e0e14",
    muted: "#6b7280",
    border: "#e8e4de",
    accent: "#6d28d9",
    accentLight: "#ede9fe",
    accentMid: "#c4b5fd",
    accent2: "#0ea5e9",
    accent3: "#10b981",
    gradient: "linear-gradient(135deg,#6d28d9,#5b21b6,#4c1d95)",
    gradientFull: "linear-gradient(135deg,#6d28d9,#7c3aed,#0ea5e9)",
    dark: "#08080f",
    darkCard: "#0f0f1a",
    darkBorder: "#1e1e30",
    darkMuted: "#6b7280",
    darkText: "#f1f0ee",
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const stats = [
    { value: "12 000+", label: "Активних студентів", icon: UsersIcon, color: T.accent },
    { value: "60+", label: "Університетів", icon: GraduationCapIcon, color: T.accent2 },
    { value: "4.9 / 5", label: "Середня оцінка", icon: StarIcon, color: "#f59e0b" },
    { value: "2M+", label: "Файлів збережено", icon: FolderIcon, color: T.accent3 },
]

const values = [
    { icon: TargetIcon, title: "Фокус на студентах", desc: "Кожна функція створена з думкою про реальні потреби студентів українських ВНЗ.", color: "#0ea5e9", bg: "#e0f2fe" },
    { icon: ShieldCheckIcon, title: "Приватність", desc: "Ваші дані — тільки ваші. Наскрізне шифрування, дата-центри в ЄС, повний GDPR.", color: "#10b981", bg: "#d1fae5" },
    { icon: SparklesIcon, title: "Інновації", desc: "AI-технології та сучасні підходи для максимально ефективного навчання.", color: "#6d28d9", bg: "#ede9fe" },
    { icon: UsersIcon, title: "Спільнота", desc: "Ми будуємо не просто продукт, а спільноту студентів, що допомагають одне одному.", color: "#e11d48", bg: "#ffe4e6" },
]

const team = [
    { name: "Олександр М.", role: "CEO & Co-founder", avatar: "ОМ", bio: "Колишній студент КНУ. Мріяв про інструмент, якого не існувало.", focus: "Продукт та стратегія", gradient: "linear-gradient(135deg,#6d28d9,#7c3aed)" },
    { name: "Марія К.", role: "CTO & Co-founder", avatar: "МК", bio: "10 років у розробці. Переконана, що технологія має служити людині.", focus: "Архітектура системи", gradient: "linear-gradient(135deg,#0ea5e9,#6366f1)" },
    { name: "Дмитро П.", role: "Head of Product", avatar: "ДП", bio: "Дослідник UX із 5-річним досвідом у EdTech.", focus: "UX & дослідження", gradient: "linear-gradient(135deg,#10b981,#0ea5e9)" },
    { name: "Анна Б.", role: "Lead Designer", avatar: "АБ", bio: "Дизайнер інтерфейсів, яким довіряють мільйони. Прийшла будувати щось своє.", focus: "UI/UX Дизайн", gradient: "linear-gradient(135deg,#f43f5e,#e11d48)" },
    { name: "Ігор С.", role: "Lead Engineer", avatar: "ІС", bio: "Fullstack розробник. Обожнює чистий код і каву без цукру.", focus: "Frontend & Backend", gradient: "linear-gradient(135deg,#f59e0b,#ef4444)" },
    { name: "Катерина Л.", role: "Head of AI", avatar: "КЛ", bio: "Дослідниця NLP. Впевнена, що AI може стати кращим репетитором.", focus: "Machine Learning & NLP", gradient: "linear-gradient(135deg,#8b5cf6,#6d28d9)" },
]

const milestones = [
    { year: "2024", month: "Вересень", title: "Ідея народилась", desc: "Група студентів КНУ втомилась від хаосу в навчанні та вирішила діяти.", icon: SparklesIcon },
    { year: "2025", month: "Лютий", title: "Перший прототип", desc: "MVP за 3 місяці. Перші 500 бета-тестерів з 5 університетів. Позитивний відгук.", icon: RocketIcon },
    { year: "2025", month: "Червень", title: "Запуск бета-версії", desc: "1 000 студентів. AI-помічник. Перше покриття в медіа.", icon: TrendingUpIcon },
    { year: "2026", month: "Зараз", title: "Масштабування", desc: "12 000+ студентів, 60+ університетів, мобільний додаток у розробці.", icon: UsersIcon },
]

const testimonials = [
    { name: "Аліна Т.", university: "КНУ ім. Шевченка", program: "Інформатика, 3 курс", text: "Нарешті один інструмент замість п'яти. Розклад, файли, AI-помічник — все під рукою. Сесія пройшла без паніки 🙌", rating: 5 },
    { name: "Максим Р.", university: "Політехніка, Харків", program: "Комп'ютерна інженерія, 4 курс", text: "AI пояснює лекції краще за деяких викладачів. Курсову написав вдвічі швидше — і вийшло набагато краще.", rating: 5 },
    { name: "Олена В.", university: "НТУУ КПІ", program: "Економіка, 2 курс", text: "Старостую в групі — Univa рятує час щодня. Поширювати розклад і файли стало елементарно.", rating: 5 },
]

const features = [
    { icon: CalendarIcon, title: "Розклад і дедлайни", desc: "Персональний календар, нагадування, тижневий огляд навантаження.", color: "#0ea5e9" },
    { icon: FolderIcon, title: "Файлове сховище", desc: "Папки по предметах, спільний доступ для групи, пошук по тексту.", color: "#10b981" },
    { icon: BrainIcon, title: "AI-помічник", desc: "Пояснення тем, конспекти, підготовка до тестів прямо в процесі навчання.", color: "#6d28d9" },
    { icon: MessageCircleIcon, title: "Групові простори", desc: "Чат групи, обмін файлами, закріплені повідомлення, опитування.", color: "#f59e0b" },
]

// ─── Component ────────────────────────────────────────────────────────────────
export function AboutPage() {
    usePageTitle("Про нас — Univa")
    const heroRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 80])
    const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

    return (
        <div style={{ background: T.bg, minHeight: "100vh", color: T.text, fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`
                @import url('${GOOGLE_FONTS_URL}');
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,800;1,9..40,400&family=DM+Serif+Display:ital@0;1&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                .serif { font-family: 'DM Serif Display', serif; }
                .stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(109,40,217,0.12); }
                .team-card:hover .team-bio { opacity: 1; transform: translateY(0); }
                .team-bio { opacity: 0; transform: translateY(8px); transition: all 0.3s ease; }
                .feature-card:hover { border-color: rgba(109,40,217,0.3); background: #fff; transform: translateY(-2px); }
                .testimonial-card:hover { box-shadow: 0 16px 48px rgba(0,0,0,0.08); }
            `}</style>

            {/* ── Navigation ── */}
            <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(8,8,15,0.95)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex h-16 items-center justify-between px-6" style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <Link to="/" style={{ textDecoration: "none" }}>
                        <img src={logoConfig['full-logo-white-no-bg']} alt="Univa" style={{ height: 30 }} />
                    </Link>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" asChild className="text-white/50 hover:text-white hover:bg-white/5">
                            <Link to="/">← Головна</Link>
                        </Button>
                        <Button size="sm" asChild style={{ background: T.gradient, border: "none", borderRadius: 8, fontWeight: 600, letterSpacing: "-0.01em" }}>
                            <Link to="/dashboard">Почати <ArrowRightIcon className="size-3.5 ml-1.5" /></Link>
                        </Button>
                    </div>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section ref={heroRef} style={{ minHeight: "92vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.dark, position: "relative", overflow: "hidden" }}>
                {/* Background mesh */}
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 20% 50%, rgba(109,40,217,0.15) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 30%, rgba(14,165,233,0.10) 0%, transparent 55%)" }} />
                <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

                <motion.div style={{ y: heroY, opacity: heroOpacity, position: "relative", maxWidth: 760, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 100, background: "rgba(109,40,217,0.12)", border: "1px solid rgba(109,40,217,0.3)", fontSize: 12, fontWeight: 600, color: "#a78bfa", marginBottom: 28, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        <HeartIcon size={11} /> Наша історія
                    </motion.div>

                    <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
                               className="serif" style={{ fontSize: "clamp(44px,6vw,80px)", fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.05, marginBottom: 24, color: "#fff" }}>
                        Ми переосмислюємо,<br />
                        <span style={{ fontStyle: "italic", background: T.gradientFull, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>як навчаються</span><br />
                        студенти
                    </motion.h1>

                    <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }}
                              style={{ fontSize: 18, lineHeight: 1.75, color: "rgba(255,255,255,0.45)", maxWidth: 520, margin: "0 auto 40px" }}>
                        Univa народився з простої ідеї: навчання має бути організованим, а не хаотичним. Ми — команда студентів та інженерів, об'єднаних спільною місією.
                    </motion.p>

                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
                                style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                        <Button asChild style={{ background: T.gradient, border: "none", borderRadius: 10, padding: "14px 28px", fontWeight: 600, fontSize: 15 }}>
                            <Link to="/dashboard">Спробувати безкоштовно <ArrowRightIcon className="size-4 ml-2" /></Link>
                        </Button>
                        <Button variant="ghost" asChild style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "14px 28px", fontWeight: 500, fontSize: 15, color: "rgba(255,255,255,0.6)" }}>
                            <a href="#team">Познайомитись з командою</a>
                        </Button>
                    </motion.div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}
                            style={{ position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)", width: 28, height: 44, borderRadius: 14, border: "1.5px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 8 }}>
                    <div style={{ width: 3, height: 8, borderRadius: 2, background: "rgba(255,255,255,0.3)" }} />
                </motion.div>
            </section>

            {/* ── Stats ── */}
            <section style={{ padding: "72px 24px", background: T.card, borderBottom: `1px solid ${T.border}` }}>
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
                        {stats.map((s, i) => (
                            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                                        className="stat-card" style={{ padding: "28px 24px", borderRadius: 16, border: `1px solid ${T.border}`, background: T.bg, textAlign: "center", transition: "all 0.25s ease" }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                                    <s.icon size={20} style={{ color: s.color }} />
                                </div>
                                <div className="serif" style={{ fontSize: 34, fontWeight: 400, color: T.text, letterSpacing: "-0.02em", marginBottom: 4 }}>{s.value}</div>
                                <div style={{ fontSize: 13, color: T.muted }}>{s.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Mission & Vision ── */}
            <section style={{ padding: "100px 24px", maxWidth: 1100, margin: "0 auto" }}>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 60 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.accent, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Для чого ми існуємо</div>
                    <h2 className="serif" style={{ fontSize: "clamp(30px,4vw,48px)", fontWeight: 400, letterSpacing: "-0.02em", color: T.text }}>Місія та Візія</h2>
                </motion.div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
                    {[
                        { icon: TargetIcon, label: "Місія", title: "Зробити навчання організованим", desc: "Ми створюємо єдину екосистему, яка звільняє студентів від рутини управління десятками різних інструментів і дозволяє зосередитися на головному — навчанні та розвитку.", color: "#0ea5e9", border: "#bae6fd" },
                        { icon: EyeIcon, label: "Візія", title: "Освіта без кордонів", desc: "Ми бачимо майбутнє, де кожен студент — незалежно від університету — має доступ до персоналізованого AI-помічника, зручних інструментів та підтримувальної спільноти.", color: "#6d28d9", border: "#c4b5fd" },
                    ].map((item, i) => (
                        <motion.div key={item.label} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                                    style={{ padding: 40, borderRadius: 22, border: `1px solid ${item.border}`, background: T.card, boxShadow: `0 2px 24px ${item.color}08` }}>
                            <div style={{ width: 52, height: 52, borderRadius: 16, background: `${item.color}10`, border: `1px solid ${item.color}20`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22 }}>
                                <item.icon size={24} style={{ color: item.color }} />
                            </div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: item.color, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>{item.label}</div>
                            <h3 className="serif" style={{ fontWeight: 400, fontSize: 26, letterSpacing: "-0.02em", marginBottom: 14, color: T.text }}>{item.title}</h3>
                            <p style={{ fontSize: 15, lineHeight: 1.75, color: T.muted }}>{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── Features overview ── */}
            <section style={{ padding: "80px 24px", background: T.dark, borderTop: `1px solid ${T.darkBorder}`, borderBottom: `1px solid ${T.darkBorder}` }}>
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 56 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Продукт</div>
                        <h2 className="serif" style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 400, letterSpacing: "-0.02em", color: "#fff" }}>Чотири стовпи Univa</h2>
                    </motion.div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                        {features.map((f, i) => (
                            <motion.div key={f.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                                        className="feature-card" style={{ padding: 28, borderRadius: 16, border: `1px solid ${T.darkBorder}`, background: "rgba(255,255,255,0.02)", transition: "all 0.25s ease", cursor: "default" }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${f.color}18`, border: `1px solid ${f.color}30`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                                    <f.icon size={20} style={{ color: f.color }} />
                                </div>
                                <h3 style={{ fontWeight: 600, fontSize: 16, color: "#f1f0ee", marginBottom: 8 }}>{f.title}</h3>
                                <p style={{ fontSize: 13, lineHeight: 1.65, color: T.darkMuted }}>{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Values ── */}
            <section style={{ padding: "100px 24px", background: T.bg }}>
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 60 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: T.accent, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Цінності</div>
                        <h2 className="serif" style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 400, letterSpacing: "-0.02em", color: T.text }}>У що ми віримо</h2>
                    </motion.div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                        {values.map((v, i) => (
                            <motion.div key={v.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                                        style={{ padding: 32, borderRadius: 18, border: `1px solid ${T.border}`, background: T.card, textAlign: "center" }}>
                                <div style={{ width: 50, height: 50, borderRadius: 14, background: v.bg, border: `1px solid ${v.color}20`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
                                    <v.icon size={22} style={{ color: v.color }} />
                                </div>
                                <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 8, color: T.text }}>{v.title}</h3>
                                <p style={{ fontSize: 14, lineHeight: 1.7, color: T.muted }}>{v.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Timeline ── */}
            <section style={{ padding: "100px 24px", background: T.card, borderTop: `1px solid ${T.border}` }}>
                <div style={{ maxWidth: 800, margin: "0 auto" }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 64 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: T.accent, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Наш шлях</div>
                        <h2 className="serif" style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 400, letterSpacing: "-0.02em", color: T.text }}>Від ідеї до реальності</h2>
                    </motion.div>
                    <div style={{ position: "relative" }}>
                        <div style={{ position: "absolute", left: 31, top: 8, bottom: 8, width: 1, background: `linear-gradient(180deg, ${T.accent}, #0ea5e9)`, opacity: 0.15 }} />
                        {milestones.map((m, i) => (
                            <motion.div key={`${m.year}-${m.month}`} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                                        style={{ display: "flex", gap: 24, padding: "8px 0 32px", position: "relative" }}>
                                <div style={{ width: 64, height: 64, borderRadius: 18, background: i === milestones.length - 1 ? T.gradient : `${T.accentLight}`, border: `1px solid ${T.accentMid}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, zIndex: 1, boxShadow: i === milestones.length - 1 ? "0 4px 20px rgba(109,40,217,0.25)" : "none" }}>
                                    <m.icon size={18} style={{ color: i === milestones.length - 1 ? "#fff" : T.accent }} />
                                </div>
                                <div style={{ paddingTop: 12 }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: T.accent, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>{m.month} {m.year}</div>
                                    <h3 style={{ fontWeight: 700, fontSize: 20, letterSpacing: "-0.02em", marginBottom: 6, color: T.text }}>{m.title}</h3>
                                    <p style={{ fontSize: 14, lineHeight: 1.7, color: T.muted }}>{m.desc}</p>
                                    {i === milestones.length - 1 && (
                                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10, padding: "4px 12px", borderRadius: 100, background: T.accentLight, fontSize: 12, fontWeight: 600, color: T.accent }}>
                                            <CheckCircleIcon size={12} /> Зараз
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Team ── */}
            <section id="team" style={{ padding: "100px 24px", background: T.dark }}>
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 60 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Команда</div>
                        <h2 className="serif" style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 400, letterSpacing: "-0.02em", color: "#fff" }}>Люди за Univa</h2>
                        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.35)", marginTop: 12, maxWidth: 440, margin: "12px auto 0" }}>Шестеро з різних куточків України з однією метою.</p>
                    </motion.div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                        {team.map((t, i) => (
                            <motion.div key={t.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                                        className="team-card" style={{ padding: 28, borderRadius: 20, border: `1px solid ${T.darkBorder}`, background: "rgba(255,255,255,0.02)", position: "relative", overflow: "hidden", cursor: "default" }}>
                                <div style={{ width: 60, height: 60, borderRadius: 18, background: t.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: "#fff", marginBottom: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.3)", fontFamily: "monospace" }}>
                                    {t.avatar}
                                </div>
                                <div style={{ fontWeight: 600, fontSize: 15, color: "#f1f0ee", marginBottom: 3 }}>{t.name}</div>
                                <div style={{ fontSize: 12, color: "#a78bfa", marginBottom: 10, fontWeight: 500 }}>{t.role}</div>
                                <div className="team-bio" style={{ fontSize: 12, color: T.darkMuted, lineHeight: 1.65, marginBottom: 12 }}>{t.bio}</div>
                                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 100, background: "rgba(255,255,255,0.05)", fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>
                                    {t.focus}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Testimonials ── */}
            <section style={{ padding: "100px 24px", background: T.bg }}>
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 60 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: T.accent, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Відгуки</div>
                        <h2 className="serif" style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 400, letterSpacing: "-0.02em", color: T.text }}>Студенти говорять</h2>
                    </motion.div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
                        {testimonials.map((t, i) => (
                            <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                                        className="testimonial-card" style={{ padding: 32, borderRadius: 20, border: `1px solid ${T.border}`, background: T.card, transition: "box-shadow 0.25s ease" }}>
                                <QuoteIcon size={24} style={{ color: T.accentMid, marginBottom: 16 }} />
                                <p style={{ fontSize: 15, lineHeight: 1.75, color: T.text, marginBottom: 24, fontStyle: "italic" }}>"{t.text}"</p>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>{t.name}</div>
                                        <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{t.university}</div>
                                        <div style={{ fontSize: 11, color: T.muted }}>{t.program}</div>
                                    </div>
                                    <div style={{ display: "flex", gap: 2 }}>
                                        {Array.from({ length: t.rating }).map((_, j) => (
                                            <StarIcon key={j} size={14} style={{ color: "#f59e0b", fill: "#f59e0b" }} />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section style={{ padding: "100px 24px", background: T.dark, textAlign: "center", borderTop: `1px solid ${T.darkBorder}` }}>
                <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ maxWidth: 560, margin: "0 auto" }}>
                    <div style={{ width: 60, height: 60, borderRadius: 18, background: T.gradient, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 8px 32px rgba(109,40,217,0.35)" }}>
                        <RocketIcon size={26} style={{ color: "#fff" }} />
                    </div>
                    <h2 className="serif" style={{ fontWeight: 400, fontSize: "clamp(28px,4vw,44px)", letterSpacing: "-0.02em", marginBottom: 14, color: "#fff" }}>
                        Приєднуйся до 12 000+ студентів
                    </h2>
                    <p style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", marginBottom: 36, lineHeight: 1.7 }}>
                        Спробуй Univa безкоштовно і переконайся, що навчання може бути організованим і приємним.
                    </p>
                    <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                        <Button asChild style={{ background: T.gradient, border: "none", borderRadius: 10, padding: "14px 32px", fontWeight: 600, fontSize: 15, boxShadow: "0 4px 20px rgba(109,40,217,0.4)" }}>
                            <Link to="/dashboard">Почати безкоштовно <ArrowRightIcon className="size-4 ml-2" /></Link>
                        </Button>
                    </div>
                    <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
                        {["Без кредитної картки", "Безкоштовно назавжди", "Скасувати у будь-який час"].map(item => (
                            <div key={item} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
                                <CheckCircleIcon size={13} style={{ color: "#10b981" }} /> {item}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </section>

            <LandingFooter />
        </div>
    )
}