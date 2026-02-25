import { motion } from "framer-motion"
import { UsersIcon, CalendarDaysIcon, SparklesIcon } from "lucide-react"
import { T } from "./tokens"

const howItWorks = [
    { step: "01", title: "Створи аккаунт", desc: "Зареєструйся за 30 секунд через Google або email. Обери свій університет та факультет.", icon: UsersIcon },
    { step: "02", title: "Додай розклад", desc: "Імпортуй розклад автоматично або додай пари вручну. AI підкаже оптимальний час для навчання.", icon: CalendarDaysIcon },
    { step: "03", title: "Свій простір", desc: "Запроси одногрупників, завантаж матеріали, створи to-do списки — і навчання стане організованим.", icon: SparklesIcon },
]

export function LandingHowItWorks() {
    return (
        <section id="як-це-працює" style={{
            padding: "120px 24px",
            background: T.dark,
            position: "relative",
            overflow: "hidden",
        }}>
            <div className="pointer-events-none absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 20% 50%, rgba(124,58,237,0.06) 0%, transparent 50%),
                                  radial-gradient(circle at 80% 50%, rgba(59,130,246,0.05) 0%, transparent 50%)`,
            }} />

            <div style={{ maxWidth: T.maxW, margin: "0 auto", position: "relative" }}>
                <motion.div
                    initial={{ opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{ textAlign: "center", marginBottom: 80 }}
                >
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.accent, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Як це працює</div>
                    <h2 style={{ fontWeight: 800, fontSize: "clamp(30px,4vw,50px)", letterSpacing: "-0.03em", color: "#fff" }}>
                        Три кроки до організованого навчання
                    </h2>
                </motion.div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, position: "relative" }}>
                    <div className="hidden md:block absolute" style={{
                        top: 44, left: "16.66%", right: "16.66%", height: 2,
                        background: `linear-gradient(90deg, ${T.accent}, #6366f1, #3b82f6)`,
                        opacity: 0.3,
                    }}>
                        <motion.div
                            style={{ width: "100%", height: "100%", background: `linear-gradient(90deg, ${T.accent}, #6366f1, #3b82f6)` }}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        />
                    </div>

                    {howItWorks.map((item, i) => (
                        <motion.div
                            key={item.step}
                            initial={{ opacity: 0, y: 32 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            style={{ textAlign: "center", position: "relative", padding: "0 20px" }}
                        >
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                style={{
                                    width: 88, height: 88, borderRadius: 24, margin: "0 auto 28px",
                                    background: `linear-gradient(135deg, ${T.darkCard}, ${T.darkBorder})`,
                                    border: `1px solid ${T.darkBorder}`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    position: "relative",
                                    boxShadow: `0 0 40px rgba(124,58,237,0.08)`,
                                }}
                            >
                                <item.icon size={32} style={{ color: T.accent }} />
                                <div style={{
                                    position: "absolute", top: -8, right: -8,
                                    width: 28, height: 28, borderRadius: 8,
                                    background: T.gradient,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontWeight: 800, fontSize: 11, color: "#fff",
                                    boxShadow: "0 2px 8px rgba(124,58,237,0.4)",
                                }}>
                                    {item.step}
                                </div>
                            </motion.div>

                            <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 10, color: "#fff" }}>{item.title}</h3>
                            <p style={{ fontSize: 15, lineHeight: 1.65, color: T.darkMuted, maxWidth: 280, margin: "0 auto" }}>{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
