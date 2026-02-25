import { motion } from "framer-motion"
import { CheckIcon, XCircleIcon } from "lucide-react"
import { T } from "./tokens"

const comparison = [
    { without: "10+ вкладок і додатків", wiith: "Один єдиний workspace" },
    { without: "Хаос у Telegram-чатах", wiith: "Структуровані простори" },
    { without: "Загублені конспекти", wiith: "AI-генерація та пошук" },
    { without: "Забуті дедлайни", wiith: "Розумні нагадування" },
    { without: "Розсіяні файли", wiith: "Автокатегоризація" },
    { without: "Нульова організація", wiith: "Повний контроль" },
]

export function LandingComparison() {
    return (
        <section style={{ padding: "120px 24px", background: T.bg }}>
            <div style={{ maxWidth: 960, margin: "0 auto" }}>
                <motion.div
                    initial={{ opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{ textAlign: "center", marginBottom: 64 }}
                >
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.accent, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Порівняння</div>
                    <h2 style={{ fontWeight: 800, fontSize: "clamp(30px,4vw,50px)", letterSpacing: "-0.03em" }}>
                        Замість купи різних застосунків
                    </h2>
                </motion.div>

                <div style={{
                    borderRadius: 22, overflow: "hidden",
                    border: `1px solid ${T.border}`,
                    background: T.card,
                    boxShadow: "0 4px 32px rgba(0,0,0,0.06)",
                }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: `1px solid ${T.border}` }}>
                        <div style={{
                            padding: "20px 28px", fontWeight: 700, fontSize: 15, color: T.muted,
                            borderRight: `1px solid ${T.border}`, background: "#fafafa",
                        }}>
                            😫 Без Univa
                        </div>
                        <div style={{
                            padding: "20px 28px", fontWeight: 700, fontSize: 15,
                            background: "linear-gradient(135deg, rgba(124,58,237,0.05), rgba(99,102,241,0.03))",
                            color: T.accent,
                        }}>
                            ✨ З Univa
                        </div>
                    </div>

                    {comparison.map((row, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -12 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.06 }}
                            style={{
                                display: "grid", gridTemplateColumns: "1fr 1fr",
                                borderBottom: i < comparison.length - 1 ? `1px solid ${T.border}` : "none",
                            }}
                        >
                            <div style={{
                                padding: "16px 28px", display: "flex", alignItems: "center", gap: 10,
                                borderRight: `1px solid ${T.border}`, color: T.muted, fontSize: 15,
                            }}>
                                <XCircleIcon size={16} style={{ color: "#ef4444", flexShrink: 0 }} />
                                {row.without}
                            </div>
                            <div style={{
                                padding: "16px 28px", display: "flex", alignItems: "center", gap: 10,
                                color: T.text, fontSize: 15, fontWeight: 500,
                            }}>
                                <CheckIcon size={16} style={{ color: "#22c55e", flexShrink: 0 }} />
                                {row.wiith}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
