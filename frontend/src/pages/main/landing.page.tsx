import { useState, useEffect, useRef } from "react"
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from "framer-motion"
import { Link } from "react-router-dom"
import usePageTitle from "@/shared/hooks/usePageTitle"
import { GOOGLE_FONTS_URL } from "@/shared/config/app.config"
import { Button } from "@/shared/shadcn/ui/button"
import logoConfig from "@/app/config/logo.config"
import {
    ArrowRightIcon,
    CalendarDaysIcon,
    FolderOpenIcon,
    BotIcon,
    MessagesSquareIcon,
    ListChecksIcon,
    ShieldCheckIcon,
    SparklesIcon,
    GraduationCapIcon,
    UsersIcon,
    StarIcon,
    ClockIcon,
    FileTextIcon,
    BrainIcon,
    ChevronDownIcon,
    type LucideIcon,
} from "lucide-react"

/* ═══════════════════════════════════════════════════════════════
   TOKENS  — all palette values live here so the page works
   on any background; we use neutral grays + violet as accent.
   ═══════════════════════════════════════════════════════════ */
const T = {
    bg: "#fafbfc",
    card: "#ffffff",
    text: "#111827",
    muted: "#6b7280",
    faint: "#d1d5db",
    border: "#e5e7eb",
    accent: "#7c3aed",       // violet-600
    accentLight: "#ede9fe",  // violet-50
    accentMid: "#c4b5fd",    // violet-300
    gradient: "linear-gradient(135deg,#7c3aed,#6366f1,#3b82f6)",
}

/* ═══════════════════════════════════════════════════════════════
   ORBIT  — pure CSS animation (one element per icon, no canvas,
   no RAF, no duplicate render loops = buttery smooth).
   ═══════════════════════════════════════════════════════════ */
interface OrbitIconData {
    Icon: LucideIcon
    label: string
    color: string
    bg: string
    border: string
    radius: number   // orbit radius px
    duration: number  // seconds per revolution
    startAngle: number // degrees
    size: number      // box px
}

