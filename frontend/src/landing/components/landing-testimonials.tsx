// LandingTestimonials.tsx — Enhanced testimonial marquee

import { motion } from "framer-motion"
import { StarIcon, QuoteIcon } from "lucide-react"
import { T } from "./tokens.ts"

const testimonials = [
    { name: "Олена К.", role: "3 курс, КНУ ім. Шевченка", text: "Нарешті все в одному місці! Не треба гортати 10 чатів у пошуках розкладу чи конспекту.", avatar: "ОК", color: "#7c3aed" },
    { name: "Максим Р.", role: "2 курс, КПІ", text: "AI-помічник генерує мені конспекти з лекцій за хвилину. Заощаджую годину щодня.", avatar: "МР", color: "#2563eb" },
    { name: "Анна Д.", role: "4 курс, ЛНУ ім. Франка", text: "Групові чати по предметах — це геніально. Telegram для навчання більше не потрібен.", avatar: "АД", color: "#059669" },
    { name: "Ігор В.", role: "1 курс, НУ ЛП", text: "Файловий менеджер — просто космос. Все автоматично сортується по предметах, нічого не губиться.", avatar: "ІВ", color: "#d97706" },
    { name: "Марія С.", role: "3 курс, ОНУ ім. Мечникова", text: "Дедлайни тепер не лякають — бачу все на одній панелі і встигаю все вчасно здати.", avatar: "МС", color: "#e11d48" },
    { name: "Дмитро Л.", role: "2 курс, ХНУ ім. Каразіна", text: "Органайзер допомагає структурувати навчання. Мої оцінки реально покращились за семестр.", avatar: "ДЛ", color: "#0891b2" },
]

function Card({ t }: { t: typeof testimonials[0] }) {
    return (
        <div className="testimonial-card" style={{
            width: 320, maxWidth: "calc(100vw - 48px)", flexShrink: 0, padding: "24px 26px", borderRadius: 20,
            border: `1px solid rgba(255,255,255,0.06)`,
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(12px)",
            transition: "transform 0.28s cubic-bezier(0.22,1,0.36,1), border-color 0.25s",
        }}
             onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.04) translateY(-3px)"; (e.currentTarget as HTMLElement).style.borderColor = `${t.color}40` }}
             onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)" }}
        >
            <QuoteIcon size={16} style={{ color: `${t.color}`, opacity: 0.6, marginBottom: 12 }} />

            <div style={{ display: "flex", gap: 2, marginBottom: 12 }}>
                {[1, 2, 3, 4, 5].map(s => <StarIcon key={s} size={12} style={{ color: "#f59e0b", fill: "#f59e0b" }} />)}
            </div>

            <p style={{ fontSize: 14, lineHeight: 1.68, color: "rgba(255,255,255,0.72)", marginBottom: 20, letterSpacing: "-0.005em" }}>
                {t.text}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                    width: 36, height: 36, borderRadius: 11,
                    background: `linear-gradient(135deg, ${t.color}cc, ${t.color}88)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: 12, color: "#fff",
                    letterSpacing: "-0.01em",
                }}>
                    {t.avatar}
                </div>
                <div>
                    <div style={{ fontWeight: 650, fontSize: 13, color: "#fff", letterSpacing: "-0.02em" }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: T.darkMuted, marginTop: 1 }}>{t.role}</div>
                </div>
            </div>
        </div>
    )
}

function Marquee({ items, reverse = false, speed = 40 }: { items: typeof testimonials; reverse?: boolean; speed?: number }) {
    const doubled = [...items, ...items]
    return (
        <div style={{
            overflow: "hidden",
            maskImage: "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}>
            <motion.div style={{ display: "flex", gap: 16, width: "max-content" }}
                        animate={{ x: reverse ? ["0%", "-50%"] : ["-50%", "0%"] }}
                        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
            >
                {doubled.map((t, i) => <Card key={`${t.name}-${i}`} t={t} />)}
            </motion.div>
        </div>
    )
}

export function LandingTestimonials() {
    return (
        <section id="відгуки" style={{ padding: "130px 0", background: T.dark, position: "relative", overflow: "hidden" }}>
            <style>{`
                .testimonials-mobile-list {
                    display: none;
                }

                @media (max-width: 768px) {
                    .testimonials-marquees {
                        display: none !important;
                    }

                    .testimonials-mobile-list {
                        display: grid;
                        gap: 14px;
                        padding: 0 24px;
                        max-width: 520px;
                        margin: 0 auto;
                    }

                    .testimonial-card {
                        width: 100% !important;
                        max-width: 100% !important;
                    }
                }
            `}</style>
            <div className="pointer-events-none absolute" style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 900, height: 600, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(109,40,217,0.05) 0%, transparent 60%)", filter: "blur(40px)" }} />

            <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        style={{ textAlign: "center", marginBottom: 64, padding: "0 24px", position: "relative" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(109,40,217,0.15)", border: "1px solid rgba(109,40,217,0.3)", borderRadius: 100, padding: "5px 14px", marginBottom: 16, fontSize: 11, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Відгуки
                </div>
                <h2 style={{ fontWeight: 900, fontSize: "clamp(30px,4vw,52px)", letterSpacing: "-0.04em", color: "#fff", lineHeight: 1.05 }}>
                    Що кажуть студенти
                </h2>
                <p style={{ fontSize: 16, color: T.darkMuted, marginTop: 12, letterSpacing: "-0.01em" }}>
                    Тисячі студентів вже навчаються розумніше
                </p>
            </motion.div>

            <div className="testimonials-marquees" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <Marquee items={testimonials.slice(0, 3)} speed={42} />
                <Marquee items={[...testimonials].reverse().slice(0, 3)} reverse speed={48} />
            </div>

            <div className="testimonials-mobile-list">
                {testimonials.slice(0, 3).map((testimonial) => (
                    <Card key={testimonial.name} t={testimonial} />
                ))}
            </div>
        </section>
    )
}
