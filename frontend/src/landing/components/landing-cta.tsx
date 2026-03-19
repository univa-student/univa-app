// LandingCta.tsx — Dramatic full-width CTA

import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRightIcon } from "lucide-react"
import { T } from "./tokens.ts"

export function LandingCta() {
    return (
        <section style={{
            padding: "140px 24px",
            background: T.dark,
            position: "relative",
            overflow: "hidden",
            textAlign: "center",
        }}>
            {/* Centered glow */}
            <div className="pointer-events-none absolute" style={{
                top: "50%", left: "50%", transform: "translate(-50%,-55%)",
                width: 900, height: 700, borderRadius: "50%",
                background: "radial-gradient(ellipse, rgba(109,40,217,0.14) 0%, rgba(79,70,229,0.06) 40%, transparent 70%)",
                filter: "blur(30px)",
            }} />

            {/* Grid */}
            <div className="pointer-events-none absolute inset-0" style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
                backgroundSize: "80px 80px",
                maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 10%, transparent 80%)",
            }} />

            {/* Floating dots */}
            {[...Array(5)].map((_, i) => (
                <motion.div key={i} className="pointer-events-none absolute"
                            style={{ width: 5 + i, height: 5 + i, borderRadius: "50%", background: `rgba(167,139,250,${0.15 + i * 0.04})`, left: `${20 + i * 15}%`, top: `${25 + (i % 2) * 40}%` }}
                            animate={{ y: [0, -18, 0], opacity: [0.3, 0.65, 0.3] }}
                            transition={{ duration: 3.5 + i * 0.5, repeat: Infinity, delay: i * 0.5 }}
                />
            ))}

            <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        style={{ position: "relative", maxWidth: 580, margin: "0 auto" }}>

                <div style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20, opacity: 0.8 }}>
                    Готовий почати?
                </div>

                <h2 style={{
                    fontWeight: 900, fontSize: "clamp(36px,5.5vw,66px)",
                    letterSpacing: "-0.045em", lineHeight: 1.03, marginBottom: 18, color: "#fff",
                }}>
                    Навчайся{" "}
                    <span style={{ background: "linear-gradient(135deg, #c4b5fd 0%, #a5b4fc 50%, #93c5fd 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        ефективніше
                    </span>
                </h2>

                <p style={{ fontSize: 16.5, color: "rgba(255,255,255,0.45)", marginBottom: 44, lineHeight: 1.72, letterSpacing: "-0.01em" }}>
                    Приєднуйся до тисяч студентів, які вже відчули різницю.
                    <br />Безкоштовно, без кредитної картки.
                </p>

                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ display: "inline-block" }}>
                    <Link to="/dashboard" style={{
                        display: "inline-flex", alignItems: "center", gap: 9,
                        padding: "16px 36px", borderRadius: 14, fontWeight: 650, fontSize: 15.5,
                        textDecoration: "none", background: T.gradient, color: "#fff",
                        letterSpacing: "-0.02em",
                        boxShadow: "0 0 50px rgba(109,40,217,0.4), 0 4px 20px rgba(0,0,0,0.25), 0 1px 0 rgba(255,255,255,0.15) inset",
                    }}>
                        Почати безкоштовно <ArrowRightIcon size={16} />
                    </Link>
                </motion.div>

                <p style={{ marginTop: 16, fontSize: 12, color: "rgba(255,255,255,0.25)", letterSpacing: "0.02em" }}>
                    Не потрібна кредитна картка · Безкоштовно назавжди
                </p>
            </motion.div>
        </section>
    )
}