const orbitIcons: OrbitIconData[] = [
    { Icon: CalendarDaysIcon, label: "Розклад", color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe", radius: 155, duration: 20, startAngle: 0, size: 46 },
    { Icon: BotIcon, label: "AI", color: "#7c3aed", bg: "#f5f3ff", border: "#c4b5fd", radius: 130, duration: 24, startAngle: 45, size: 50 },
    { Icon: MessagesSquareIcon, label: "Чати", color: "#059669", bg: "#ecfdf5", border: "#a7f3d0", radius: 175, duration: 28, startAngle: 90, size: 42 },
    { Icon: ListChecksIcon, label: "Органайзер", color: "#e11d48", bg: "#fff1f2", border: "#fecdd3", radius: 140, duration: 22, startAngle: 135, size: 44 },
    { Icon: FolderOpenIcon, label: "Файли", color: "#d97706", bg: "#fffbeb", border: "#fde68a", radius: 165, duration: 26, startAngle: 180, size: 42 },
    { Icon: ClockIcon, label: "Дедлайни", color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc", radius: 185, duration: 30, startAngle: 225, size: 40 },
    { Icon: FileTextIcon, label: "Конспекти", color: "#ea580c", bg: "#fff7ed", border: "#fed7aa", radius: 145, duration: 18, startAngle: 270, size: 42 },
    { Icon: BrainIcon, label: "Навчання", color: "#db2777", bg: "#fdf2f8", border: "#fbcfe8", radius: 160, duration: 32, startAngle: 315, size: 44 },
]

function OrbitHero() {
    return (
        <div className="relative" style={{ width: 420, height: 420 }}>
            {/* Decorative rings */}
            {[120, 160, 200].map(r => (
                <div
                    key={r}
                    className="absolute rounded-full"
                    style={{
                        width: r * 2, height: r * 2,
                        top: 210 - r, left: 210 - r,
                        border: `1px dashed ${T.faint}`,
                        opacity: 0.5,
                    }}
                />
            ))}

            {/* Subtle glow */}
            <div className="absolute" style={{
                width: 200, height: 200, top: 110, left: 110,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
                filter: "blur(20px)",
            }} />

            {/* Center logo */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6, type: "spring", bounce: 0.3 }}
                className="absolute z-10 flex items-center justify-center"
                style={{
                    width: 80, height: 80,
                    top: 170, left: 170,
                    borderRadius: 20,
                    background: T.card,
                    border: `1px solid ${T.border}`,
                    boxShadow: "0 8px 40px rgba(124,58,237,0.15), 0 2px 12px rgba(0,0,0,0.06)",
                }}
            >
                <img src={logoConfig["logo-white-no-bg"]} alt="Univa" style={{ height: 38 }} />
            </motion.div>

            {/* Orbiting icons — each is a single div with CSS animation */}
            <style>{`
                @keyframes orbit { from { transform: rotate(var(--start)) translateX(var(--r)) rotate(calc(-1 * var(--start))); }
                                    to   { transform: rotate(calc(var(--start) + 360deg)) translateX(var(--r)) rotate(calc(-1 * (var(--start) + 360deg))); } }
            `}</style>

            {orbitIcons.map((item, i) => (
                <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.08, duration: 0.4 }}
                    className="absolute group"
                    style={{
                        width: item.size, height: item.size,
                        top: 210 - item.size / 2, left: 210 - item.size / 2,
                        "--r": `${item.radius}px`,
                        "--start": `${item.startAngle}deg`,
                        animation: `orbit ${item.duration}s linear infinite`,
                        zIndex: 5,
                    } as React.CSSProperties}
                >
                    <div
                        className="flex items-center justify-center rounded-xl shadow-sm transition-transform group-hover:scale-110"
                        style={{
                            width: "100%", height: "100%",
                            background: item.bg,
                            border: `1px solid ${item.border}`,
                        }}
                    >
                        <item.Icon style={{ width: 18, height: 18, color: item.color }} />
                    </div>
                    {/* Tooltip */}
                    <span
                        className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                        style={{
                            background: T.card,
                            border: `1px solid ${T.border}`,
                            borderRadius: 6, padding: "2px 8px",
                            fontSize: 10, fontWeight: 600,
                            color: item.color,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                        }}
                    >
                        {item.label}
                    </span>
                </motion.div>
            ))}
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════
   MAGNETIC BUTTON — subtle magnetic pull on hover
   ═══════════════════════════════════════════════════════════ */
function MagneticBtn({ children, to, href, variant = "primary" }: {
    children: React.ReactNode; to?: string; href?: string; variant?: "primary" | "ghost"
}) {
    const ref = useRef<HTMLDivElement>(null)
    const x = useMotionValue(0), y = useMotionValue(0)
    const sx = useSpring(x, { stiffness: 200, damping: 20 })
    const sy = useSpring(y, { stiffness: 200, damping: 20 })

    const handleMove = (e: React.MouseEvent) => {
        const el = ref.current?.querySelector("a") as HTMLElement | null
        if (!el) return
        const r = el.getBoundingClientRect()
        x.set((e.clientX - r.left - r.width / 2) * 0.05)
        y.set((e.clientY - r.top - r.height / 2) * 0.05)
    }

    const isPrimary = variant === "primary"
    const style: React.CSSProperties = {
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "14px 28px", borderRadius: 100, fontWeight: 600, fontSize: 15,
        cursor: "pointer", textDecoration: "none", transition: "box-shadow .2s",
        border: isPrimary ? "none" : `1px solid ${T.border}`,
        background: isPrimary ? T.gradient : T.card,
        color: isPrimary ? "#fff" : T.text,
        boxShadow: isPrimary ? "0 6px 24px rgba(124,58,237,0.3), 0 2px 6px rgba(0,0,0,0.08)" : "0 1px 4px rgba(0,0,0,0.04)",
    }

    const inner = to
        ? <Link to={to} style={style}>{children}</Link>
        : <a href={href} style={style}>{children}</a>

    return (
        <div ref={ref} onMouseMove={handleMove} onMouseLeave={() => { x.set(0); y.set(0) }} style={{ display: "inline-block" }}>
            <motion.div style={{ x: sx, y: sy }}>{inner}</motion.div>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════ */
const features = [
    { icon: CalendarDaysIcon, title: "Розклад і дедлайни", desc: "Автоматичне відстеження пар, дедлайнів та екзаменів з розумними нагадуваннями. Синхронізація з Google Calendar.", color: "#3b82f6", bg: "#eff6ff", tag: "Планування" },
    { icon: FolderOpenIcon, title: "Файловий менеджер", desc: "PDF, DOCX, презентації — все із швидким пошуком та автоматичною категоризацією по предметах.", color: "#d97706", bg: "#fffbeb", tag: "Сховище" },
    { icon: BotIcon, title: "AI-помічник", desc: "Генерація конспектів із лекцій, створення тестів, пояснення складних тем. AI знає ваш розклад та матеріали.", color: "#7c3aed", bg: "#f5f3ff", tag: "Інтелект" },
    { icon: MessagesSquareIcon, title: "Групові чати", desc: "Структуровані простори по предметах замість хаосу в Telegram. Опитування, голосування, обмін файлами.", color: "#059669", bg: "#ecfdf5", tag: "Комунікація" },
    { icon: ListChecksIcon, title: "Органайзер", desc: "Персональний планер із to-do списками, нотатками та автоматичним трекером прогресу навчання.", color: "#e11d48", bg: "#fff1f2", tag: "Продуктивність" },
    { icon: ShieldCheckIcon, title: "Безпека даних", desc: "Наскрізне шифрування, дата-центр в ЄС, повна конфіденційність ваших матеріалів.", color: "#0891b2", bg: "#ecfeff", tag: "Безпека" },
]

const howItWorks = [
    { step: "01", title: "Створи аккаунт", desc: "Зареєструйся за 30 секунд через Google або email. Обери свій університет та факультет." },
    { step: "02", title: "Додай розклад", desc: "Імпортуй розклад автоматично або додай пари вручну. AI підкаже оптимальний час для навчання." },
    { step: "03", title: "Свій простір", desc: "Запроси одногрупників, завантаж матеріали, створи to-do списки — і навчання стане організованим." },
]

const testimonials = [
    { name: "Олена К.", role: "3 курс, КНУ ім. Шевченка", text: "Нарешті все в одному місці! Не треба гортати 10 чатів у пошуках розкладу чи конспекту.", avatar: "ОК" },
    { name: "Максим Р.", role: "2 курс, КПІ", text: "AI-помічник генерує мені конспекти з лекцій за хвилину. Заощаджую годину щодня.", avatar: "МР" },
    { name: "Анна Д.", role: "4 курс, ЛНУ ім. Франка", text: "Групові чати по предметах — це геніально. Telegram для навчання більше не потрібен.", avatar: "АД" },
]

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export function LandingPage() {
    usePageTitle("Univa — Студентський workspace")
    const { scrollY } = useScroll()
    const heroY = useTransform(scrollY, [0, 600], [0, -60])
    const heroOpacity = useTransform(scrollY, [0, 500], [1, 0])
    const [activeFeature, setActiveFeature] = useState(0)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const t = setInterval(() => setActiveFeature(p => (p + 1) % features.length), 3500)
        return () => clearInterval(t)
    }, [])

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 40)
        window.addEventListener("scroll", fn, { passive: true })
        return () => window.removeEventListener("scroll", fn)
    }, [])

    return (
        <div style={{ background: T.bg, minHeight: "100vh", color: T.text, overflowX: "hidden" }}>
            {/* Font */}
            <style>{`@import url('${GOOGLE_FONTS_URL}');`}</style>

            {/* ── Navbar ─────────────────────────────────── */}
            <div className="fixed inset-x-0 top-0 z-50 pointer-events-none">
                <div
                    className={`mx-auto max-w-6xl transition-all duration-500 ${scrolled ? "px-4 pt-2.5 sm:px-6" : "px-0 pt-0"
                        }`}
                >
                    <nav
                        className={`pointer-events-auto transition-all duration-500 ${scrolled
                            ? "rounded-2xl shadow-lg shadow-black/[0.04] border"
                            : "border-b"
                            }`}
                        style={{
                            background: scrolled ? "rgba(255,255,255,0.82)" : "rgba(250,251,252,0.85)",
                            backdropFilter: "blur(16px)",
                            borderColor: T.border,
                        }}
                    >
                        <div className="flex h-16 items-center justify-between px-6">
                            <Link to="/" className="flex items-center gap-2.5" style={{ textDecoration: "none" }}>
                                <img src={logoConfig["full-logo-white-no-bg"]} alt="Univa" style={{ height: 26 }} />
                            </Link>

                            <div className="hidden md:flex items-center gap-8" style={{ fontSize: 14, color: T.muted }}>
                                {["Можливості", "Як це працює", "Відгуки"].map((l) => (
                                    <button
                                        key={l}
                                        onClick={() => {
                                            const id = l.toLowerCase().replace(/ /g, "-")
                                            document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
                                        }}
                                        className="transition-colors hover:text-black"
                                        style={{ color: "inherit", background: "transparent" }}
                                    >
                                        {l}
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center gap-3">
                                <Button variant="ghost" size="sm" asChild>
                                    <Link to="/login">Увійти</Link>
                                </Button>
                                <Button
                                    size="sm"
                                    asChild
                                    style={{
                                        background: T.gradient,
                                        border: "none",
                                        boxShadow: "0 2px 12px rgba(124,58,237,0.25)",
                                    }}
                                >
                                    <Link to="/dashboard">
                                        Почати <ArrowRightIcon className="size-3.5 ml-1" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </nav>
                </div>
            </div>

            {/* spacer */}
            <div className="h-[76px]" />

            {/* ── Hero ────────────────────────────────────── */}
            <section className="relative overflow-hidden" style={{ minHeight: "92vh", display: "flex", alignItems: "center" }}>
                {/* Soft gradient blobs */}
                <div className="pointer-events-none absolute" style={{ top: "-10%", left: "10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)", filter: "blur(40px)" }} />
                <div className="pointer-events-none absolute" style={{ top: "20%", right: "5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)", filter: "blur(40px)" }} />
                <div className="pointer-events-none absolute" style={{ bottom: "5%", left: "40%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)", filter: "blur(50px)" }} />

                {/* Subtle grid */}
                <div className="pointer-events-none absolute inset-0" style={{
                    backgroundImage: `linear-gradient(${T.border}40 1px, transparent 1px), linear-gradient(90deg, ${T.border}40 1px, transparent 1px)`,
                    backgroundSize: "80px 80px",
                    maskImage: "radial-gradient(ellipse 60% 60% at 50% 45%, black 15%, transparent 75%)",
                }} />

                <motion.div style={{ y: heroY, opacity: heroOpacity }} className="w-full relative z-10">
                    <div className="mx-auto max-w-6xl px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                        {/* Left */}
                        <div className="flex-1 max-w-[560px] text-center lg:text-left">
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 mb-7"
                                style={{ background: T.accentLight, border: `1px solid ${T.accentMid}`, fontSize: 12, fontWeight: 600, color: T.accent, letterSpacing: "0.04em", textTransform: "uppercase" as const }}
                            >
                                <SparklesIcon size={11} /> Workspace нового покоління
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.08 }}
                                style={{ fontWeight: 800, fontSize: "clamp(40px, 5vw, 68px)", lineHeight: 1.08, letterSpacing: "-0.035em", marginBottom: 22 }}
                            >
                                Навчання без{" "}
                                <span style={{ background: T.gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                                    хаосу та стресу
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.16 }}
                                style={{ fontSize: 18, lineHeight: 1.7, color: T.muted, marginBottom: 36, fontWeight: 400, maxWidth: 480 }}
                                className="mx-auto lg:mx-0"
                            >
                                Univa об'єднує розклад, файли, конспекти, чати та AI-помічника
                                в єдиній екосистемі. Один простір — замість п'яти різних застосунків.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.24 }}
                                className="flex flex-wrap gap-3 justify-center lg:justify-start"
                            >
                                <MagneticBtn to="/dashboard" variant="primary">
                                    Спробувати безкоштовно <ArrowRightIcon size={16} />
                                </MagneticBtn>
                                <MagneticBtn href="#можливості" variant="ghost">
                                    Дізнатися більше
                                </MagneticBtn>
                            </motion.div>

                            {/* Stats */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="flex gap-8 mt-10 justify-center lg:justify-start"
                            >
                                {[
                                    { icon: UsersIcon, val: "10K+", lbl: "Студентів" },
                                    { icon: GraduationCapIcon, val: "50+", lbl: "Університетів" },
                                    { icon: StarIcon, val: "4.9", lbl: "Рейтинг" },
                                ].map(s => (
                                    <div key={s.lbl} className="text-center">
                                        <div style={{ fontWeight: 800, fontSize: 20 }}>{s.val}</div>
                                        <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{s.lbl}</div>
                                    </div>
                                ))}
                            </motion.div>
                        </div>

                        {/* Right — orbit */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="hidden lg:flex flex-shrink-0"
                        >
                            <OrbitHero />
                        </motion.div>
                    </div>
                </motion.div>

                {/* Scroll hint */}
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center"
                    style={{ color: T.faint }}
                >
                    <ChevronDownIcon size={20} />
                </motion.div>
            </section>

            {/* ── Features ────────────────────────────────── */}
            <section id="можливості" style={{ padding: "100px 24px", maxWidth: 1200, margin: "0 auto" }}>
                <motion.div
                    initial={{ opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    style={{ marginBottom: 56 }}
                >
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.accent, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Можливості</div>
                    <h2 style={{ fontWeight: 800, fontSize: "clamp(28px,4vw,48px)", letterSpacing: "-0.03em", lineHeight: 1.1, maxWidth: 460 }}>
                        Все, що потрібно студенту
                    </h2>
                    <p style={{ fontSize: 16, color: T.muted, marginTop: 12, maxWidth: 440 }}>
                        Інструменти, спроєктовані спеціально для навчального процесу
                    </p>
                </motion.div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                    {/* Feature list */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {features.map((f, i) => (
                            <motion.div
                                key={f.title}
                                initial={{ opacity: 0, x: -16 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.06 }}
                                onClick={() => setActiveFeature(i)}
                                style={{
                                    padding: "18px 22px", borderRadius: 14, cursor: "pointer",
                                    background: activeFeature === i ? T.card : "transparent",
                                    border: `1px solid ${activeFeature === i ? T.border : "transparent"}`,
                                    boxShadow: activeFeature === i ? "0 2px 12px rgba(0,0,0,0.04)" : "none",
                                    transition: "all 0.25s",
                                    display: "flex", alignItems: "center", gap: 14,
                                }}
                            >
                                <div style={{
                                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                                    background: f.bg, border: `1px solid ${f.color}30`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    <f.icon size={17} style={{ color: f.color }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: 14, color: activeFeature === i ? T.text : T.muted }}>{f.title}</div>
                                    {activeFeature === i && (
                                        <div style={{ fontSize: 12, color: T.muted, marginTop: 3, lineHeight: 1.5 }}>{f.desc}</div>
                                    )}
                                </div>
                                {activeFeature === i && (
                                    <span style={{ background: `${f.color}18`, color: f.color, borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>{f.tag}</span>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    {/* Feature detail panel */}
                    <div style={{
                        borderRadius: 20, overflow: "hidden",
                        border: `1px solid ${T.border}`,
                        background: T.card,
                        position: "relative", minHeight: 460,
                        boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
                    }}>
                        <AnimatePresence mode="wait">
                            {features.map((f, i) => i === activeFeature && (
                                <motion.div
                                    key={f.title}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -16 }}
                                    transition={{ duration: 0.35 }}
                                    style={{ position: "absolute", inset: 0, padding: 44, display: "flex", flexDirection: "column", justifyContent: "center" }}
                                >
                                    <div style={{ width: 64, height: 64, borderRadius: 18, background: f.bg, border: `1px solid ${f.color}30`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, boxShadow: `0 0 40px ${f.color}12` }}>
                                        <f.icon size={28} style={{ color: f.color }} />
                                    </div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: f.color, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>{f.tag}</div>
                                    <h3 style={{ fontWeight: 800, fontSize: 28, letterSpacing: "-0.02em", marginBottom: 14, color: T.text }}>{f.title}</h3>
                                    <p style={{ fontSize: 15, lineHeight: 1.7, color: T.muted, maxWidth: 360 }}>{f.desc}</p>

                                    <div className="pointer-events-none absolute" style={{ bottom: -50, right: -50, width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${f.color}0a 0%, transparent 70%)` }} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </section>

            {/* ── How it works ────────────────────────────── */}
            <section id="як-це-працює" style={{ padding: "100px 24px", background: T.card, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <motion.div
                        initial={{ opacity: 0, y: 32 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{ textAlign: "center", marginBottom: 64 }}
                    >
                        <div style={{ fontSize: 12, fontWeight: 700, color: T.accent, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Як це працює</div>
                        <h2 style={{ fontWeight: 800, fontSize: "clamp(28px,4vw,48px)", letterSpacing: "-0.03em" }}>
                            Три кроки до організованого навчання
                        </h2>
                    </motion.div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
                        {howItWorks.map((item, i) => (
                            <motion.div
                                key={item.step}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                style={{ textAlign: "center" }}
                            >
                                <div style={{
                                    width: 56, height: 56, borderRadius: 16, margin: "0 auto 20px",
                                    background: T.accentLight, border: `1px solid ${T.accentMid}`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontWeight: 800, fontSize: 20, color: T.accent,
                                }}>
                                    {item.step}
                                </div>
                                <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{item.title}</h3>
                                <p style={{ fontSize: 14, lineHeight: 1.65, color: T.muted, maxWidth: 280, margin: "0 auto" }}>{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Testimonials ────────────────────────────── */}
            <section id="відгуки" style={{ padding: "100px 24px", maxWidth: 1200, margin: "0 auto" }}>
                <motion.div
                    initial={{ opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{ textAlign: "center", marginBottom: 64 }}
                >
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.accent, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Відгуки</div>
                    <h2 style={{ fontWeight: 800, fontSize: "clamp(28px,4vw,48px)", letterSpacing: "-0.03em" }}>
                        Що кажуть студенти
                    </h2>
                </motion.div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={t.name}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            style={{
                                padding: 28, borderRadius: 18,
                                border: `1px solid ${T.border}`,
                                background: T.card,
                                boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
                            }}
                        >
                            <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
                                {[1, 2, 3, 4, 5].map(s => (
                                    <StarIcon key={s} size={14} style={{ color: "#f59e0b", fill: "#f59e0b" }} />
                                ))}
                            </div>
                            <p style={{ fontSize: 14, lineHeight: 1.65, color: T.text, marginBottom: 20, fontStyle: "italic" }}>
                                "{t.text}"
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: 10,
                                    background: T.accentLight, border: `1px solid ${T.accentMid}`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontWeight: 700, fontSize: 12, color: T.accent,
                                }}>
                                    {t.avatar}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</div>
                                    <div style={{ fontSize: 11, color: T.muted }}>{t.role}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── Why Univa ───────────────────────────────── */}
            <section style={{ padding: "100px 24px", background: T.card, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <motion.div
                        initial={{ opacity: 0, y: 32 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{ textAlign: "center", marginBottom: 56 }}
                    >
                        <div style={{ fontSize: 12, fontWeight: 700, color: T.accent, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Чому Univa?</div>
                        <h2 style={{ fontWeight: 800, fontSize: "clamp(28px,4vw,48px)", letterSpacing: "-0.03em" }}>
                            Замість купи різних застосунків
                        </h2>
                    </motion.div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, maxWidth: 800, margin: "0 auto" }}>
                        {[
                            { emoji: "📅", title: "Google Calendar →", desc: "Інтегрований розклад з контекстом предметів" },
                            { emoji: "💬", title: "Telegram-чати →", desc: "Структуровані простори замість хаосу" },
                            { emoji: "📝", title: "Google Docs →", desc: "Конспекти із AI-генерацією та пошуком" },
                            { emoji: "📁", title: "Google Drive →", desc: "Файли з автокатегоризацією по предметах" },
                            { emoji: "✅", title: "Todoist →", desc: "Таски, прив'язані до навчальних дедлайнів" },
                            { emoji: "🤖", title: "ChatGPT →", desc: "AI, що знає твій розклад і матеріали" },
                        ].map((item, i) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.06 }}
                                style={{ display: "flex", alignItems: "start", gap: 14, padding: "16px 0" }}
                            >
                                <span style={{ fontSize: 24 }}>{item.emoji}</span>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{item.title}</div>
                                    <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.5 }}>{item.desc}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ─────────────────────────────────────── */}
            <section style={{ padding: "100px 24px 120px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                <div className="pointer-events-none absolute" style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 400, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(124,58,237,0.06) 0%, transparent 65%)", filter: "blur(30px)" }} />

                <motion.div
                    initial={{ opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{ position: "relative", maxWidth: 560, margin: "0 auto" }}
                >
                    <h2 style={{ fontWeight: 800, fontSize: "clamp(32px,5vw,56px)", letterSpacing: "-0.03em", lineHeight: 1.08, marginBottom: 18 }}>
                        Готовий навчатися{" "}
                        <span style={{ background: T.gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                            ефективніше?
                        </span>
                    </h2>
                    <p style={{ fontSize: 17, color: T.muted, marginBottom: 36, lineHeight: 1.7 }}>
                        Приєднуйся до тисяч студентів, які вже відчули різницю.
                        Безкоштовно, без кредитної картки.
                    </p>
                    <MagneticBtn to="/dashboard" variant="primary">
                        Почати безкоштовно <ArrowRightIcon size={16} />
                    </MagneticBtn>
                </motion.div>
            </section>

            {/* ── Footer ──────────────────────────────────── */}
            <footer style={{ borderTop: `1px solid ${T.border}`, padding: "28px 24px", background: T.card }}>
                <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <img src={logoConfig["logo-black-no-bg"]} alt="Univa" style={{ height: 18 }} />
                        <span style={{ fontWeight: 700, fontSize: 14, color: T.muted }}>Univa</span>
                    </div>
                    <div style={{ display: "flex", gap: 20, fontSize: 13, color: T.muted }}>
                        <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Конфіденційність</a>
                        <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Умови</a>
                        <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Підтримка</a>
                        <span>© {new Date().getFullYear()}</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}
