// LandingFeatures.tsx — Premium bento-grid feature cards

import { motion } from "framer-motion"
import {
    CalendarDaysIcon, FolderOpenIcon, BotIcon,
    MessagesSquareIcon, ListChecksIcon, ShieldCheckIcon,
} from "lucide-react"
import { T } from "./tokens"

const features = [
    {
        icon: CalendarDaysIcon, title: "Розклад і дедлайни",
        desc: "Автоматичне відстеження пар, дедлайнів та екзаменів із розумними нагадуваннями. Синхронізація з Google Calendar.",
        color: "#2563eb", gradFrom: "#dbeafe", gradTo: "#eff6ff", tag: "Планування", wide: true,
    },
    {
        icon: FolderOpenIcon, title: "Файловий менеджер",
        desc: "PDF, DOCX, презентації — все із швидким пошуком та автоматичною категоризацією по предметах.",
        color: "#d97706", gradFrom: "#fef3c7", gradTo: "#fffbeb", tag: "Сховище", wide: false,
    },
    {
        icon: BotIcon, title: "AI-помічник",
        desc: "Генерація конспектів із лекцій, тести, пояснення складних тем. AI знає ваш розклад та матеріали курсу.",
        color: "#7c3aed", gradFrom: "#ede9fe", gradTo: "#f5f3ff", tag: "Інтелект", wide: false,
    },
    {
        icon: MessagesSquareIcon, title: "Групові чати",
        desc: "Структуровані простори по предметах замість хаосу в Telegram. Опитування, голосування, обмін файлами.",
        color: "#059669", gradFrom: "#d1fae5", gradTo: "#ecfdf5", tag: "Комунікація", wide: false,
    },
    {
        icon: ListChecksIcon, title: "Органайзер",
        desc: "Персональний планер із to-do списками та автотрекером прогресу навчання.",
        color: "#e11d48", gradFrom: "#ffe4e6", gradTo: "#fff1f2", tag: "Продуктивність", wide: false,
    },
    {
        icon: ShieldCheckIcon, title: "Безпека даних",
        desc: "Наскрізне шифрування, дата-центр в ЄС, повна конфіденційність матеріалів.",
        color: "#0891b2", gradFrom: "#cffafe", gradTo: "#ecfeff", tag: "Безпека", wide: false,
    },
]

export function LandingFeatures() {
    return (
        <section id="можливості" style={{ padding: "130px 24px", maxWidth: T.maxW, margin: "0 auto" }}>
            {/* Section header */}
            <motion.div
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                style={{ textAlign: "center", marginBottom: 72 }}
            >
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: T.accentLight, border: `1px solid ${T.accentMid}`,
                    borderRadius: 100, padding: "5px 14px", marginBottom: 16,
                    fontSize: 11, fontWeight: 700, color: T.accent, letterSpacing: "0.08em", textTransform: "uppercase",
                }}>
                    Можливості
                </div>
                <h2 style={{
                    fontWeight: 900, fontSize: "clamp(32px,4vw,54px)",
                    letterSpacing: "-0.04em", lineHeight: 1.05, color: T.text,
                }}>
                    Все, що потрібно студенту
                </h2>
                <p style={{ fontSize: 17, color: T.muted, marginTop: 14, maxWidth: 440, margin: "14px auto 0", lineHeight: 1.65, letterSpacing: "-0.01em" }}>
                    Інструменти, спроєктовані спеціально для навчального процесу
                </p>
            </motion.div>

            {/* Bento grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                {features.map((f, i) => (
                    <motion.div
                        key={f.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        whileHover={{ y: -5, transition: { duration: 0.22 } }}
                        style={{
                            gridColumn: f.wide ? "span 2" : "span 1",
                            padding: f.wide ? "38px 44px" : "32px 30px",
                            borderRadius: 22, border: `1px solid ${T.border}`,
                            background: "#fff",
                            position: "relative", overflow: "hidden", cursor: "default",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)",
                            transition: "box-shadow 0.3s",
                        }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 48px ${f.color}1a, 0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px ${f.color}20`
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)"
                        }}
                    >
                        {/* Background glow */}
                        <div className="pointer-events-none absolute" style={{
                            bottom: -60, right: -60, width: 220, height: 220, borderRadius: "50%",
                            background: `radial-gradient(circle, ${f.gradFrom} 0%, transparent 70%)`,
                        }} />

                        {/* Icon */}
                        <div style={{
                            width: 50, height: 50, borderRadius: 15, marginBottom: 18,
                            background: `linear-gradient(135deg, ${f.gradFrom}, ${f.gradTo})`,
                            border: `1px solid ${f.color}20`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: `0 0 0 6px ${f.color}07`,
                        }}>
                            <f.icon size={22} style={{ color: f.color }} strokeWidth={1.8} />
                        </div>

                        {/* Tag */}
                        <span style={{
                            display: "inline-block",
                            background: `${f.color}10`, color: f.color,
                            borderRadius: 6, padding: "2.5px 9px",
                            fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
                            textTransform: "uppercase", marginBottom: 10,
                        }}>
                            {f.tag}
                        </span>

                        <h3 style={{ fontWeight: 750, fontSize: f.wide ? 22 : 18, letterSpacing: "-0.03em", marginBottom: 8, color: T.text, lineHeight: 1.2 }}>
                            {f.title}
                        </h3>
                        <p style={{ fontSize: 14.5, lineHeight: 1.68, color: T.muted, maxWidth: f.wide ? 440 : 300, letterSpacing: "-0.005em" }}>
                            {f.desc}
                        </p>
                    </motion.div>
                ))}
            </div>
        </section>
    )
}