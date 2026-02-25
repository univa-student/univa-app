import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { themedLogo } from "@/app/config/logo.config"
import { MenuIcon, XIcon } from "lucide-react"
import { T } from "./tokens"

const navLinks = [
    { label: "Можливості", href: "#можливості" },
    { label: "Про нас", to: "/about" },
    { label: "Документація", to: "/docs" },
]

export function LandingHeader() {
    const [scrolled, setScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 40)
        window.addEventListener("scroll", fn, { passive: true })
        return () => window.removeEventListener("scroll", fn)
    }, [])

    return (
        <>
            <div className="fixed inset-x-0 top-0 z-50 pointer-events-none">
                <div className={`mx-auto transition-all duration-500 ${scrolled ? "px-4 pt-3 sm:px-6" : "px-0 pt-0"}`} style={{ maxWidth: T.maxW }}>
                    <nav
                        className={`pointer-events-auto transition-all duration-500 ${scrolled ? "rounded-2xl shadow-lg shadow-black/5" : ""}`}
                        style={{
                            background: scrolled
                                ? "rgba(255, 255, 255, 0.82)"
                                : "rgba(255, 255, 255, 0.6)",
                            backdropFilter: "blur(20px) saturate(180%)",
                            WebkitBackdropFilter: "blur(20px) saturate(180%)",
                            borderBottom: scrolled ? "none" : `1px solid ${T.border}`,
                            border: scrolled ? `1px solid rgba(0,0,0,0.06)` : undefined,
                        }}
                    >
                        <div className="flex h-16 items-center justify-between px-6 lg:px-8">
                            <Link to="/" className="flex items-center gap-2.5" style={{ textDecoration: "none" }}>
                                <img src={themedLogo("full-no-bg")} alt="Univa" style={{ height: 32 }} />
                            </Link>

                            {/* Desktop Nav */}
                            <div className="hidden md:flex items-center gap-1">
                                {navLinks.map((l) => {
                                    const commonStyle: React.CSSProperties = {
                                        color: T.muted, background: "transparent",
                                        fontSize: 14, fontWeight: 500, padding: "8px 16px",
                                        borderRadius: 10, transition: "all 0.2s", textDecoration: "none",
                                        cursor: "pointer", border: "none",
                                    }
                                    if (l.href) {
                                        return (
                                            <button
                                                key={l.label}
                                                onClick={() => {
                                                    const id = l.href!.replace("#", "")
                                                    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
                                                }}
                                                style={commonStyle}
                                                onMouseEnter={e => { e.currentTarget.style.color = T.text; e.currentTarget.style.background = "rgba(0,0,0,0.04)" }}
                                                onMouseLeave={e => { e.currentTarget.style.color = T.muted; e.currentTarget.style.background = "transparent" }}
                                            >
                                                {l.label}
                                            </button>
                                        )
                                    }
                                    return (
                                        <Link
                                            key={l.label}
                                            to={l.to!}
                                            style={commonStyle}
                                            onMouseEnter={e => { e.currentTarget.style.color = T.text; e.currentTarget.style.background = "rgba(0,0,0,0.04)" }}
                                            onMouseLeave={e => { e.currentTarget.style.color = T.muted; e.currentTarget.style.background = "transparent" }}
                                        >
                                            {l.label}
                                        </Link>
                                    )
                                })}
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Single CTA */}
                                <Link
                                    to="/login"
                                    className="hidden sm:inline-flex items-center gap-1.5"
                                    style={{
                                        padding: "9px 22px", borderRadius: 12, fontWeight: 600, fontSize: 14,
                                        textDecoration: "none",
                                        background: T.gradient, color: "#fff",
                                        boxShadow: "0 2px 12px rgba(124,58,237,0.3)",
                                        transition: "box-shadow 0.2s, transform 0.15s",
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(124,58,237,0.45)"; e.currentTarget.style.transform = "translateY(-1px)" }}
                                    onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(124,58,237,0.3)"; e.currentTarget.style.transform = "translateY(0)" }}
                                >
                                    Увійти
                                </Link>

                                {/* Mobile menu toggle */}
                                <button
                                    className="md:hidden p-2 rounded-lg"
                                    style={{ color: T.text, background: "rgba(0,0,0,0.04)", border: "none", cursor: "pointer" }}
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                >
                                    {mobileMenuOpen ? <XIcon size={18} /> : <MenuIcon size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Mobile Menu */}
                        {mobileMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="md:hidden px-6 pb-4"
                                style={{ borderTop: `1px solid ${T.border}` }}
                            >
                                {navLinks.map(l => {
                                    if (l.href) {
                                        return (
                                            <button
                                                key={l.label}
                                                onClick={() => {
                                                    const id = l.href!.replace("#", "")
                                                    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
                                                    setMobileMenuOpen(false)
                                                }}
                                                style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 0", color: T.muted, fontSize: 15, background: "transparent", border: "none", cursor: "pointer" }}
                                            >
                                                {l.label}
                                            </button>
                                        )
                                    }
                                    return (
                                        <Link
                                            key={l.label}
                                            to={l.to!}
                                            onClick={() => setMobileMenuOpen(false)}
                                            style={{ display: "block", padding: "12px 0", color: T.muted, fontSize: 15, textDecoration: "none" }}
                                        >
                                            {l.label}
                                        </Link>
                                    )
                                })}
                                <Link
                                    to="/login"
                                    style={{
                                        display: "block", textAlign: "center", marginTop: 8,
                                        padding: "12px 0", borderRadius: 12, fontWeight: 600, fontSize: 14,
                                        background: T.gradient, color: "#fff", textDecoration: "none",
                                    }}
                                >
                                    Увійти
                                </Link>
                            </motion.div>
                        )}
                    </nav>
                </div>
            </div>
            {/* spacer */}
            <div className="h-[76px]" />
        </>
    )
}
