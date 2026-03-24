import React, { useRef } from "react"
import { Link } from "react-router-dom"
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion"
import { ArrowRightIcon, SparklesIcon, UsersIcon, GraduationCapIcon, StarIcon, ChevronDownIcon } from "lucide-react"
import { OrbitHero } from "@/shared/ui/animations/orbit-hero.animations.tsx"
import { T } from "./tokens.ts"

function MagneticBtn({ children, to, href, variant = "primary" }: {
    children: React.ReactNode; to?: string; href?: string; variant?: "primary" | "ghost"
}) {
    const ref = useRef<HTMLDivElement>(null)
    const x = useMotionValue(0), y = useMotionValue(0)
    const sx = useSpring(x, { stiffness: 220, damping: 22 })
    const sy = useSpring(y, { stiffness: 220, damping: 22 })

    const handleMove = (e: React.MouseEvent) => {
        const el = ref.current?.querySelector("a, button") as HTMLElement | null
        if (!el) return
        const r = el.getBoundingClientRect()
        x.set((e.clientX - r.left - r.width / 2) * 0.06)
        y.set((e.clientY - r.top - r.height / 2) * 0.06)
    }

    const isPrimary = variant === "primary"
    const style: React.CSSProperties = {
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: isPrimary ? "14px 28px" : "13px 28px",
        borderRadius: 12, fontWeight: 600, fontSize: 15,
        cursor: "pointer", textDecoration: "none",
        letterSpacing: "-0.02em",
        transition: "box-shadow .2s, transform .15s",
        border: isPrimary ? "none" : `1.5px solid ${T.border}`,
        background: isPrimary ? T.gradient : "rgba(255,255,255,0.8)",
        color: isPrimary ? "#fff" : T.text,
        boxShadow: isPrimary
            ? "0 4px 20px rgba(109,40,217,0.32), 0 1px 0 rgba(255,255,255,0.15) inset"
            : "0 1px 4px rgba(0,0,0,0.06)",
        backdropFilter: isPrimary ? "none" : "blur(12px)",
    }

    const inner = to
        ? <Link to={to} style={style}>{children}</Link>
        : <a href={href} style={style}>{children}</a>

    return (
        <div ref={ref} onMouseMove={handleMove} onMouseLeave={() => { x.set(0); y.set(0) }} style={{ display: "inline-block" }}>
            <motion.div style={{ x: sx, y: sy }}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                {inner}
            </motion.div>
        </div>
    )
}

const statItems = [
    { icon: UsersIcon, val: "10K+", lbl: "Студентів" },
    { icon: GraduationCapIcon, val: "50+", lbl: "Університетів" },
    { icon: StarIcon, val: "4.9★", lbl: "Рейтинг" },
]

