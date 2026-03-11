// LandingHeader.tsx — Premium frosted-glass nav with refined spacing

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { themedLogo } from "@/app/config/logo.config"
import { MenuIcon, XIcon } from "lucide-react"
import { T } from "./tokens"

const navLinks = [
    { label: "Можливості", href: "#можливості" },
    { label: "Як це працює", href: "#як-це-працює" },
    { label: "Відгуки", href: "#відгуки" },
    { label: "Про нас", to: "/about" },
]

export function LandingHeader() {
    const [scrolled, setScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 32)
        window.addEventListener("scroll", fn, { passive: true })
        return () => window.removeEventListener("scroll", fn)
    }, [])

    return (
        <>
            <div className="fixed inset-x-0 top-0 z-50 pointer-events-none">
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="pointer-events-auto"
                    style={{
                        margin: scrolled ? "12px 16px 0" : "0",
                        transition: "margin 0.4s cubic-bezier(0.22,1,0.36,1)",
                        borderRadius: scrolled ? 18 : 0,
                        background: scrolled
                            ? "rgba(248, 247, 255, 0.88)"
                            : "rgba(248, 247, 255, 0.72)",
                        backdropFilter: "blur(24px) saturate(200%)",
                        WebkitBackdropFilter: "blur(24px) saturate(200%)",
                        borderBottom: scrolled ? "none" : `1px solid ${T.border}`,
                        border: scrolled ? `1px solid ${T.borderStrong}` : undefined,
                        boxShadow: scrolled ? "0 4px 32px rgba(109,40,217,0.08), 0 1px 0 rgba(255,255,255,0.8) inset" : "none",
                        transition: "all 0.4s cubic-bezier(0.22,1,0.36,1)",
                    }}
                >
                    <div style={{ maxWidth: T.maxW, margin: "0 auto" }}>
                        <div className="flex h-[62px] items-center justify-between px-5 lg:px-8">
                            {/* Logo */}
                            <Link to="/" className="flex items-center gap-2.5" style={{ textDecoration: "none" }}>
                                <img src={themedLogo("full-no-bg")} alt="Univa" style={{ height: 30 }} />
                            </Link>

                            {/* Desktop Nav */}
                            <nav className="hidden md:flex items-center gap-0.5">
                                {navLinks.map((l) => {
                                    const base: React.CSSProperties = {
                                        color: T.muted, background: "transparent",
                                        fontSize: 14, fontWeight: 500,
                                        padding: "7px 14px", borderRadius: 10,
                                        transition: "all 0.18s", textDecoration: "none",
                                        cursor: "pointer", border: "none", letterSpacing: "-0.01em",
                                    }
                                    if (l.href) {
                                        return (
                                            <button key={l.label} onClick={() => {
                                                document.getElementById(l.href!.replace("#", ""))?.scrollIntoView({ behavior: "smooth" })
                                            }} style={base}
                                                    onMouseEnter={e => { e.currentTarget.style.color = T.text; e.currentTarget.style.background = T.accentLight }}
                                                    onMouseLeave={e => { e.currentTarget.style.color = T.muted; e.currentTarget.style.background = "transparent" }}
                                            >{l.label}</button>
                                        )
                                    }
                                    return (
                                        <Link key={l.label} to={l.to!} style={base}
                                              onMouseEnter={e => { e.currentTarget.style.color = T.text; e.currentTarget.style.background = T.accentLight }}
                                              onMouseLeave={e => { e.currentTarget.style.color = T.muted; e.currentTarget.style.background = "transparent" }}
                                        >{l.label}</Link>
                                    )
                                })}
                            </nav>

                            {/* Actions */}
                            <div className="flex items-center gap-2.5">
                                <Link to="/login" className="hidden sm:inline-flex"
                                      style={{ padding: "7px 16px", borderRadius: 10, fontWeight: 500, fontSize: 14, textDecoration: "none", color: T.muted, border: `1px solid ${T.border}`, background: "transparent", transition: "all 0.18s", letterSpacing: "-0.01em" }}
                                      onMouseEnter={e => { e.currentTarget.style.borderColor = T.accentMid; e.currentTarget.style.color = T.accent; e.currentTarget.style.background = T.accentLight }}
                                      onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.muted; e.currentTarget.style.background = "transparent" }}
                                >
                                    Увійти
                                </Link>

                                <Link to="/dashboard" className="hidden sm:inline-flex items-center gap-1.5"
                                      style={{
                                          padding: "8px 20px", borderRadius: 10, fontWeight: 600, fontSize: 14,
                                          textDecoration: "none", background: T.gradient, color: "#fff",
                                          boxShadow: "0 2px 14px rgba(109,40,217,0.32)",
                                          transition: "all 0.2s", letterSpacing: "-0.01em",
                                      }}
                                      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 22px rgba(109,40,217,0.48)"; e.currentTarget.style.transform = "translateY(-1px)" }}
                                      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 14px rgba(109,40,217,0.32)"; e.currentTarget.style.transform = "translateY(0)" }}
                                >
                                    Почати
                                </Link>

                                <button className="md:hidden p-2 rounded-lg" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                        style={{ color: T.text, background: T.accentLight, border: `1px solid ${T.border}`, cursor: "pointer" }}>
                                    {mobileMenuOpen ? <XIcon size={17} /> : <MenuIcon size={17} />}
                                </button>
                            </div>
                        </div>

                        {/* Mobile menu */}
                        <AnimatePresence>
                            {mobileMenuOpen && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                                            className="md:hidden px-5 pb-5" style={{ borderTop: `1px solid ${T.border}` }}>
                                    <div style={{ paddingTop: 12, display: "flex", flexDirection: "column", gap: 2 }}>
                                        {navLinks.map(l => {
                                            const s: React.CSSProperties = { display: "block", padding: "10px 12px", color: T.muted, fontSize: 15, background: "transparent", border: "none", cursor: "pointer", textAlign: "left", width: "100%", borderRadius: 10, textDecoration: "none", fontWeight: 500 }
                                            if (l.href) return <button key={l.label} onClick={() => { document.getElementById(l.href!.replace("#", ""))?.scrollIntoView({ behavior: "smooth" }); setMobileMenuOpen(false) }} style={s}>{l.label}</button>
                                            return <Link key={l.label} to={l.to!} onClick={() => setMobileMenuOpen(false)} style={s}>{l.label}</Link>
                                        })}
                                        <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} style={{ display: "block", textAlign: "center", marginTop: 8, padding: "12px", borderRadius: 12, fontWeight: 600, fontSize: 14, background: T.gradient, color: "#fff", textDecoration: "none" }}>
                                            Почати безкоштовно
                                        </Link>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
            <div className="h-[62px]" />
        </>
    )
}