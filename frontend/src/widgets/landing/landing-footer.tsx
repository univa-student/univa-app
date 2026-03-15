// LandingFooter.tsx — Refined footer

import { Link } from "react-router-dom"
import logoConfig from "@/app/config/logo.config"
import { GithubIcon, TwitterIcon, BookOpenIcon, MailIcon, HeartIcon } from "lucide-react"
import { T } from "./tokens"

const columns = [
    {
        title: "Продукт",
        links: [
            { label: "Можливості", href: "#можливості" },
            { label: "Як це працює", href: "#як-це-працює" },
            { label: "Інтеграції", href: "#" },
            { label: "Оновлення", href: "#" },
        ],
    },
    {
        title: "Компанія",
        links: [
            { label: "Про нас", to: "/about" },
            { label: "Блог", href: "#" },
            { label: "Кар'єра", href: "#" },
            { label: "Контакти", href: "#" },
        ],
    },
    {
        title: "Ресурси",
        links: [
            { label: "Документація", to: "/docs" },
            { label: "API", href: "#" },
            { label: "Статус", href: "#" },
            { label: "Підтримка", href: "#" },
        ],
    },
    {
        title: "Правове",
        links: [
            { label: "Конфіденційність", href: "#" },
            { label: "Умови", href: "#" },
            { label: "Cookies", href: "#" },
            { label: "Ліцензії", href: "#" },
        ],
    },
]

const socials = [
    { Icon: GithubIcon, href: "#" },
    { Icon: TwitterIcon, href: "#" },
    { Icon: BookOpenIcon, href: "#" },
    { Icon: MailIcon, href: "#" },
]

export function LandingFooter() {
    const linkStyle: React.CSSProperties = {
        fontSize: 13.5, color: T.darkMuted, textDecoration: "none",
        transition: "color 0.18s", cursor: "pointer", letterSpacing: "-0.01em",
    }

    return (
        <footer style={{ background: "#050309", color: "#fff", position: "relative", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ maxWidth: T.maxW, margin: "0 auto", padding: "72px 24px 0" }}>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 48, marginBottom: 64 }}>
                    {/* Brand */}
                    <div style={{ maxWidth: 260 }}>
                        <img src={logoConfig['full-logo-white-no-bg']} alt="Univa" style={{ height: 28, marginBottom: 16, opacity: 0.95 }} />
                        <p style={{ fontSize: 13.5, lineHeight: 1.72, color: T.darkMuted, letterSpacing: "-0.005em" }}>
                            Єдина екосистема для студентів. Розклад, файли, чати, AI — все в одному місці.
                        </p>
                        <div style={{ display: "flex", gap: 8, marginTop: 22 }}>
                            {socials.map((s, i) => (
                                <a key={i} href={s.href} style={{
                                    width: 34, height: 34, borderRadius: 9,
                                    background: "rgba(255,255,255,0.04)",
                                    border: "1px solid rgba(255,255,255,0.07)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: T.darkMuted, textDecoration: "none", transition: "all 0.18s",
                                }}
                                   onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(109,40,217,0.4)"; e.currentTarget.style.background = "rgba(109,40,217,0.1)" }}
                                   onMouseLeave={e => { e.currentTarget.style.color = T.darkMuted; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)" }}>
                                    <s.Icon size={15} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link columns */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 52 }}>
                        {columns.map(col => (
                            <div key={col.title} style={{ minWidth: 110 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>
                                    {col.title}
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {col.links.map(link => {
                                        if (link.to) return (
                                            <Link key={link.label} to={link.to} style={linkStyle}
                                                  onMouseEnter={e => { e.currentTarget.style.color = "#fff" }}
                                                  onMouseLeave={e => { e.currentTarget.style.color = T.darkMuted }}>
                                                {link.label}
                                            </Link>
                                        )
                                        return (
                                            <a key={link.label} href={link.href} style={linkStyle}
                                               onMouseEnter={e => { e.currentTarget.style.color = "#fff" }}
                                               onMouseLeave={e => { e.currentTarget.style.color = T.darkMuted }}>
                                                {link.label}
                                            </a>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom */}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "22px 0", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", letterSpacing: "-0.01em" }}>
                        © {new Date().getFullYear()} Univa. Всі права захищені.
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
                        Зроблено з <HeartIcon size={11} style={{ color: "#f87171", margin: "0 3px" }} fill="#f87171" /> в Україні 🇺🇦
                    </div>
                </div>
            </div>
        </footer>
    )
}