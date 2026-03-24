import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useState } from "react"
import usePageTitle from "@/shared/hooks/usePageTitle.ts"
import { GOOGLE_FONTS_URL } from "@/app/config/app.config.ts"
import logoConfig from "@/app/config/logo.config.ts"
import { Button } from "@/shared/shadcn/ui/button.tsx"
import {
    ArrowRightIcon, MessageCircleIcon, MailIcon, BookOpenIcon,
    ZapIcon, ChevronDownIcon, SearchIcon,
    HeadphonesIcon, ClockIcon,
} from "lucide-react"
import { LandingFooter } from "@/landing/components"

const T = {
    bg: "#f5f4f0", card: "#fff", border: "#e4e2dc",
    text: "#0d0d12", muted: "#71717a", accent: "#6d28d9",
    accentSoft: "#ede9fe", accentMid: "#c4b5fd",
    dark: "#09090f", darkBorder: "#1c1c28",
    green: "#059669", blue: "#0284c7",
}

const faqs = [
    { q: "Як скинути пароль?", a: "Натисни «Забув пароль» на сторінці входу. На твій email прийде лист зі посиланням для скидання — він діє 30 хвилин." },
    { q: "Чи можна використовувати Univa без університетської пошти?", a: "Так! Реєстрація доступна з будь-яким email. Університетська пошта дає доступ до спільних групових просторів твого ВНЗ." },
    { q: "Як підключити Google Calendar?", a: "Перейди в Налаштування → Інтеграції → Google Calendar. Натисни «Підключити» і авторизуй доступ. Синхронізація відбудеться автоматично." },
    { q: "Де зберігаються мої файли?", a: "Файли зберігаються у зашифрованому вигляді на серверах у ЄС (Франкфурт). Ми використовуємо AES-256 та не маємо доступу до твоїх даних." },
    { q: "Яке обмеження на розмір файлів?", a: "На безкоштовному плані — 5 ГБ сховища, максимальний розмір файлу 50 МБ. На Pro — 50 ГБ і файли до 500 МБ." },
    { q: "Як видалити акаунт?", a: "Налаштування → Акаунт → Видалити акаунт. Усі дані будуть видалені протягом 30 днів. Операція незворотна." },
    { q: "AI не відповідає або відповідає повільно — що робити?", a: "Перевір статус AI-сервісу на сторінці status.univa.app. Якщо все в нормі — спробуй коротший запит або очисти кеш браузера." },
    { q: "Чи є мобільний додаток?", a: "Мобільний додаток у розробці та вийде у 2026 році. Поки що Univa повністю адаптований для мобільних браузерів (PWA)." },
]

const channels = [
    { icon: MessageCircleIcon, title: "Онлайн-чат", desc: "Відповідаємо протягом 5 хвилин у робочий час.", badge: "Найшвидший", badgeColor: T.green, color: T.green, action: "Написати в чат", href: "#chat" },
    { icon: MailIcon, title: "Email", desc: "Детальні запитання — відповідаємо до 24 годин.", badge: null, color: T.accent, action: "support@univa.app", href: "mailto:support@univa.app" },
    { icon: BookOpenIcon, title: "Документація", desc: "Докладні гайди по всіх функціях продукту.", badge: null, color: T.blue, action: "Відкрити доки", href: "/docs" },
]

