import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from "react-markdown"
import type { Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import usePageTitle from "@/shared/hooks/usePageTitle.ts"
import { GOOGLE_FONTS_URL } from "@/app/config/app.config.ts"
import logoConfig from "@/app/config/logo.config.ts"
import { Button } from "@/shared/shadcn/ui/button.tsx"
import {
    CodeIcon,
    RocketIcon,
    PlugIcon,
    HelpCircleIcon,
    SearchIcon,
    ChevronRightIcon,
    MenuIcon,
    XIcon,
    FileTextIcon,
    ExternalLinkIcon,
} from "lucide-react"

type DocId = string

const sidebarSections = [
    {
        title: "Початок роботи",
        icon: RocketIcon,
        color: "#10b981",
        items: [
            { id: "quickstart", label: "Швидкий старт" },
            { id: "installation", label: "Встановлення" },
            { id: "first-steps", label: "Перші кроки" },
        ],
    },
    {
        title: "API",
        icon: CodeIcon,
        color: "#3b82f6",
        items: [
            { id: "api-auth", label: "Автентифікація" },
            { id: "api-users", label: "Користувачі" },
            { id: "api-projects", label: "Проєкти" },
            { id: "api-files", label: "Файли" },
        ],
    },
    {
        title: "Інтеграції",
        icon: PlugIcon,
        color: "#f59e0b",
        items: [
            { id: "google-calendar", label: "Google Calendar" },
            { id: "telegram", label: "Telegram Bot" },
            { id: "webhooks", label: "Webhooks" },
        ],
    },
    {
        title: "FAQ",
        icon: HelpCircleIcon,
        color: "#a78bfa",
        items: [
            { id: "faq-general", label: "Загальне" },
            { id: "faq-billing", label: "Оплата" },
            { id: "faq-security", label: "Безпека" },
        ],
    },
]

function getSectionForDoc(id: DocId) {
    return sidebarSections.find((section) => section.items.some((item) => item.id === id))
}

function getDocLabel(id: DocId) {
    for (const section of sidebarSections) {
        const item = section.items.find((entry) => entry.id === id)
        if (item) return item.label
    }

    return id
}

function buildComponents(): Components {
    return {
        h1: ({ children }) => (
            <h1
                style={{
                    fontSize: 28,
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    color: "#f1f5f9",
                    marginTop: 40,
                    marginBottom: 16,
                    fontFamily: "'Sora', sans-serif",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    paddingBottom: 12,
                }}
            >
                {children}
            </h1>
        ),

        h2: ({ children }) => (
            <h2
                style={{
                    fontSize: 20,
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    color: "#e2e8f0",
                    marginTop: 36,
                    marginBottom: 12,
                    fontFamily: "'Sora', sans-serif",
                }}
            >
                {children}
            </h2>
        ),

        h3: ({ children }) => (
            <h3
                style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#cbd5e1",
                    marginTop: 24,
                    marginBottom: 8,
                    fontFamily: "'Sora', sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                }}
            >
                {children}
            </h3>
        ),

        p: ({ children }) => (
            <p
                style={{
                    fontSize: 14.5,
                    lineHeight: 1.85,
                    color: "#94a3b8",
                    marginBottom: 14,
                    fontFamily: "'DM Sans', sans-serif",
                }}
            >
                {children}
            </p>
        ),

        ul: ({ children }) => (
            <ul style={{ paddingLeft: 0, marginBottom: 16, listStyle: "none" }}>
                {children}
            </ul>
        ),

        ol: ({ children }) => (
            <ol style={{ paddingLeft: 20, marginBottom: 16, color: "#94a3b8" }}>
                {children}
            </ol>
        ),

        li: ({ children }) => (
            <li
                style={{
                    fontSize: 14.5,
                    lineHeight: 1.75,
                    color: "#94a3b8",
                    marginBottom: 6,
                    paddingLeft: 20,
                    position: "relative",
                    fontFamily: "'DM Sans', sans-serif",
                }}
            >
                <span
                    style={{
                        position: "absolute",
                        left: 0,
                        top: 8,
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: "rgba(139,92,246,0.7)",
                        display: "inline-block",
                    }}
                />
                {children}
            </li>
        ),

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        code: ({ node: _node, className, children, ...props }) => {
            const language = (className || "").replace("language-", "")
            const isInline = !className

            if (isInline) {
                return (
                    <code
                        {...props}
                        className={className}
                        style={{
                            background: "rgba(139,92,246,0.15)",
                            color: "#c4b5fd",
                            padding: "2px 7px",
                            borderRadius: 5,
                            fontSize: 12.5,
                            fontFamily: "'JetBrains Mono', monospace",
                            border: "1px solid rgba(139,92,246,0.2)",
                        }}
                    >
                        {children}
                    </code>
                )
            }

            return (
                <div
                    style={{
                        marginTop: 20,
                        marginBottom: 20,
                        borderRadius: 12,
                        background: "#0d0d14",
                        border: "1px solid rgba(255,255,255,0.06)",
                        overflow: "hidden",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                    }}
                >
                    <div
                        style={{
                            padding: "9px 14px",
                            borderBottom: "1px solid rgba(255,255,255,0.05)",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            background: "rgba(255,255,255,0.02)",
                        }}
                    >
                        <div
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                background: "#ef4444",
                                opacity: 0.8,
                            }}
                        />
                        <div
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                background: "#f59e0b",
                                opacity: 0.8,
                            }}
                        />
                        <div
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                background: "#22c55e",
                                opacity: 0.8,
                            }}
                        />
                        <span
                            style={{
                                marginLeft: 8,
                                fontSize: 10,
                                color: "rgba(255,255,255,0.25)",
                                fontFamily: "'JetBrains Mono', monospace",
                                letterSpacing: "0.08em",
                            }}
                        >
                            {language || "code"}
                        </span>
                    </div>

                    <pre style={{ margin: 0, padding: 0, overflow: "auto" }}>
                        <code
                            {...props}
                            className={className}
                            style={{
                                display: "block",
                                padding: "18px 22px",
                                fontSize: 12.5,
                                lineHeight: 1.7,
                                fontFamily: "'JetBrains Mono', monospace",
                                color: "#e2e8f0",
                            }}
                        >
                            {children}
                        </code>
                    </pre>
                </div>
            )
        },

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        a: ({ node: _node, href, children, ...props }) => (
            <a
                {...props}
                href={href}
                style={{
                    color: "#818cf8",
                    textDecoration: "none",
                    borderBottom: "1px solid rgba(129,140,248,0.3)",
                    transition: "border-color 0.15s",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#818cf8"
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(129,140,248,0.3)"
                }}
            >
                {children}
            </a>
        ),

        blockquote: ({ children }) => (
            <blockquote
                style={{
                    borderLeft: "3px solid rgba(139,92,246,0.6)",
                    paddingLeft: 16,
                    marginLeft: 0,
                    color: "#64748b",
                    fontStyle: "italic",
                }}
            >
                {children}
            </blockquote>
        ),

        table: ({ children }) => (
            <div style={{ overflowX: "auto", marginBottom: 20 }}>
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: 13.5,
                    }}
                >
                    {children}
                </table>
            </div>
        ),

        th: ({ children }) => (
            <th
                style={{
                    padding: "10px 14px",
                    textAlign: "left",
                    background: "rgba(255,255,255,0.04)",
                    color: "#94a3b8",
                    fontWeight: 600,
                    fontSize: 11,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                    fontFamily: "'Sora', sans-serif",
                }}
            >
                {children}
            </th>
        ),

        td: ({ children }) => (
            <td
                style={{
                    padding: "10px 14px",
                    color: "#64748b",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    fontFamily: "'DM Sans', sans-serif",
                }}
            >
                {children}
            </td>
        ),

        hr: () => (
            <hr
                style={{
                    border: "none",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    margin: "32px 0",
                }}
            />
        ),
    }
}

