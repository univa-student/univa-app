import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRightIcon, ZapIcon } from "lucide-react"
import { T } from "./tokens"

export function LandingCta() {
    return (
        <section style={{
            padding: "120px 24px",
            background: "linear-gradient(135deg, #0a0a0f 0%, #1a1040 40%, #0f172a 100%)",
            position: "relative",
            overflow: "hidden",
            textAlign: "center",
        }}>
            {/* Floating particles */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="pointer-events-none absolute"
                    style={{
                        width: 4 + i * 2, height: 4 + i * 2,
                        borderRadius: "50%",
                        background: `rgba(124,58,237,${0.15 + i * 0.05})`,
                        left: `${15 + i * 14}%`,
                        top: `${20 + (i % 3) * 25}%`,
                    }}
                    animate={{ y: [0, -20, 0], opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
                />
            ))}

            <div className="pointer-events-none absolute" style={{
                top: "50%", left: "50%", transform: "translate(-50%,-50%)",
                width: 700, height: 500, borderRadius: "50%",
                background: "radial-gradient(ellipse, rgba(124,58,237,0.1) 0%, transparent 60%)",
                filter: "blur(40px)",
            }} />

            <motion.div
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                style={{ position: "relative", maxWidth: 600, margin: "0 auto" }}
            >
                <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    style={{
                        width: 72, height: 72, borderRadius: 22,
                        background: T.gradient,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 32px",
                        boxShadow: "0 0 60px rgba(124,58,237,0.3)",
                    }}
                >
                    <ZapIcon size={32} style={{ color: "#fff" }} />
                </motion.div>

                <h2 style={{
                    fontWeight: 800, fontSize: "clamp(34px,5vw,58px)",
                    letterSpacing: "-0.03em", lineHeight: 1.08, marginBottom: 18, color: "#fff",
                }}>
                    Готовий навчатися{" "}
                    <span style={{
                        background: "linear-gradient(135deg, #c4b5fd, #93c5fd)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    }}>
                        ефективніше?
                    </span>
                </h2>
                <p style={{ fontSize: 17, color: "rgba(255,255,255,0.5)", marginBottom: 40, lineHeight: 1.7 }}>
                    Приєднуйся до тисяч студентів, які вже відчули різницю.
                    Безкоштовно, без кредитної картки.
                </p>

                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} style={{ display: "inline-block" }}>
                    <Link
                        to="/dashboard"
                        style={{
                            display: "inline-flex", alignItems: "center", gap: 8,
                            padding: "16px 36px", borderRadius: 100, fontWeight: 600, fontSize: 16,
                            textDecoration: "none",
                            background: T.gradient, color: "#fff",
                            boxShadow: "0 0 40px rgba(124,58,237,0.4), 0 4px 16px rgba(0,0,0,0.2)",
                        }}
                    >
                        Почати безкоштовно <ArrowRightIcon size={18} />
                    </Link>
                </motion.div>
            </motion.div>
        </section>
    )
}
