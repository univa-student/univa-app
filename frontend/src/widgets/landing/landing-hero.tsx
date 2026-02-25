import { useRef } from "react"
import { Link } from "react-router-dom"
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion"
import {
    ArrowRightIcon, SparklesIcon, UsersIcon, GraduationCapIcon,
    StarIcon, ChevronDownIcon,
} from "lucide-react"
import { OrbitHero } from "@/shared/ui/animations/orbit-hero.animations.tsx"
import { T } from "./tokens"

/* ── Magnetic Button ───────────────────────────────── */
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
        padding: "15px 30px", borderRadius: 100, fontWeight: 600, fontSize: 16,
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

/* ── Hero Section ──────────────────────────────────── */
export function LandingHero() {
    const { scrollY } = useScroll()
    const heroY = useTransform(scrollY, [0, 600], [0, -60])
    const heroOpacity = useTransform(scrollY, [0, 500], [1, 0])

    return (
        <section className="relative overflow-hidden" style={{ minHeight: "92vh", display: "flex", alignItems: "center" }}>
            <div className="pointer-events-none absolute" style={{ top: "-10%", left: "10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)", filter: "blur(40px)" }} />
            <div className="pointer-events-none absolute" style={{ top: "20%", right: "5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)", filter: "blur(40px)" }} />
            <div className="pointer-events-none absolute" style={{ bottom: "5%", left: "40%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)", filter: "blur(50px)" }} />

            <div className="pointer-events-none absolute inset-0" style={{
                backgroundImage: `linear-gradient(${T.border}40 1px, transparent 1px), linear-gradient(90deg, ${T.border}40 1px, transparent 1px)`,
                backgroundSize: "80px 80px",
                maskImage: "radial-gradient(ellipse 60% 60% at 50% 45%, black 15%, transparent 75%)",
            }} />

            <motion.div style={{ y: heroY, opacity: heroOpacity }} className="w-full relative z-10">
                <div className="mx-auto px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12 lg:gap-16" style={{ maxWidth: T.maxW }}>
                    <div className="flex-1 max-w-[580px] text-center lg:text-left">
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
                            style={{ fontWeight: 800, fontSize: "clamp(42px, 5vw, 72px)", lineHeight: 1.08, letterSpacing: "-0.035em", marginBottom: 22 }}
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
                            style={{ fontSize: 18, lineHeight: 1.7, color: T.muted, marginBottom: 36, fontWeight: 400, maxWidth: 500 }}
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
                                    <div style={{ fontWeight: 800, fontSize: 22 }}>{s.val}</div>
                                    <div style={{ fontSize: 13, color: T.muted, marginTop: 2 }}>{s.lbl}</div>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    <OrbitHero />
                </div>
            </motion.div>

            <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center"
                style={{ color: T.faint }}
            >
                <ChevronDownIcon size={20} />
            </motion.div>
        </section>
    )
}
