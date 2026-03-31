import { Children, isValidElement, useState, useEffect, useCallback, useMemo, type ReactNode } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from "react-markdown"
import type { Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import usePageTitle from "@/shared/hooks/usePageTitle.ts"
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

type TocHeading = {
    id: string
    label: string
    level: 2 | 3
}

const DEFAULT_DOC_ID = "quickstart"

const sidebarSections = [
    {
        title: "Початок роботи",
        icon: RocketIcon,
        colorClass: "text-emerald-500",
        items: [
            { id: "quickstart", label: "Швидкий старт" },
            { id: "installation", label: "Встановлення" },
            { id: "first-steps", label: "Перші кроки" },
        ],
    },
    {
        title: "API",
        icon: CodeIcon,
        colorClass: "text-sky-500",
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
        colorClass: "text-amber-500",
        items: [
            { id: "google-calendar", label: "Google Calendar" },
            { id: "telegram", label: "Telegram Bot" },
            { id: "webhooks", label: "Webhooks" },
        ],
    },
    {
        title: "FAQ",
        icon: HelpCircleIcon,
        colorClass: "text-violet-500",
        items: [
            { id: "faq-general", label: "Загальне" },
            { id: "faq-billing", label: "Оплата" },
            { id: "faq-security", label: "Безпека" },
        ],
    },
]

const allDocs = sidebarSections.flatMap((section) => section.items)

function isKnownDoc(id: string | null): id is DocId {
    return Boolean(id && allDocs.some((item) => item.id === id))
}

function slugify(value: string) {
    return value
        .toLowerCase()
        .trim()
        .normalize("NFKD")
        .replace(/[^\p{L}\p{N}\s-]/gu, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
}

function getNodeText(children: ReactNode): string {
    return Children.toArray(children)
        .map((child) => {
            if (typeof child === "string" || typeof child === "number") {
                return String(child)
            }

            if (isValidElement(child)) {
                return getNodeText((child.props as { children?: ReactNode }).children)
            }

            return ""
        })
        .join("")
}

function extractHeadings(content: string): TocHeading[] {
    return content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.startsWith("## ") || line.startsWith("### "))
        .map((line) => {
            const isThirdLevel = line.startsWith("### ")
            const label = line.replace(/^###?\s/, "").trim()

            return {
                id: slugify(label),
                label,
                level: isThirdLevel ? 3 : 2,
            }
        })
}

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

function getDocLead(id: DocId) {
    const section = getSectionForDoc(id)

    if (!section) {
        return "Структурована документація по платформі та її ключових можливостях."
    }

    return {
        "Початок роботи":
            "Базові сценарії старту, налаштування середовища та перший вхід у продукт.",
        API: "Ендпоінти, контракти, структура запитів та робота з даними.",
        "Інтеграції":
            "Підключення зовнішніх сервісів, webhooks та інтеграційних сценаріїв.",
        FAQ: "Короткі відповіді на найпоширеніші питання та типові проблеми.",
    }[section.title] as string
}

function buildComponents(): Components {
    return {
        h1: ({ children }) => (
            <h1
                id={slugify(getNodeText(children))}
                data-doc-heading="true"
                className="mt-8 mb-5 border-b border-slate-200 pb-4 text-4xl font-semibold tracking-tight text-slate-950"
            >
                {children}
            </h1>
        ),

        h2: ({ children }) => (
            <h2
                id={slugify(getNodeText(children))}
                data-doc-heading="true"
                className="mt-10 mb-4 scroll-mt-28 text-2xl font-semibold tracking-tight text-slate-950"
            >
                {children}
            </h2>
        ),

        h3: ({ children }) => (
            <h3
                id={slugify(getNodeText(children))}
                data-doc-heading="true"
                className="mt-8 mb-3 scroll-mt-28 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
            >
                {children}
            </h3>
        ),

        p: ({ children }) => <p className="mb-4 text-[15px] leading-8 text-slate-700">{children}</p>,

        ul: ({ children }) => <ul className="mb-5 space-y-2">{children}</ul>,

        ol: ({ children }) => <ol className="mb-5 list-decimal space-y-2 pl-5 text-slate-700">{children}</ol>,

        li: ({ children }) => (
            <li className="relative pl-5 text-[15px] leading-8 text-slate-700 before:absolute before:left-0 before:top-3 before:h-2 before:w-2 before:rounded-full before:bg-amber-400">
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
                        className="rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 font-mono text-[12px] text-amber-900"
                    >
                        {children}
                    </code>
                )
            }

            return (
                <div className="my-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-sm">
                    <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
                        <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                        </div>

                        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">
                            {language || "code"}
                        </span>
                    </div>

                    <pre className="overflow-x-auto p-4">
                        <code
                            {...props}
                            className={className}
                            style={{
                                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace",
                                fontSize: "13px",
                                lineHeight: "1.75",
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
                className="font-medium text-sky-700 underline decoration-sky-200 underline-offset-4 transition-colors hover:text-sky-900 hover:decoration-sky-400"
            >
                {children}
            </a>
        ),

        blockquote: ({ children }) => (
            <blockquote className="my-6 rounded-r-2xl border-l-4 border-amber-400 bg-amber-50/70 px-5 py-4 text-slate-700">
                {children}
            </blockquote>
        ),

        table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full min-w-[520px] border-collapse bg-white">{children}</table>
            </div>
        ),

        th: ({ children }) => (
            <th className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                {children}
            </th>
        ),

        td: ({ children }) => (
            <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700">{children}</td>
        ),

        hr: () => <hr className="my-10 border-slate-200" />,
    }
}

function DocSkeleton() {
    return (
        <div className="animate-pulse py-4">
            <div className="mb-6 h-10 w-2/3 rounded-xl bg-slate-200" />
            <div className="mb-3 h-4 w-1/3 rounded-full bg-slate-200" />
            <div className="mb-3 h-4 w-full rounded-full bg-slate-200" />
            <div className="mb-3 h-4 w-4/5 rounded-full bg-slate-200" />
            <div className="h-4 w-3/5 rounded-full bg-slate-200" />
        </div>
    )
}

function DocError({ docId }: { docId: DocId }) {
    return (
        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                <FileTextIcon size={26} />
            </div>

            <h3 className="mb-2 text-xl font-semibold text-slate-900">Документ не знайдено</h3>
            <p className="mb-2 text-sm text-slate-600">
                Не вдалося завантажити <code>/docs/{docId}.md</code>
            </p>
            <p className="text-sm text-slate-500">Перевір, чи файл існує в public/docs/.</p>
        </div>
    )
}

export function DocsPage() {
    usePageTitle("Документація — Univa")

    const [searchParams, setSearchParams] = useSearchParams()
    const requestedDoc = searchParams.get("doc")
    const initialDoc = isKnownDoc(requestedDoc) ? requestedDoc : DEFAULT_DOC_ID

    const [activeDoc, setActiveDoc] = useState<DocId>(initialDoc)
    const [content, setContent] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [search, setSearch] = useState("")
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [activeHeading, setActiveHeading] = useState("")
    const [isMobileSidebar, setIsMobileSidebar] = useState(
        typeof window !== "undefined" ? window.innerWidth < 1024 : false,
    )

    useEffect(() => {
        const handleResize = () => {
            setIsMobileSidebar(window.innerWidth < 1024)
        }

        handleResize()
        window.addEventListener("resize", handleResize)

        return () => window.removeEventListener("resize", handleResize)
    }, [])

    useEffect(() => {
        if (!isMobileSidebar) {
            setSidebarOpen(false)
        }
    }, [isMobileSidebar])

    useEffect(() => {
        if (activeDoc !== initialDoc) {
            setActiveDoc(initialDoc)
        }
    }, [activeDoc, initialDoc])

    useEffect(() => {
        let cancelled = false

        setLoading(true)
        setError(false)
        setContent("")
        setActiveHeading("")

        fetch(`/docs/${activeDoc}.md`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("not found")
                }

                return response.text()
            })
            .then((text) => {
                if (cancelled) return

                setContent(text)
                setLoading(false)
            })
            .catch(() => {
                if (cancelled) return

                setError(true)
                setLoading(false)
            })

        return () => {
            cancelled = true
        }
    }, [activeDoc])

    useEffect(() => {
        if (loading || error || !content) return

        const headingElements = Array.from(
            document.querySelectorAll<HTMLElement>("[data-doc-heading='true']"),
        )

        if (!headingElements.length) return

        setActiveHeading(headingElements[0].id)

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

                if (visible[0]?.target instanceof HTMLElement) {
                    setActiveHeading(visible[0].target.id)
                }
            },
            {
                rootMargin: "-15% 0px -70% 0px",
                threshold: [0, 1],
            },
        )

        headingElements.forEach((element) => observer.observe(element))

        return () => observer.disconnect()
    }, [content, loading, error])

    const navigate = useCallback(
        (id: DocId) => {
            setActiveDoc(id)
            setSidebarOpen(false)
            setActiveHeading("")

            const nextParams = new URLSearchParams(searchParams)

            if (id === DEFAULT_DOC_ID) {
                nextParams.delete("doc")
            } else {
                nextParams.set("doc", id)
            }

            setSearchParams(nextParams)
            window.scrollTo({ top: 0, behavior: "smooth" })
        },
        [searchParams, setSearchParams],
    )

    const filtered = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase()

        if (!normalizedSearch) {
            return sidebarSections
        }

        return sidebarSections
            .map((section) => {
                const matchesSection = section.title.toLowerCase().includes(normalizedSearch)
                const items = matchesSection
                    ? section.items
                    : section.items.filter((item) =>
                        `${item.label} ${item.id}`.toLowerCase().includes(normalizedSearch),
                    )

                return {
                    ...section,
                    items,
                }
            })
            .filter((section) => section.items.length > 0)
    }, [search])

    const activeSection = getSectionForDoc(activeDoc)
    const markdownComponents = useMemo(() => buildComponents(), [])
    const headings = useMemo(() => extractHeadings(content), [content])

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.12),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.09),_transparent_20%),linear-gradient(to_bottom,_#f8fafc,_#f8fafc)] text-slate-900">
            <style>{`
                .hljs { background: transparent !important; padding: 0 !important; }
                .hljs-keyword, .hljs-selector-tag, .hljs-literal { color: #c084fc !important; }
                .hljs-string, .hljs-doctag { color: #86efac !important; }
                .hljs-comment { color: #64748b !important; font-style: italic; }
                .hljs-number, .hljs-attr, .hljs-attribute { color: #7dd3fc !important; }
                .hljs-title, .hljs-section, .hljs-built_in { color: #fcd34d !important; }
            `}</style>

            <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                        <button
                            type="button"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm lg:hidden"
                            onClick={() => setSidebarOpen((prev) => !prev)}
                            aria-label="Відкрити меню"
                        >
                            {sidebarOpen ? <XIcon size={18} /> : <MenuIcon size={18} />}
                        </button>

                        <Link to="/" className="flex shrink-0 items-center">
                            <img
                                src={logoConfig["full-logo-black-no-bg"]}
                                alt="Univa"
                                className="h-7 object-contain"
                            />
                        </Link>

                        <div className="hidden h-5 w-px bg-slate-200 sm:block" />

                        <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-slate-900">
                                {activeSection?.title ?? "Документація"}
                            </div>
                            <div className="truncate text-xs text-slate-500">{getDocLabel(activeDoc)}</div>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
                    >
                        <Link to="/">
                            На головну <ExternalLinkIcon size={13} />
                        </Link>
                    </Button>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
                {sidebarOpen && isMobileSidebar && (
                    <div
                        className="fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-[2px] lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_220px]">
                    <aside
                        className={[
                            "z-40 rounded-3xl border border-slate-200 bg-white shadow-sm",
                            "lg:sticky lg:top-24 lg:block lg:h-[calc(100vh-7rem)] lg:overflow-y-auto",
                            isMobileSidebar
                                ? `fixed left-4 top-24 h-[calc(100vh-7rem)] w-[min(86vw,320px)] overflow-y-auto transition-transform duration-200 ${
                                    sidebarOpen ? "translate-x-0" : "-translate-x-[120%]"
                                }`
                                : "",
                        ].join(" ")}
                    >
                        <div className="border-b border-slate-100 p-5">
                            <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                Навігація
                            </div>
                            <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                                Документація
                            </h2>
                        </div>

                        <div className="p-4">
                            <div className="mb-4 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                                <SearchIcon size={15} className="shrink-0 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Пошук по розділах..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                                />
                            </div>

                            {filtered.length === 0 ? (
                                <div className="px-2 py-2 text-sm text-slate-500">Нічого не знайдено.</div>
                            ) : (
                                <div className="space-y-3">
                                    {filtered.map((section) => (
                                        <div key={section.title} className="rounded-2xl p-1">
                                            <div className="mb-1 flex items-center gap-2 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                                                <section.icon size={13} className={section.colorClass} />
                                                {section.title}
                                            </div>

                                            <div className="space-y-1">
                                                {section.items.map((item) => {
                                                    const isActive = activeDoc === item.id

                                                    return (
                                                        <button
                                                            key={item.id}
                                                            type="button"
                                                            onClick={() => navigate(item.id)}
                                                            className={[
                                                                "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition",
                                                                isActive
                                                                    ? "bg-amber-50 text-amber-900 ring-1 ring-amber-200"
                                                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                                                            ].join(" ")}
                                                        >
                                                            <span>{item.label}</span>
                                                            <span
                                                                className={[
                                                                    "h-2 w-2 rounded-full transition",
                                                                    isActive ? "bg-amber-400" : "bg-transparent",
                                                                ].join(" ")}
                                                            />
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </aside>

                    <main className="min-w-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeDoc}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.22, ease: "easeOut" }}
                            >
                                <section className="mb-5 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                                    <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
                                        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                            <span>Docs</span>
                                            <ChevronRightIcon size={12} />
                                            {activeSection && (
                                                <>
                                                    <span className="font-medium text-slate-700">
                                                        {activeSection.title}
                                                    </span>
                                                    <ChevronRightIcon size={12} />
                                                </>
                                            )}
                                            <span>{getDocLabel(activeDoc)}</span>
                                        </div>

                                        <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                                            {getDocLabel(activeDoc)}
                                        </h1>

                                        <p className="mt-4 max-w-2xl text-[15px] leading-8 text-slate-600">
                                            {getDocLead(activeDoc)}
                                        </p>

                                        <div className="mt-5 flex flex-wrap gap-2">
                                            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                                                Розділ: {activeSection?.title ?? "Docs"}
                                            </div>
                                            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                                                Секцій: {headings.length || 0}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-6 py-6 sm:px-8">
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
                                    </div>
                                </section>
                            </motion.div>
                        </AnimatePresence>
                    </main>

                    <aside className="hidden xl:block">
                        <TocPanel headings={headings} activeHeading={activeHeading} />
                    </aside>
                </div>
            </div>
        </div>
    )
}

function TocPanel({
                      headings,
                      activeHeading,
                  }: {
    headings: TocHeading[]
    activeHeading: string
}) {
    if (!headings.length) return null

    return (
        <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                На цій сторінці
            </div>

            <div className="space-y-1">
                {headings.map((heading) => (
                    <button
                        key={heading.id}
                        type="button"
                        onClick={() => {
                            const element = document.getElementById(heading.id)
                            if (element) {
                                element.scrollIntoView({ behavior: "smooth", block: "start" })
                            }
                        }}
                        className={[
                            "block w-full rounded-xl px-3 py-2 text-left text-sm transition",
                            heading.level === 3 ? "pl-6 text-xs" : "",
                            activeHeading === heading.id
                                ? "bg-amber-50 text-amber-900 ring-1 ring-amber-200"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                        ].join(" ")}
                    >
                        {heading.label}
                    </button>
                ))}
            </div>
        </div>
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
        <div className="mt-10 grid gap-3 border-t border-slate-200 pt-6 sm:grid-cols-2">
            {prev ? (
                <button
                    type="button"
                    onClick={() => onNavigate(prev.id)}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-left transition hover:bg-white hover:shadow-sm"
                >
                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                        ← Попередня
                    </div>
                    <div className="text-sm font-medium text-slate-900">{prev.label}</div>
                </button>
            ) : (
                <div />
            )}

            {next ? (
                <button
                    type="button"
                    onClick={() => onNavigate(next.id)}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-right transition hover:bg-white hover:shadow-sm"
                >
                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                        Наступна →
                    </div>
                    <div className="text-sm font-medium text-slate-900">{next.label}</div>
                </button>
            ) : (
                <div />
            )}
        </div>
    )
}