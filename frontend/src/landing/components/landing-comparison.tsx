// LandingComparison.tsx — Clean two-column comparison

import { motion } from "framer-motion"
import { CheckIcon, XIcon } from "lucide-react"
import { T } from "./tokens.ts"

const rows = [
    { without: "10+ вкладок і додатків", with: "Один єдиний workspace" },
    { without: "Хаос у Telegram-чатах", with: "Структуровані простори" },
    { without: "Загублені конспекти", with: "AI-генерація та пошук" },
    { without: "Забуті дедлайни", with: "Розумні нагадування" },
    { without: "Розсіяні файли", with: "Автокатегоризація" },
    { without: "Нульова організація", with: "Повний контроль" },
]

export function LandingComparison() {
    return (
        <section style={{ padding: "130px 24px", background: T.bg }}>
            <div style={{ maxWidth: 920, margin: "0 auto" }}>
                <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                            style={{ textAlign: "center", marginBottom: 64 }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: T.accentLight, border: `1px solid ${T.accentMid}`, borderRadius: 100, padding: "5px 14px", marginBottom: 16, fontSize: 11, fontWeight: 700, color: T.accent, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        Порівняння
                    </div>
                    <h2 style={{ fontWeight: 900, fontSize: "clamp(30px,4vw,52px)", letterSpacing: "-0.04em", color: T.text, lineHeight: 1.05 }}>
                        Замість купи різних застосунків
                    </h2>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                            style={{ borderRadius: 24, overflow: "hidden", border: `1px solid ${T.border}`, background: "#fff", boxShadow: "0 4px 40px rgba(109,40,217,0.06), 0 1px 3px rgba(0,0,0,0.04)" }}>

                    {/* Header row */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                        <div style={{ padding: "20px 28px", fontWeight: 700, fontSize: 14, color: T.muted, borderRight: `1px solid ${T.border}`, background: "#f8f8f8", borderBottom: `1px solid ${T.border}`, letterSpacing: "-0.01em" }}>
                            😓 Без Univa
                        </div>
                        <div style={{ padding: "20px 28px", fontWeight: 700, fontSize: 14, color: T.accent, background: T.accentLight, borderBottom: `1px solid ${T.border}`, letterSpacing: "-0.01em" }}>
                            ✨ З Univa
                        </div>
                    </div>

                    {rows.map((row, i) => (
                        <motion.div key={i}
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05 }}
                                    style={{
                                        display: "grid", gridTemplateColumns: "1fr 1fr",
                                        borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : "none",
                                    }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = T.accentLight }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
                        >
                            <div style={{ padding: "16px 28px", display: "flex", alignItems: "center", gap: 10, borderRight: `1px solid ${T.border}`, color: T.muted, fontSize: 14.5, letterSpacing: "-0.01em" }}>
                                <div style={{ width: 20, height: 20, borderRadius: 6, background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <XIcon size={11} style={{ color: "#ef4444" }} strokeWidth={2.5} />
                                </div>
                                {row.without}
                            </div>
                            <div style={{ padding: "16px 28px", display: "flex", alignItems: "center", gap: 10, color: T.text, fontSize: 14.5, fontWeight: 500, letterSpacing: "-0.01em" }}>
                                <div style={{ width: 20, height: 20, borderRadius: 6, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <CheckIcon size={11} style={{ color: "#16a34a" }} strokeWidth={2.5} />
                                </div>
                                {row.with}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}