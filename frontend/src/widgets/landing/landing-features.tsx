import { motion } from "framer-motion"
import {
    CalendarDaysIcon, FolderOpenIcon, BotIcon,
    MessagesSquareIcon, ListChecksIcon, ShieldCheckIcon,
} from "lucide-react"
import { T } from "./tokens"

const features = [
    { icon: CalendarDaysIcon, title: "Розклад і дедлайни", desc: "Автоматичне відстеження пар, дедлайнів та екзаменів з розумними нагадуваннями. Синхронізація з Google Calendar.", color: "#3b82f6", bg: "#eff6ff", tag: "Планування", span: "col-span-2" },
    { icon: FolderOpenIcon, title: "Файловий менеджер", desc: "PDF, DOCX, презентації — все із швидким пошуком та автоматичною категоризацією по предметах.", color: "#d97706", bg: "#fffbeb", tag: "Сховище", span: "" },
    { icon: BotIcon, title: "AI-помічник", desc: "Генерація конспектів із лекцій, створення тестів, пояснення складних тем. AI знає ваш розклад та матеріали.", color: "#7c3aed", bg: "#f5f3ff", tag: "Інтелект", span: "col-span-2" },
    { icon: MessagesSquareIcon, title: "Групові чати", desc: "Структуровані простори по предметах замість хаосу в Telegram. Опитування, голосування, обмін файлами.", color: "#059669", bg: "#ecfdf5", tag: "Комунікація", span: "" },
    { icon: ListChecksIcon, title: "Органайзер", desc: "Персональний планер із to-do списками, нотатками та автоматичним трекером прогресу навчання.", color: "#e11d48", bg: "#fff1f2", tag: "Продуктивність", span: "" },
    { icon: ShieldCheckIcon, title: "Безпека даних", desc: "Наскрізне шифрування, дата-центр в ЄС, повна конфіденційність ваших матеріалів.", color: "#0891b2", bg: "#ecfeff", tag: "Безпека", span: "" },
]

export function LandingFeatures() {
    return (
        <section id="можливості" style={{ padding: "120px 24px", maxWidth: T.maxW, margin: "0 auto" }}>
            <motion.div
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                style={{ textAlign: "center", marginBottom: 72 }}
            >
                <div style={{ fontSize: 12, fontWeight: 700, color: T.accent, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Можливості</div>
                <h2 style={{ fontWeight: 800, fontSize: "clamp(30px,4vw,50px)", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                    Все, що потрібно студенту
                </h2>
                <p style={{ fontSize: 17, color: T.muted, marginTop: 14, maxWidth: 480, margin: "14px auto 0" }}>
                    Інструменти, спроєктовані спеціально для навчального процесу
                </p>
            </motion.div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                {features.map((f, i) => {
                    const isWide = f.span === "col-span-2"
                    return (
                        <motion.div
                            key={f.title}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.08 }}
                            whileHover={{ scale: 1.02, y: -4 }}
                            style={{
                                gridColumn: isWide ? "span 2" : "span 1",
                                padding: isWide ? "36px 40px" : "32px 28px",
                                borderRadius: 22,
                                border: `1px solid ${T.border}`,
                                background: T.card,
                                position: "relative",
                                overflow: "hidden",
                                cursor: "default",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                                transition: "box-shadow 0.3s",
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 40px ${f.color}18, 0 2px 8px rgba(0,0,0,0.06)`
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"
                            }}
                        >
                            <div className="pointer-events-none absolute" style={{
                                bottom: -40, right: -40, width: 180, height: 180, borderRadius: "50%",
                                background: `radial-gradient(circle, ${f.color}10 0%, transparent 70%)`,
                            }} />

                            <div style={{
                                width: 48, height: 48, borderRadius: 14, marginBottom: 20,
                                background: f.bg, border: `1px solid ${f.color}25`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                boxShadow: `0 0 0 4px ${f.color}08`,
                            }}>
                                <f.icon size={22} style={{ color: f.color }} />
                            </div>

                            <span style={{
                                display: "inline-block", background: `${f.color}12`, color: f.color,
                                borderRadius: 6, padding: "3px 10px", fontSize: 10, fontWeight: 700,
                                letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 12,
                            }}>
                                {f.tag}
                            </span>

                            <h3 style={{ fontWeight: 700, fontSize: isWide ? 22 : 18, letterSpacing: "-0.02em", marginBottom: 8, color: T.text }}>
                                {f.title}
                            </h3>
                            <p style={{ fontSize: 15, lineHeight: 1.65, color: T.muted, maxWidth: isWide ? 420 : 300 }}>
                                {f.desc}
                            </p>
                        </motion.div>
                    )
                })}
            </div>
        </section>
    )
}
