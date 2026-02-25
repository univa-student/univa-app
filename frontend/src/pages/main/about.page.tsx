import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import usePageTitle from "@/shared/hooks/usePageTitle"
import { GOOGLE_FONTS_URL } from "@/app/config/app.config.ts"
import logoConfig from "@/app/config/logo.config"
import { Button } from "@/shared/shadcn/ui/button"
import {
    ArrowRightIcon, HeartIcon, TargetIcon, EyeIcon, ShieldCheckIcon,
    SparklesIcon, UsersIcon, RocketIcon,
} from "lucide-react"
import { LandingFooter } from "@/widgets/landing";

const T = {
    bg: "#fafbfc", card: "#ffffff", text: "#111827", muted: "#6b7280",
    border: "#e5e7eb", accent: "#7c3aed", accentLight: "#ede9fe", accentMid: "#c4b5fd",
    gradient: "linear-gradient(135deg,#7c3aed,#6366f1,#3b82f6)",
    dark: "#0a0a0f", darkBorder: "#1f1f2e", darkMuted: "#71717a",
}

const values = [
    { icon: TargetIcon, title: "Фокус на студентах", desc: "Кожна функція створена з думкою про реальні потреби студентів українських ВНЗ.", color: "#3b82f6", bg: "#eff6ff" },
    { icon: ShieldCheckIcon, title: "Приватність", desc: "Ваші дані — тільки ваші. Наскрізне шифрування, дата-центри в ЄС, повний GDPR.", color: "#059669", bg: "#ecfdf5" },
    { icon: SparklesIcon, title: "Інновації", desc: "AI-технології та сучасні підходи для максимально ефективного навчання.", color: "#7c3aed", bg: "#f5f3ff" },
    { icon: UsersIcon, title: "Спільнота", desc: "Ми будуємо не просто продукт, а спільноту студентів, що допомагають одне одному.", color: "#e11d48", bg: "#fff1f2" },
]

const team = [
    { name: "Олександр М.", role: "CEO & Co-founder", avatar: "ОМ" },
    { name: "Марія К.", role: "CTO & Co-founder", avatar: "МК" },
    { name: "Дмитро П.", role: "Head of Product", avatar: "ДП" },
    { name: "Анна Б.", role: "Lead Designer", avatar: "АБ" },
    { name: "Ігор С.", role: "Lead Engineer", avatar: "ІС" },
    { name: "Катерина Л.", role: "Head of AI", avatar: "КЛ" },
]

const milestones = [
    { year: "2024", title: "Ідея", desc: "Група студентів КНУ вирішила створити інструмент, якого їм не вистачало." },
    { year: "2025", title: "Запуск бета", desc: "Перші 1000 користувачів з 5 університетів. Позитивний фідбек." },
    { year: "2026", title: "Зростання", desc: "10K+ студентів, 50+ університетів, AI-помічник, мобільний додаток." },
]