function DocSkeleton() {
    return (
        <div style={{ animation: "pulse 1.5s ease-in-out infinite" }}>
            <style>{`@keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.9} }`}</style>
            {[280, 120, 200, 160, 240].map((width, index) => (
                <div
                    key={index}
                    style={{
                        height: index === 0 ? 36 : 14,
                        width,
                        background: "rgba(255,255,255,0.06)",
                        borderRadius: 6,
                        marginBottom: index === 0 ? 28 : 12,
                    }}
                />
            ))}
        </div>
    )
}

function DocError({ docId }: { docId: DocId }) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "80px 0",
                textAlign: "center",
                gap: 12,
            }}
        >
            <FileTextIcon size={40} style={{ color: "rgba(255,255,255,0.1)" }} />
            <p style={{ color: "#475569", fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>
                Файл <code style={{ color: "#64748b" }}>/docs/{docId}.md</code> не знайдено
            </p>
            <p style={{ color: "#334155", fontSize: 12 }}>
                Переконайтесь, що файл розміщено у папці{" "}
                <code style={{ color: "#475569" }}>public/docs/</code>
            </p>
        </div>
    )
}

export function DocsPage() {
    usePageTitle("Документація — Univa")

    const [activeDoc, setActiveDoc] = useState<DocId>("quickstart")
    const [content, setContent] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [search, setSearch] = useState("")
    const [sidebarOpen, setSidebarOpen] = useState(false)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true)
         
        setError(false)
         
        setContent("")

        fetch(`/docs/${activeDoc}.md`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("not found")
                }

                return response.text()
            })
            .then((text) => {
                setContent(text)
                setLoading(false)
            })
            .catch(() => {
                setError(true)
                setLoading(false)
            })
    }, [activeDoc])

    const navigate = useCallback((id: DocId) => {
        setActiveDoc(id)
        setSidebarOpen(false)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }, [])

    const filtered = sidebarSections
        .map((section) => ({
            ...section,
            items: section.items.filter((item) =>
                item.label.toLowerCase().includes(search.toLowerCase()),
            ),
        }))
        .filter((section) => section.items.length > 0)

    const activeSection = getSectionForDoc(activeDoc)
    const markdownComponents = buildComponents()

    const isMobileSidebar =
        typeof window !== "undefined" && window.innerWidth < 768

    return (
        <div
            style={{
                background: "#080810",
                minHeight: "100vh",
                color: "#f1f5f9",
                fontFamily: "'DM Sans', sans-serif",
            }}
        >
            <style>{`
                @import url('${GOOGLE_FONTS_URL}');
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
                * { box-sizing: border-box; }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
                ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

                .hljs { background: transparent !important; padding: 0 !important; }
                .hljs-keyword { color: #c084fc !important; }
                .hljs-string  { color: #86efac !important; }
                .hljs-comment { color: #475569 !important; font-style: italic; }
                .hljs-number  { color: #67e8f9 !important; }
                .hljs-built_in { color: #f9a8d4 !important; }
                .hljs-variable { color: #93c5fd !important; }
                .hljs-attr    { color: #fca5a5 !important; }
                .hljs-title   { color: #a5f3fc !important; }

                .doc-nav-item { transition: all 0.15s ease; }
                .doc-nav-item:hover { background: rgba(255,255,255,0.04) !important; }

                @media (max-width: 768px) {
                    .docs-sidebar { transform: translateX(-100%); transition: transform 0.25s ease; }
                    .docs-sidebar.open { transform: translateX(0); }
                }
            `}</style>

            <nav
                style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 100,
                    background: "rgba(8,8,16,0.92)",
                    backdropFilter: "blur(20px)",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 24px",
                        height: 56,
                        maxWidth: 1400,
                        margin: "0 auto",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <button
                            className="md:hidden"
                            onClick={() => setSidebarOpen((prev) => !prev)}
                            style={{
                                background: "none",
                                border: "none",
                                color: "#64748b",
                                cursor: "pointer",
                                padding: 4,
                            }}
                        >
                            {sidebarOpen ? <XIcon size={18} /> : <MenuIcon size={18} />}
                        </button>

                        <Link
                            to="/"
                            style={{
                                textDecoration: "none",
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            <img
                                src={logoConfig["full-logo-white-no-bg"]}
                                alt="Univa"
                                style={{ height: 26 }}
                            />
                        </Link>

                        <div
                            style={{
                                width: 1,
                                height: 18,
                                background: "rgba(255,255,255,0.1)",
                            }}
                        />

                        <span
                            style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: "rgba(255,255,255,0.3)",
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                                fontFamily: "'Sora', sans-serif",
                            }}
                        >
                            Docs
                        </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            style={{
                                fontSize: 12,
                                color: "rgba(255,255,255,0.4)",
                                gap: 4,
                            }}
                        >
                            <Link to="/">
                                На головну <ExternalLinkIcon size={11} />
                            </Link>
                        </Button>
                    </div>
                </div>
            </nav>

            <div
                style={{
                    display: "flex",
                    maxWidth: 1400,
                    margin: "0 auto",
                    position: "relative",
                }}
            >
                {sidebarOpen && (
                    <div
                        onClick={() => setSidebarOpen(false)}
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 39,
                            background: "rgba(0,0,0,0.6)",
                            backdropFilter: "blur(4px)",
                        }}
                    />
                )}

                <aside
                    className={`docs-sidebar ${sidebarOpen ? "open" : ""}`}
                    style={{
                        width: 260,
                        flexShrink: 0,
                        borderRight: "1px solid rgba(255,255,255,0.05)",
                        padding: "20px 0 40px",
                        position: isMobileSidebar ? "fixed" : "sticky",
                        top: 56,
                        left: isMobileSidebar ? 0 : undefined,
                        height: "calc(100vh - 56px)",
                        overflowY: "auto",
                        zIndex: isMobileSidebar ? 40 : undefined,
                        background: isMobileSidebar ? "#0c0c18" : undefined,
                        borderRightColor: isMobileSidebar
                            ? "rgba(255,255,255,0.08)"
                            : "rgba(255,255,255,0.05)",
                    }}
                >
                    <div style={{ padding: "0 16px 20px" }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "8px 12px",
                                borderRadius: 8,
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.07)",
                            }}
                        >
                            <SearchIcon
                                size={13}
                                style={{
                                    color: "rgba(255,255,255,0.25)",
                                    flexShrink: 0,
                                }}
                            />
                            <input
                                type="text"
                                placeholder="Пошук..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    outline: "none",
                                    fontSize: 12.5,
                                    color: "#94a3b8",
                                    width: "100%",
                                    fontFamily: "'DM Sans', sans-serif",
                                }}
                            />
                        </div>
                    </div>

                    {filtered.map((section) => (
                        <div key={section.title} style={{ marginBottom: 6 }}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 7,
                                    padding: "8px 16px 4px",
                                    fontSize: 10,
                                    fontWeight: 700,
                                    color: "rgba(255,255,255,0.2)",
                                    letterSpacing: "0.1em",
                                    textTransform: "uppercase",
                                    fontFamily: "'Sora', sans-serif",
                                }}
                            >
                                <section.icon
                                    size={11}
                                    style={{ color: section.color, opacity: 0.8 }}
                                />
                                {section.title}
                            </div>

                            {section.items.map((item) => {
                                const isActive = activeDoc === item.id

                                return (
                                    <button
                                        key={item.id}
                                        className="doc-nav-item"
                                        onClick={() => navigate(item.id)}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            width: "100%",
                                            padding: "7px 16px 7px 32px",
                                            fontSize: 13,
                                            cursor: "pointer",
                                            textAlign: "left",
                                            fontWeight: isActive ? 600 : 400,
                                            color: isActive ? "#e2e8f0" : "#475569",
                                            background: isActive
                                                ? "rgba(139,92,246,0.1)"
                                                : "transparent",
                                            border: "none",
                                            borderLeft: `2px solid ${
                                                isActive
                                                    ? "rgba(139,92,246,0.8)"
                                                    : "transparent"
                                            }`,
                                            fontFamily: "'DM Sans', sans-serif",
                                            letterSpacing: "-0.01em",
                                            transition: "all 0.15s",
                                        }}
                                    >
                                        {item.label}
                                    </button>
                                )
                            })}
                        </div>
                    ))}
                </aside>

                <main
                    style={{
                        flex: 1,
                        minWidth: 0,
                        padding: "48px 56px 80px",
                        maxWidth: 820,
                    }}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeDoc}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.22, ease: "easeOut" }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    marginBottom: 28,
                                    fontSize: 11,
                                    color: "rgba(255,255,255,0.2)",
                                    fontFamily: "'DM Sans', sans-serif",
                                    letterSpacing: "0.02em",
                                }}
                            >
                                <span>Docs</span>
                                <ChevronRightIcon size={11} />
                                {activeSection && (
                                    <>
                                        <span
                                            style={{
                                                color: activeSection.color,
                                                opacity: 0.7,
                                            }}
                                        >
                                            {activeSection.title}
                                        </span>
                                        <ChevronRightIcon size={11} />
                                    </>
                                )}
                                <span style={{ color: "rgba(255,255,255,0.4)" }}>
                                    {getDocLabel(activeDoc)}
                                </span>
                            </div>

                            {loading ? (
                                <DocSkeleton />
                            ) : error ? (
                                <DocError docId={activeDoc} />
                            ) : (
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeHighlight]}
                                    components={markdownComponents}
                                >
                                    {content}
                                </ReactMarkdown>
                            )}

                            {!loading && !error && (
                                <NavFooter activeDoc={activeDoc} onNavigate={navigate} />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </main>

                <aside
                    style={{
                        width: 200,
                        flexShrink: 0,
                        padding: "52px 24px",
                        position: "sticky",
                        top: 56,
                        height: "calc(100vh - 56px)",
                        overflowY: "auto",
                    }}
                    className="hidden xl:block"
                >
                    <TocPanel content={content} />
                </aside>
            </div>
        </div>
    )
}

