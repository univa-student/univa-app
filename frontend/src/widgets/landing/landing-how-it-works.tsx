// LandingHowItWorks.tsx — Enhanced step-by-step section

import { motion } from "framer-motion"
import { UsersIcon, CalendarDaysIcon, SparklesIcon } from "lucide-react"
import { T } from "./tokens"

const steps = [
    { n: "01", title: "Створи акаунт", desc: "Зареєструйся за 30 секунд через Google або email. Обери свій університет та факультет.", icon: UsersIcon, accent: "#6d28d9" },
    { n: "02", title: "Додай розклад", desc: "Імпортуй розклад автоматично або додай пари вручну. AI підкаже оптимальний час для навчання.", icon: CalendarDaysIcon, accent: "#4f46e5" },
    { n: "03", title: "Свій простір", desc: "Запроси одногрупників, завантаж матеріали, створи to-do — навчання стане організованим.", icon: SparklesIcon, accent: "#2563eb" },
]

export function LandingHowItWorks() {
    return (
        <section id="як-це-працює" style={{
            padding: "130px 24px",
            background: T.dark,
            position: "relative",
            overflow: "hidden",
        }}>
            {/* Noise overlay */}
            <div className="pointer-events-none absolute inset-0" style={{ opacity: 0.025, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")" }} />

            {/* Gradient blobs */}
            <div className="pointer-events-none absolute" style={{ top: "20%", left: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(109,40,217,0.07) 0%, transparent 60%)", filter: "blur(60px)" }} />
            <div className="pointer-events-none absolute" style={{ bottom: "10%", right: "5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(79,70,229,0.07) 0%, transparent 60%)", filter: "blur(50px)" }} />

            <div style={{ maxWidth: T.maxW, margin: "0 auto", position: "relative" }}>
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                            style={{ textAlign: "center", marginBottom: 90 }}>
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        background: "rgba(109,40,217,0.15)", border: "1px solid rgba(109,40,217,0.3)",
                        borderRadius: 100, padding: "5px 14px", marginBottom: 16,
                        fontSize: 11, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.08em", textTransform: "uppercase",
                    }}>Як це працює</div>
                    <h2 style={{ fontWeight: 900, fontSize: "clamp(30px,4vw,52px)", letterSpacing: "-0.04em", color: "#fff", lineHeight: 1.05 }}>
                        Три кроки до{" "}
                        <span style={{ background: "linear-gradient(135deg, #a78bfa, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                            організованого навчання
                        </span>
                    </h2>
                </motion.div>

                {/* Steps */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, position: "relative" }}>
                    {/* Connecting line */}
                    <div className="hidden lg:block absolute" style={{ top: 52, left: "18%", right: "18%", height: 1, background: "linear-gradient(90deg, transparent, rgba(109,40,217,0.4), rgba(79,70,229,0.4), transparent)" }} />

                    {steps.map((s, i) => (
                        <motion.div key={s.n}
                                    initial={{ opacity: 0, y: 32 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                    style={{ textAlign: "center", padding: "0 16px" }}
                        >
                            {/* Icon circle */}
                            <motion.div whileHover={{ scale: 1.07 }} transition={{ type: "spring", stiffness: 300 }}
                                        style={{
                                            width: 100, height: 100, borderRadius: 28, margin: "0 auto 32px",
                                            background: "rgba(255,255,255,0.04)",
                                            border: "1px solid rgba(255,255,255,0.08)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            position: "relative",
                                            boxShadow: `0 0 50px ${s.accent}12`,
                                        }}>
                                <s.icon size={36} style={{ color: "#a78bfa" }} strokeWidth={1.5} />

                                {/* Step badge */}
                                <div style={{
                                    position: "absolute", top: -10, right: -10,
                                    width: 30, height: 30, borderRadius: 9,
                                    background: `linear-gradient(135deg, ${s.accent}, #4f46e5)`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontWeight: 800, fontSize: 11, color: "#fff",
                                    boxShadow: `0 2px 10px ${s.accent}50`,
                                    letterSpacing: "-0.02em",
                                }}>
                                    {s.n}
                                </div>
                            </motion.div>

                            <h3 style={{ fontWeight: 750, fontSize: 21, marginBottom: 12, color: "#fff", letterSpacing: "-0.03em" }}>{s.title}</h3>
                            <p style={{ fontSize: 14.5, lineHeight: 1.7, color: T.darkMuted, maxWidth: 280, margin: "0 auto", letterSpacing: "-0.005em" }}>{s.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}