export function AboutPage() {
    usePageTitle("Про нас — Univa")

    return (
        <div style={{ background: T.bg, minHeight: "100vh", color: T.text }}>
            <style>{`@import url('${GOOGLE_FONTS_URL}');`}</style>

            {/* Header */}
            <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(10,10,15,0.92)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex h-16 items-center justify-between px-6 max-w-7xl mx-auto">
                    <Link to="/" style={{ textDecoration: "none" }}><img src={logoConfig['full-logo-white-no-bg']} alt="Univa" style={{ height: 32 }} /></Link>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" asChild className="text-white/60 hover:text-white hover:bg-white/5"><Link to="/">← На головну</Link></Button>
                        <Button size="sm" asChild style={{ background: T.gradient, border: "none" }}><Link to="/dashboard">Почати <ArrowRightIcon className="size-3.5 ml-1" /></Link></Button>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section style={{ padding: "100px 24px 80px", textAlign: "center", background: "linear-gradient(180deg, #0a0a0f 0%, #fafbfc 100%)", position: "relative" }}>
                <div className="pointer-events-none absolute" style={{ top: 0, left: "50%", transform: "translateX(-50%)", width: 800, height: 400, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(124,58,237,0.08) 0%, transparent 65%)", filter: "blur(40px)" }} />
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ position: "relative", maxWidth: 600, margin: "0 auto" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 100, background: "rgba(124,58,237,0.1)", border: `1px solid ${T.accentMid}`, fontSize: 12, fontWeight: 600, color: T.accent, marginBottom: 20 }}>
                        <HeartIcon size={12} /> Наша історія
                    </div>
                    <h1 style={{ fontWeight: 800, fontSize: "clamp(36px,5vw,56px)", letterSpacing: "-0.035em", lineHeight: 1.1, marginBottom: 18, color: "#fff" }}>
                        Ми створюємо майбутнє освіти
                    </h1>
                    <p style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,0.5)" }}>
                        Univa народився з простої ідеї: навчання має бути організованим, а не хаотичним.
                        Ми — команда студентів та інженерів, об'єднаних спільною місією.
                    </p>
                </motion.div>
            </section>

            {/* Mission & Vision */}
            <section style={{ padding: "60px 24px 100px", maxWidth: 1000, margin: "0 auto" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
                    {[
                        { icon: TargetIcon, label: "Місія", title: "Зробити навчання організованим", desc: "Ми створюємо єдину екосистему, яка звільняє студентів від рутини управління десятками різних інструментів і дозволяє зосередитися на головному — навчанні.", color: "#3b82f6" },
                        { icon: EyeIcon, label: "Візія", title: "Освіта без кордонів", desc: "Ми бачимо майбутнє, де кожен студент має доступ до персоналізованого AI-помічника, зручних інструментів та підтримувальної спільноти — незалежно від університету.", color: "#7c3aed" },
                    ].map((item, i) => (
                        <motion.div key={item.label} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                            style={{ padding: 36, borderRadius: 22, border: `1px solid ${T.border}`, background: T.card, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                            <div style={{ width: 48, height: 48, borderRadius: 14, background: `${item.color}10`, border: `1px solid ${item.color}25`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                                <item.icon size={22} style={{ color: item.color }} />
                            </div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: item.color, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>{item.label}</div>
                            <h3 style={{ fontWeight: 700, fontSize: 22, letterSpacing: "-0.02em", marginBottom: 12 }}>{item.title}</h3>
                            <p style={{ fontSize: 14, lineHeight: 1.7, color: T.muted }}>{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Values */}
            <section style={{ padding: "80px 24px", background: T.card, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
                <div style={{ maxWidth: 1000, margin: "0 auto" }}>
                    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 56 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: T.accent, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Цінності</div>
                        <h2 style={{ fontWeight: 800, fontSize: "clamp(28px,4vw,40px)", letterSpacing: "-0.03em" }}>У що ми віримо</h2>
                    </motion.div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                        {values.map((v, i) => (
                            <motion.div key={v.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                                style={{ padding: 28, borderRadius: 18, border: `1px solid ${T.border}`, background: T.bg, textAlign: "center" }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: v.bg, border: `1px solid ${v.color}25`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                                    <v.icon size={20} style={{ color: v.color }} />
                                </div>
                                <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{v.title}</h3>
                                <p style={{ fontSize: 13, lineHeight: 1.6, color: T.muted }}>{v.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section style={{ padding: "80px 24px", maxWidth: 800, margin: "0 auto" }}>
                <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 56 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.accent, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Наш шлях</div>
                    <h2 style={{ fontWeight: 800, fontSize: "clamp(28px,4vw,40px)", letterSpacing: "-0.03em" }}>Від ідеї до реальності</h2>
                </motion.div>
                <div style={{ display: "flex", flexDirection: "column", gap: 0, position: "relative" }}>
                    <div style={{ position: "absolute", left: 27, top: 0, bottom: 0, width: 2, background: `linear-gradient(180deg, ${T.accent}, #3b82f6)`, opacity: 0.15 }} />
                    {milestones.map((m, i) => (
                        <motion.div key={m.year} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                            style={{ display: "flex", gap: 24, padding: "20px 0", position: "relative" }}>
                            <div style={{ width: 56, height: 56, borderRadius: 16, background: T.accentLight, border: `1px solid ${T.accentMid}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: T.accent, flexShrink: 0, zIndex: 1 }}>
                                {m.year}
                            </div>
                            <div>
                                <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{m.title}</h3>
                                <p style={{ fontSize: 14, lineHeight: 1.65, color: T.muted }}>{m.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Team */}
            <section style={{ padding: "80px 24px 100px", background: T.dark }}>
                <div style={{ maxWidth: 1000, margin: "0 auto" }}>
                    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 56 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: T.accent, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Команда</div>
                        <h2 style={{ fontWeight: 800, fontSize: "clamp(28px,4vw,40px)", letterSpacing: "-0.03em", color: "#fff" }}>Люди за Univa</h2>
                    </motion.div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16 }}>
                        {team.map((t, i) => (
                            <motion.div key={t.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                                style={{ padding: 24, borderRadius: 18, border: `1px solid ${T.darkBorder}`, background: "rgba(255,255,255,0.02)", textAlign: "center" }}>
                                <div style={{ width: 56, height: 56, borderRadius: 16, background: T.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: "#fff", margin: "0 auto 14px", boxShadow: "0 4px 16px rgba(124,58,237,0.25)" }}>
                                    {t.avatar}
                                </div>
                                <div style={{ fontWeight: 600, fontSize: 14, color: "#fff", marginBottom: 2 }}>{t.name}</div>
                                <div style={{ fontSize: 11, color: T.darkMuted }}>{t.role}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section style={{ padding: "80px 24px", textAlign: "center", background: T.bg, borderTop: `1px solid ${T.border}` }}>
                <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ maxWidth: 500, margin: "0 auto" }}>
                    <RocketIcon size={32} style={{ color: T.accent, margin: "0 auto 16px" }} />
                    <h2 style={{ fontWeight: 800, fontSize: 28, letterSpacing: "-0.03em", marginBottom: 12 }}>Приєднуйся до нас</h2>
                    <p style={{ fontSize: 15, color: T.muted, marginBottom: 28, lineHeight: 1.7 }}>Спробуй Univa безкоштовно та переконайся, що навчання може бути організованим.</p>
                    <Button asChild style={{ background: T.gradient, border: "none", borderRadius: 100, padding: "14px 32px", fontWeight: 600, boxShadow: "0 4px 16px rgba(124,58,237,0.3)" }}>
                        <Link to="/dashboard">Почати безкоштовно <ArrowRightIcon className="size-4 ml-2" /></Link>
                    </Button>
                </motion.div>
            </section>

            {/* Footer */}
            <LandingFooter />
        </div>
    )
}
