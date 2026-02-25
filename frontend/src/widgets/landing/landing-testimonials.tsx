import { motion } from "framer-motion"
import { StarIcon } from "lucide-react"
import { T } from "./tokens"

const testimonials = [
    { name: "Олена К.", role: "3 курс, КНУ ім. Шевченка", text: "Нарешті все в одному місці! Не треба гортати 10 чатів у пошуках розкладу чи конспекту.", avatar: "ОК" },
    { name: "Максим Р.", role: "2 курс, КПІ", text: "AI-помічник генерує мені конспекти з лекцій за хвилину. Заощаджую годину щодня.", avatar: "МР" },
    { name: "Анна Д.", role: "4 курс, ЛНУ ім. Франка", text: "Групові чати по предметах — це геніально. Telegram для навчання більше не потрібен.", avatar: "АД" },
    { name: "Ігор В.", role: "1 курс, НУ ЛП", text: "Файловий менеджер — просто космос. Все автоматично сортується по предметах, нічого не губиться.", avatar: "ІВ" },
    { name: "Марія С.", role: "3 курс, ОНУ ім. Мечникова", text: "Дедлайни тепер не лякають — бачу все на одній панелі і встигаю все вчасно здати.", avatar: "МС" },
    { name: "Дмитро Л.", role: "2 курс, ХНУ ім. Каразіна", text: "Органайзер допомагає структурувати навчання. Мої оцінки реально покращились за семестр.", avatar: "ДЛ" },
]

function MarqueeRow({ items, reverse = false, speed = 35 }: {
    items: typeof testimonials; reverse?: boolean; speed?: number
}) {
    const doubled = [...items, ...items]
    return (
        <div style={{
            overflow: "hidden", position: "relative",
            maskImage: "linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)",
        }}>
            <motion.div
                style={{ display: "flex", gap: 20, width: "max-content" }}
                animate={{ x: reverse ? ["0%", "-50%"] : ["-50%", "0%"] }}
                transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
            >
                {doubled.map((t, i) => (
                    <div
                        key={`${t.name}-${i}`}
                        style={{
                            width: 340, flexShrink: 0, padding: 28, borderRadius: 20,
                            border: `1px solid ${T.darkBorder}`,
                            background: T.darkCard,
                            transition: "transform 0.3s, border-color 0.3s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.borderColor = T.accent }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.borderColor = T.darkBorder }}
                    >
                        <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
                            {[1, 2, 3, 4, 5].map(s => (
                                <StarIcon key={s} size={13} style={{ color: "#f59e0b", fill: "#f59e0b" }} />
                            ))}
                        </div>
                        <p style={{ fontSize: 14, lineHeight: 1.65, color: "#e5e7eb", marginBottom: 20, fontStyle: "italic" }}>
                            &ldquo;{t.text}&rdquo;
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: 10,
                                background: "linear-gradient(135deg, #7c3aed, #6366f1)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontWeight: 700, fontSize: 12, color: "#fff",
                            }}>
                                {t.avatar}
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 13, color: "#fff" }}>{t.name}</div>
                                <div style={{ fontSize: 11, color: T.darkMuted }}>{t.role}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </motion.div>
        </div>
    )
}

export function LandingTestimonials() {
    return (
        <section id="відгуки" style={{
            padding: "120px 0",
            background: T.dark,
            position: "relative",
            overflow: "hidden",
        }}>
            <div className="pointer-events-none absolute" style={{
                top: "50%", left: "50%", transform: "translate(-50%,-50%)",
                width: 800, height: 600, borderRadius: "50%",
                background: "radial-gradient(ellipse, rgba(124,58,237,0.04) 0%, transparent 60%)",
            }} />

            <motion.div
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                style={{ textAlign: "center", marginBottom: 56, padding: "0 24px" }}
            >
                <div style={{ fontSize: 12, fontWeight: 700, color: T.accent, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Відгуки</div>
                <h2 style={{ fontWeight: 800, fontSize: "clamp(30px,4vw,50px)", letterSpacing: "-0.03em", color: "#fff" }}>
                    Що кажуть студенти
                </h2>
            </motion.div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <MarqueeRow items={testimonials.slice(0, 3)} speed={40} />
                <MarqueeRow items={testimonials.slice(3, 6)} reverse speed={45} />
            </div>
        </section>
    )
}
