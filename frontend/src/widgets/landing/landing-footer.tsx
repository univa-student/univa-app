import { Link } from "react-router-dom"
import logoConfig from "@/app/config/logo.config"
import { GithubIcon, TwitterIcon, BookOpenIcon, MailIcon, HeartIcon } from "lucide-react"
import { T } from "./tokens"

const footerColumns = [
    {
        title: "Продукт",
        links: [
            { label: "Можливості", href: "#можливості" },
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

export function LandingFooter() {
    return (
        <footer style={{ background: T.dark, color: "#fff", position: "relative" }}>
            <div style={{ maxWidth: T.maxW, margin: "0 auto", padding: "72px 24px 0" }}>
                {/* Top */}
                <div style={{
                    display: "flex", flexWrap: "wrap", justifyContent: "space-between",
                    alignItems: "flex-start", gap: 40, marginBottom: 56,
                }}>
                    <div style={{ maxWidth: 280 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                            <img src={logoConfig["full-logo-black-no-bg"]} alt="Univa" style={{ height: 32 }} />
                        </div>
                        <p style={{ fontSize: 14, lineHeight: 1.7, color: T.darkMuted }}>
                            Єдина екосистема для студентів. Розклад, файли, чати, AI — все в одному місці.
                        </p>
                        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                            {[
                                { Icon: GithubIcon, href: "#" },
                                { Icon: TwitterIcon, href: "#" },
                                { Icon: BookOpenIcon, href: "#" },
                                { Icon: MailIcon, href: "#" },
                            ].map((s, i) => (
                                <a
                                    key={i}
                                    href={s.href}
                                    style={{
                                        width: 36, height: 36, borderRadius: 10,
                                        background: "rgba(255,255,255,0.05)",
                                        border: `1px solid ${T.darkBorder}`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        color: T.darkMuted, textDecoration: "none",
                                        transition: "all 0.2s",
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.background = "rgba(124,58,237,0.1)" }}
                                    onMouseLeave={e => { e.currentTarget.style.color = T.darkMuted; e.currentTarget.style.borderColor = T.darkBorder; e.currentTarget.style.background = "rgba(255,255,255,0.05)" }}
                                >
                                    <s.Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Columns */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 56 }}>
                        {footerColumns.map(col => (
                            <div key={col.title} style={{ minWidth: 120 }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>
                                    {col.title}
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {col.links.map(link => {
                                        const linkStyle: React.CSSProperties = {
                                            fontSize: 14, color: T.darkMuted, textDecoration: "none",
                                            transition: "color 0.2s", cursor: "pointer",
                                        }
                                        if (link.to) {
                                            return (
                                                <Link key={link.label} to={link.to} style={linkStyle}
                                                    onMouseEnter={e => { e.currentTarget.style.color = "#fff" }}
                                                    onMouseLeave={e => { e.currentTarget.style.color = T.darkMuted }}
                                                >{link.label}</Link>
                                            )
                                        }
                                        return (
                                            <a key={link.label} href={link.href} style={linkStyle}
                                                onMouseEnter={e => { e.currentTarget.style.color = "#fff" }}
                                                onMouseLeave={e => { e.currentTarget.style.color = T.darkMuted }}
                                            >{link.label}</a>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom bar */}
                <div style={{
                    borderTop: `1px solid ${T.darkBorder}`, padding: "24px 0",
                    display: "flex", flexWrap: "wrap", justifyContent: "space-between",
                    alignItems: "center", gap: 12,
                }}>
                    <div style={{ fontSize: 12, color: T.darkMuted }}>
                        © {new Date().getFullYear()} Univa. Всі права захищені.
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: T.darkMuted }}>
                        Зроблено з <HeartIcon size={12} style={{ color: "#ef4444", margin: "0 3px" }} /> в Україні 🇺🇦
                    </div>
                </div>
            </div>
        </footer>
    )
}