function TocPanel({ content }: { content: string }) {
    const headings = content
        .split("\n")
        .filter((line: string) => line.startsWith("## "))
        .map((line: string) => line.replace("## ", "").trim())

    if (!headings.length) return null

    return (
        <>
            <p
                style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.2)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: 12,
                    fontFamily: "'Sora', sans-serif",
                }}
            >
                На цій сторінці
            </p>

            {headings.map((heading: string, index: number) => (
                <p
                    key={index}
                    style={{
                        fontSize: 12,
                        color: "#334155",
                        marginBottom: 8,
                        lineHeight: 1.4,
                        fontFamily: "'DM Sans', sans-serif",
                        cursor: "pointer",
                        transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = "#94a3b8"
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = "#334155"
                    }}
                >
                    {heading}
                </p>
            ))}
        </>
    )
}

function NavFooter({
                       activeDoc,
                       onNavigate,
                   }: {
    activeDoc: DocId
    onNavigate: (id: DocId) => void
}) {
    const allItems = sidebarSections.flatMap((section) => section.items)
    const currentIndex = allItems.findIndex((item) => item.id === activeDoc)
    const prev = allItems[currentIndex - 1]
    const next = allItems[currentIndex + 1]

    if (!prev && !next) return null

    return (
        <div
            style={{
                marginTop: 56,
                paddingTop: 24,
                borderTop: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
            }}
        >
            {prev ? (
                <button
                    onClick={() => onNavigate(prev.id)}
                    style={{
                        flex: 1,
                        padding: "16px 20px",
                        borderRadius: 10,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        cursor: "pointer",
                        textAlign: "left",
                        color: "#64748b",
                        fontSize: 12,
                        fontFamily: "'DM Sans', sans-serif",
                        transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.06)"
                        e.currentTarget.style.color = "#94a3b8"
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.03)"
                        e.currentTarget.style.color = "#64748b"
                    }}
                >
                    <div
                        style={{
                            fontSize: 10,
                            marginBottom: 4,
                            opacity: 0.5,
                            letterSpacing: "0.05em",
                        }}
                    >
                        ← ПОПЕРЕДНЯ
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{prev.label}</div>
                </button>
            ) : (
                <div style={{ flex: 1 }} />
            )}

            {next ? (
                <button
                    onClick={() => onNavigate(next.id)}
                    style={{
                        flex: 1,
                        padding: "16px 20px",
                        borderRadius: 10,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        cursor: "pointer",
                        textAlign: "right",
                        color: "#64748b",
                        fontSize: 12,
                        fontFamily: "'DM Sans', sans-serif",
                        transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.06)"
                        e.currentTarget.style.color = "#94a3b8"
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.03)"
                        e.currentTarget.style.color = "#64748b"
                    }}
                >
                    <div
                        style={{
                            fontSize: 10,
                            marginBottom: 4,
                            opacity: 0.5,
                            letterSpacing: "0.05em",
                        }}
                    >
                        НАСТУПНА →
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{next.label}</div>
                </button>
            ) : (
                <div style={{ flex: 1 }} />
            )}
        </div>
    )
}