export function SupportPage() {
    usePageTitle("Підтримка — Univa")
    const [openFaq, setOpenFaq] = useState<number | null>(null)
    const [search, setSearch] = useState("")

    const filtered = faqs.filter(f =>
        f.q.toLowerCase().includes(search.toLowerCase()) ||
        f.a.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div style={{ background: T.bg, minHeight: "100vh", color: T.text, fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`
                @import url('${GOOGLE_FONTS_URL}');
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700;9..40,800&family=DM+Serif+Display:ital@0;1&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                .serif { font-family: 'DM Serif Display', serif; }
                .faq-row { cursor: pointer; transition: background 0.18s; }
                .faq-row:hover { background: rgba(109,40,217,0.03); }
                input:focus { outline: none; border-color: rgba(109,40,217,0.4) !important; box-shadow: 0 0 0 3px rgba(109,40,217,0.08); }
            `}</style>

            {/* Nav */}
            <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(9,9,15,0.96)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex h-16 items-center justify-between px-6" style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <Link to="/"><img src={logoConfig['full-logo-white-no-bg']} alt="Univa" style={{ height: 28 }} /></Link>
                        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)" }} />
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Підтримка</span>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="text-white/40 hover:text-white hover:bg-white/5">
                        <Link to="/">← Головна</Link>
                    </Button>
                </div>
            </nav>

            {/* Hero */}
            <section style={{ padding: "80px 24px 64px", background: T.dark, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(109,40,217,0.12) 0%, transparent 65%)" }} />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", position: "relative" }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(109,40,217,0.15)", border: "1px solid rgba(109,40,217,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                        <HeadphonesIcon size={24} style={{ color: "#a78bfa" }} />
                    </div>
                    <h1 className="serif" style={{ fontSize: "clamp(36px,5vw,56px)", fontWeight: 400, letterSpacing: "-0.02em", marginBottom: 16, color: "#fff" }}>
                        Як можемо допомогти?
                    </h1>
                    <p style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", marginBottom: 32, lineHeight: 1.7 }}>
                        Знайди відповідь у FAQ або зв'яжись з командою підтримки.
                    </p>
                    {/* Search */}
                    <div style={{ position: "relative", maxWidth: 440, margin: "0 auto" }}>
                        <SearchIcon size={16} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Пошук по FAQ..."
                               style={{ width: "100%", padding: "14px 16px 14px 44px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)", fontSize: 14, color: "#fff", fontFamily: "inherit", transition: "all 0.2s" }} />
                    </div>
                </motion.div>
            </section>

            <div style={{ maxWidth: 860, margin: "0 auto", padding: "64px 24px 100px" }}>

                {/* Channels */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 64 }}>
                    {channels.map(ch => (
                        <div key={ch.title} style={{ padding: 28, borderRadius: 18, border: `1px solid ${T.border}`, background: T.card }}>
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${ch.color}12`, border: `1px solid ${ch.color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <ch.icon size={20} style={{ color: ch.color }} />
                                </div>
                                {ch.badge && (
                                    <div style={{ padding: "3px 10px", borderRadius: 100, background: "#dcfce7", fontSize: 10, fontWeight: 700, color: ch.badgeColor, letterSpacing: "0.06em" }}>{ch.badge}</div>
                                )}
                            </div>
                            <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{ch.title}</h3>
                            <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.65, marginBottom: 18 }}>{ch.desc}</p>
                            <a href={ch.href} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600, color: ch.color, textDecoration: "none" }}>
                                {ch.action} <ArrowRightIcon size={13} />
                            </a>
                        </div>
                    ))}
                </motion.div>

                {/* Working hours */}
                <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                            style={{ padding: "20px 24px", borderRadius: 14, border: `1px solid ${T.border}`, background: T.card, marginBottom: 56, display: "flex", alignItems: "center", gap: 12 }}>
                    <ClockIcon size={16} style={{ color: T.muted, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: T.muted }}>
                        Робочий час підтримки: <strong style={{ color: T.text }}>Пн–Пт, 09:00–21:00 (UTC+2)</strong> · У вихідні — email до 48 год
                    </span>
                </motion.div>

                {/* FAQ */}
                <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <h2 className="serif" style={{ fontSize: "clamp(24px,3.5vw,36px)", fontWeight: 400, letterSpacing: "-0.02em", marginBottom: 32 }}>
                        Часті запитання
                        {search && <span style={{ fontSize: 14, fontFamily: "'DM Sans'", fontWeight: 400, color: T.muted, marginLeft: 12 }}>({filtered.length} результатів)</span>}
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {filtered.map((faq, i) => (
                            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                                <div className="faq-row" onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                     style={{ padding: "18px 22px", borderRadius: 14, border: `1px solid ${openFaq === i ? T.accentMid : T.border}`, background: openFaq === i ? T.accentSoft : T.card, marginBottom: 2 }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                                        <span style={{ fontWeight: 600, fontSize: 14, color: T.text }}>{faq.q}</span>
                                        <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                            <ChevronDownIcon size={16} style={{ color: T.muted, flexShrink: 0 }} />
                                        </motion.div>
                                    </div>
                                    {openFaq === i && (
                                        <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                                                  style={{ fontSize: 14, lineHeight: 1.72, color: T.muted, marginTop: 10 }}>
                                            {faq.a}
                                        </motion.p>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                        {filtered.length === 0 && (
                            <div style={{ textAlign: "center", padding: "40px 0", color: T.muted, fontSize: 14 }}>
                                Нічого не знайдено. Спробуй звернутись до підтримки.
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* CTA */}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                            style={{ marginTop: 56, padding: "36px 40px", borderRadius: 20, background: T.dark, textAlign: "center" }}>
                    <ZapIcon size={28} style={{ color: "#a78bfa", margin: "0 auto 14px" }} />
                    <h3 style={{ fontWeight: 700, fontSize: 20, color: "#fff", marginBottom: 8 }}>Не знайшов відповіді?</h3>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", marginBottom: 24 }}>Команда підтримки завжди готова допомогти.</p>
                    <Button asChild style={{ background: "linear-gradient(135deg,#6d28d9,#5b21b6)", border: "none", borderRadius: 10, fontWeight: 600 }}>
                        <a href="mailto:support@univa.app">Написати нам <ArrowRightIcon className="size-4 ml-2" /></a>
                    </Button>
                </motion.div>
            </div>

            <LandingFooter />
        </div>
    )
}