export function LandingHero() {
    const { scrollY } = useScroll()
    const heroY = useTransform(scrollY, [0, 600], [0, -50])
    const heroOpacity = useTransform(scrollY, [0, 450], [1, 0])

    return (
        <section className="relative overflow-hidden" style={{ minHeight: "94vh", display: "flex", alignItems: "center" }}>
            {/* Atmospheric blobs */}
            <div className="pointer-events-none absolute" style={{ top: "-15%", left: "5%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(109,40,217,0.07) 0%, transparent 65%)", filter: "blur(60px)" }} />
            <div className="pointer-events-none absolute" style={{ top: "15%", right: "0%", width: 550, height: 550, borderRadius: "50%", background: "radial-gradient(circle, rgba(79,70,229,0.06) 0%, transparent 65%)", filter: "blur(50px)" }} />
            <div className="pointer-events-none absolute" style={{ bottom: "0%", left: "35%", width: 450, height: 450, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 65%)", filter: "blur(60px)" }} />

            {/* Dot grid */}
            <div className="pointer-events-none absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle, rgba(109,40,217,0.18) 1px, transparent 1px)`,
                backgroundSize: "36px 36px",
                maskImage: "radial-gradient(ellipse 65% 65% at 50% 40%, black 10%, transparent 80%)",
                WebkitMaskImage: "radial-gradient(ellipse 65% 65% at 50% 40%, black 10%, transparent 80%)",
            }} />

            <motion.div style={{ y: heroY, opacity: heroOpacity }} className="w-full relative z-10">
                <div className="mx-auto px-6 lg:px-10 flex flex-col lg:flex-row items-center gap-14 lg:gap-10" style={{ maxWidth: T.maxW }}>
                    {/* Left: Copy */}
                    <div className="flex-1 max-w-[600px] text-center lg:text-left">

                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.45 }}
                            style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 28 }}
                        >
                            <div style={{
                                display: "inline-flex", alignItems: "center", gap: 6,
                                background: T.accentLight,
                                border: `1px solid ${T.accentMid}`,
                                borderRadius: 100, padding: "5px 14px",
                                fontSize: 12, fontWeight: 700, color: T.accent,
                                letterSpacing: "0.06em", textTransform: "uppercase",
                            }}>
                                <motion.div animate={{ rotate: [0, 15, -10, 0] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}>
                                    <SparklesIcon size={11} />
                                </motion.div>
                                Workspace нового покоління
                            </div>
                        </motion.div>

                        {/* Headline */}
                        <motion.h1
                            initial={{ opacity: 0, y: 28 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.07, ease: [0.22, 1, 0.36, 1] }}
                            style={{
                                fontWeight: 900,
                                fontSize: "clamp(44px, 5.5vw, 76px)",
                                lineHeight: 1.03,
                                letterSpacing: "-0.045em",
                                marginBottom: 24,
                                color: T.text,
                            }}
                        >
                            Навчання без{" "}
                            <span style={{ position: "relative", display: "inline-block" }}>
                                <span style={{
                                    background: T.gradient,
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                }}>
                                    хаосу
                                </span>
                                {/* underline squiggle */}
                                <motion.svg
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 0.8, delay: 0.7 }}
                                    style={{ position: "absolute", bottom: -8, left: 0, width: "100%", overflow: "visible" }}
                                    height="10" viewBox="0 0 200 10" fill="none"
                                    preserveAspectRatio="none"
                                >
                                    <motion.path
                                        d="M2 6 Q25 2 50 6 Q75 10 100 6 Q125 2 150 6 Q175 10 198 6"
                                        stroke="url(#ugrad)" strokeWidth="2.5" strokeLinecap="round" fill="none"
                                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                                        transition={{ duration: 0.9, delay: 0.75 }}
                                    />
                                    <defs>
                                        <linearGradient id="ugrad" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
                                            <stop offset="0%" stopColor="#6d28d9" />
                                            <stop offset="100%" stopColor="#4f46e5" />
                                        </linearGradient>
                                    </defs>
                                </motion.svg>
                            </span>
                            {" "}та стресу
                        </motion.h1>

                        {/* Subhead */}
                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.55, delay: 0.18 }}
                            style={{ fontSize: 17.5, lineHeight: 1.72, color: T.muted, marginBottom: 36, fontWeight: 400, maxWidth: 480, letterSpacing: "-0.01em" }}
                            className="mx-auto lg:mx-0"
                        >
                            Univa об'єднує розклад, файли, конспекти, чати та AI-помічника
                            в єдиній екосистемі.{" "}
                            <strong style={{ color: T.text, fontWeight: 600 }}>Один простір — замість п'яти різних застосунків.</strong>
                        </motion.p>

                        {/* CTAs */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.27 }}
                            className="flex flex-wrap gap-3 justify-center lg:justify-start"
                        >
                            <MagneticBtn to="/dashboard" variant="primary">
                                Спробувати безкоштовно <ArrowRightIcon size={15} />
                            </MagneticBtn>
                            <MagneticBtn href="#можливості" variant="ghost">
                                Дізнатися більше
                            </MagneticBtn>
                        </motion.div>

                        {/* Stats */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.55 }}
                            style={{ marginTop: 44 }}
                            className="flex gap-0 justify-center lg:justify-start"
                        >
                            {statItems.map((s, i) => (
                                <div key={s.lbl} style={{
                                    paddingRight: 28, marginRight: 28,
                                    borderRight: i < statItems.length - 1 ? `1px solid ${T.border}` : "none",
                                }}>
                                    <div style={{ fontWeight: 800, fontSize: 23, letterSpacing: "-0.04em", color: T.text }}>{s.val}</div>
                                    <div style={{ fontSize: 12, color: T.muted, marginTop: 2, letterSpacing: "0.02em" }}>{s.lbl}</div>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Right: Visual */}
                    <OrbitHero />
                </div>
            </motion.div>

            {/* Scroll hint */}
            <motion.div
                animate={{ y: [0, 7, 0] }}
                transition={{ repeat: Infinity, duration: 2.8 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
                style={{ color: T.faint }}
            >
                <span style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>Далі</span>
                <ChevronDownIcon size={16} />
            </motion.div>
        </section>
    )
}