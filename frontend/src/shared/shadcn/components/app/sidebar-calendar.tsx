import { useState, useMemo, useRef, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    CalendarIcon,
    ClockIcon,
    AlertCircleIcon,
    PlusIcon,
    XIcon,
    CalendarDaysIcon,
    LayoutGridIcon,
} from "lucide-react"
import { SidebarGroup } from "@/shared/shadcn/ui/sidebar"
import { Button } from "@/shared/shadcn/ui/button"
import { Separator } from "@/shared/shadcn/ui/separator"
import { Input } from "@/shared/shadcn/ui/input"

/* ─────────────────────────── Types ─────────────────────────── */

type EventType = "class" | "deadline" | "event"

interface CalendarEvent {
    id: string
    date: string   // "YYYY-MM-DD"
    title: string
    time?: string
    type: EventType
}

/* ─────────────────────────── Constants ─────────────────────── */

const DAYS_OF_WEEK = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"] as const

const MONTH_NAMES = [
    "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
    "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень",
] as const

const MONTH_NAMES_SHORT = [
    "Січ", "Лют", "Бер", "Кві", "Тра", "Чер",
    "Лип", "Сер", "Вер", "Жов", "Лис", "Гру",
] as const

const INITIAL_EVENTS: CalendarEvent[] = [
    { id: "e1",  date: "2026-02-24", title: "Вища математика",             time: "08:30", type: "class" },
    { id: "e2",  date: "2026-02-24", title: "Програмування",               time: "10:25", type: "class" },
    { id: "e3",  date: "2026-02-24", title: "Англійська мова",             time: "13:00", type: "class" },
    { id: "e4",  date: "2026-02-25", title: "Бази даних",                  time: "08:30", type: "class" },
    { id: "e5",  date: "2026-02-25", title: "Лабораторна з БД",            time: "23:59", type: "deadline" },
    { id: "e6",  date: "2026-02-26", title: "Есе: Цифрова трансформація",  time: "18:00", type: "deadline" },
    { id: "e7",  date: "2026-02-26", title: "Фізика",                      time: "10:25", type: "class" },
    { id: "e8",  date: "2026-02-27", title: "Філософія",                   time: "12:15", type: "class" },
    { id: "e9",  date: "2026-02-28", title: "Семінар з програмування",     time: "14:00", type: "event" },
    { id: "e10", date: "2026-03-01", title: "Курсова — розділ 2",          time: "12:00", type: "deadline" },
    { id: "e11", date: "2026-03-02", title: "Вища математика",             time: "08:30", type: "class" },
    { id: "e12", date: "2026-03-03", title: "Тест з граматики",            time: "10:00", type: "deadline" },
    { id: "e13", date: "2026-03-03", title: "Англійська мова",             time: "13:00", type: "class" },
    { id: "e14", date: "2026-03-05", title: "Фізика — лаб. робота",        time: "10:25", type: "class" },
    { id: "e15", date: "2026-03-10", title: "Контрольна з математики",     time: "08:30", type: "event" },
    { id: "e16", date: "2026-03-14", title: "Хакатон UniCode",                            type: "event" },
    { id: "e17", date: "2026-03-17", title: "Залік з філософії",           time: "10:00", type: "deadline" },
]

/* ─────────────────────────── Event config ───────────────────── */

const EV_CFG = {
    class:    { dot: "bg-blue-500",   icon: ClockIcon,        color: "text-blue-500",   bg: "bg-blue-500/10",   label: "Пари" },
    deadline: { dot: "bg-rose-500",   icon: AlertCircleIcon,  color: "text-rose-500",   bg: "bg-rose-500/10",   label: "Дедлайни" },
    event:    { dot: "bg-amber-500",  icon: CalendarIcon,     color: "text-amber-500",  bg: "bg-amber-500/10",  label: "Події" },
} as const

/* ─────────────────────────── Helpers ───────────────────────── */

function toKey(y: number, m: number, d: number) {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
}

function parseKey(key: string): [number, number, number] {
    const [y, m, d] = key.split("-").map(Number)
    return [y, m - 1, d]
}

function getMonthCells(year: number, month: number) {
    let startDow = new Date(year, month, 1).getDay() - 1
    if (startDow < 0) startDow = 6
    const dim = new Date(year, month + 1, 0).getDate()
    const prevDim = new Date(year, month, 0).getDate()
    const [pm, py] = month === 0  ? [11, year - 1] : [month - 1, year]
    const [nm, ny] = month === 11 ? [0,  year + 1] : [month + 1, year]

    const cells: { day: number; current: boolean; key: string }[] = []
    for (let i = startDow - 1; i >= 0; i--) {
        const d = prevDim - i
        cells.push({ day: d, current: false, key: toKey(py, pm, d) })
    }
    for (let d = 1; d <= dim; d++) cells.push({ day: d, current: true, key: toKey(year, month, d) })
    const rem = 7 - (cells.length % 7)
    if (rem < 7) for (let d = 1; d <= rem; d++) cells.push({ day: d, current: false, key: toKey(ny, nm, d) })
    return cells
}

/** Returns the 7 days of the ISO week that contains the given date. */
function getWeekDays(year: number, month: number, day: number) {
    const ref = new Date(year, month, day)
    let dow = ref.getDay() - 1
    if (dow < 0) dow = 6
    const monday = new Date(ref)
    monday.setDate(ref.getDate() - dow)
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday)
        d.setDate(monday.getDate() + i)
        return {
            day: d.getDate(),
            month: d.getMonth(),
            year: d.getFullYear(),
            key: toKey(d.getFullYear(), d.getMonth(), d.getDate()),
        }
    })
}

let _id = 100
function nextId() { return String(++_id) }

/* ─────────────────────────── Component ─────────────────────── */

export function SidebarCalendar() {
    const today = new Date()
    const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate())

    /* State */
    const [viewYear, setViewYear]     = useState(today.getFullYear())
    const [viewMonth, setViewMonth]   = useState(today.getMonth())
    const [viewDay, setViewDay]       = useState(today.getDate())   // anchor for week view
    const [selectedKey, setSelectedKey] = useState<string | null>(todayKey)
    const [direction, setDirection]   = useState(0)
    const [mode, setMode]             = useState<"month" | "week">("month")
    const [activeFilters, setActiveFilters] = useState<Set<EventType>>(new Set(["class", "deadline", "event"]))
    const [events, setEvents]         = useState<CalendarEvent[]>(INITIAL_EVENTS)
    const [showAddForm, setShowAddForm] = useState(false)
    const [newTitle, setNewTitle]     = useState("")
    const [newTime, setNewTime]       = useState("")
    const [newType, setNewType]       = useState<EventType>("class")
    const titleRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (showAddForm) setTimeout(() => titleRef.current?.focus(), 50)
    }, [showAddForm])

    /* Derived */
    const eventsByDate = useMemo(() => {
        const map: Record<string, CalendarEvent[]> = {}
        events.forEach(e => { (map[e.date] ??= []).push(e) })
        return map
    }, [events])

    const monthCells = useMemo(() => getMonthCells(viewYear, viewMonth), [viewYear, viewMonth])
    const weekDays   = useMemo(() => getWeekDays(viewYear, viewMonth, viewDay), [viewYear, viewMonth, viewDay])

    const filteredEventsForKey = (key: string) =>
        (eventsByDate[key] ?? []).filter(e => activeFilters.has(e.type))

    const selectedEvents = selectedKey ? filteredEventsForKey(selectedKey) : []

    /* Navigation */
    const navigate = (dir: -1 | 1) => {
        setDirection(dir)
        if (mode === "month") {
            if (dir === -1) {
                if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
                else setViewMonth(m => m - 1)
            } else {
                if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
                else setViewMonth(m => m + 1)
            }
        } else {
            // advance by 7 days
            const ref = new Date(viewYear, viewMonth, viewDay + dir * 7)
            setViewYear(ref.getFullYear())
            setViewMonth(ref.getMonth())
            setViewDay(ref.getDate())
        }
        setSelectedKey(null)
    }

    const goToday = () => {
        setDirection(0)
        setViewYear(today.getFullYear())
        setViewMonth(today.getMonth())
        setViewDay(today.getDate())
        setSelectedKey(todayKey)
    }

    const selectCell = (key: string, isCurrent: boolean) => {
        if (!isCurrent && mode === "month") return
        if (selectedKey === key) { setSelectedKey(null); return }
        setSelectedKey(key)
        setShowAddForm(false)
    }

    const toggleFilter = (t: EventType) => {
        setActiveFilters(prev => {
            const next = new Set(prev)
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            next.has(t) ? next.delete(t) : next.add(t)
            return next
        })
    }

    const addEvent = () => {
        if (!newTitle.trim() || !selectedKey) return
        setEvents(prev => [...prev, {
            id: nextId(),
            date: selectedKey,
            title: newTitle.trim(),
            time: newTime || undefined,
            type: newType,
        }])
        setNewTitle("")
        setNewTime("")
        setNewType("class")
        setShowAddForm(false)
    }

    const deleteEvent = (id: string) => setEvents(prev => prev.filter(e => e.id !== id))

    const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth()

    /* Week label */
    const weekLabel = useMemo(() => {
        if (mode !== "week") return null
        const days = weekDays
        const first = days[0], last = days[6]
        if (first.month === last.month) return `${first.day}–${last.day} ${MONTH_NAMES_SHORT[first.month]} ${first.year}`
        return `${first.day} ${MONTH_NAMES_SHORT[first.month]} – ${last.day} ${MONTH_NAMES_SHORT[last.month]}`
    }, [mode, weekDays])

    /* ── Render helpers ── */

    const renderDotRow = (key: string) => {
        const evs = eventsByDate[key] ?? []
        const hasD = evs.some(e => e.type === "deadline")
        const hasC = evs.some(e => e.type === "class")
        const hasE = evs.some(e => e.type === "event")
        if (!hasD && !hasC && !hasE) return null
        return (
            <span className="flex gap-[2px] absolute bottom-[3px] left-1/2 -translate-x-1/2">
                {hasD && <span className="size-[4px] rounded-full bg-neutral-500" />}
                {hasC && <span className="size-[4px] rounded-full bg-blue-500" />}
                {hasE && <span className="size-[4px] rounded-full bg-amber-500" />}
            </span>
        )
    }

    const cellClass = (key: string, current: boolean) => {
        const isToday    = key === todayKey
        const isSelected = key === selectedKey
        return [
            "relative flex flex-col items-center justify-center text-[13px] rounded-lg transition-all duration-150 select-none h-8 w-8",
            current ? "cursor-pointer" : "cursor-default pointer-events-none",
            !current && "text-muted-foreground/25",
            current && !isToday && !isSelected && "text-foreground hover:bg-accent/60",
            isToday  && !isSelected && "bg-primary/75 text-primary-foreground font-semibold shadow-sm",
            isSelected && !isToday  && "bg-primary/15 text-primary ring-1 ring-primary/40 font-semibold",
            isSelected && isToday   && "bg-primary text-primary-foreground ring-2 ring-primary/60 ring-offset-1 ring-offset-background font-semibold",
        ].filter(Boolean).join(" ")
    }

    /* ─── JSX ─── */
    return (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden px-3 pb-2">

            {/* ── Header ── */}
            <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-semibold tracking-tight">
                    {mode === "month" ? `${MONTH_NAMES[viewMonth]} ${viewYear}` : weekLabel}
                </span>
                <div className="flex items-center gap-0.5">
                    {/* Today button */}
                    {(mode === "month" ? !isCurrentMonth : !weekDays.some(d => d.key === todayKey)) && (
                        <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[11px] text-primary font-medium" onClick={goToday}>
                            Сьогодні
                        </Button>
                    )}
                    {/* Mode toggle */}
                    <Button
                        variant={mode === "month" ? "secondary" : "ghost"}
                        size="sm"
                        className="h-6 w-6 p-0"
                        title="Місяць"
                        onClick={() => setMode("month")}
                    >
                        <LayoutGridIcon className="size-4" />
                    </Button>
                    <Button
                        variant={mode === "week" ? "secondary" : "ghost"}
                        size="sm"
                        className="h-6 w-6 p-0"
                        title="Тиждень"
                        onClick={() => {
                            setMode("week")
                            // anchor week to selected or today
                            const anchor = selectedKey ?? todayKey
                            const [y, m, d] = parseKey(anchor)
                            setViewYear(y); setViewMonth(m); setViewDay(d)
                        }}
                    >
                        <CalendarDaysIcon className="size-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => navigate(-1)}>
                        <ChevronLeftIcon className="size-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => navigate(1)}>
                        <ChevronRightIcon className="size-4" />
                    </Button>
                </div>
            </div>

            {/* ── Day-of-week headers ── */}
            <div className="grid grid-cols-7 text-center mb-0.5">
                {DAYS_OF_WEEK.map(d => (
                    <span key={d} className="text-[11px] font-medium text-muted-foreground/70 leading-6">{d}</span>
                ))}
            </div>

            {/* ── Grid ── */}
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={mode === "month" ? `${viewYear}-${viewMonth}` : `w-${weekDays[0].key}`}
                    initial={{ opacity: 0, x: direction * 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction * -24 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="grid grid-cols-7 gap-y-0.5"
                >
                    {mode === "month" && monthCells.map((cell, i) => (
                        <button
                            key={i}
                            onClick={() => selectCell(cell.key, cell.current)}
                            className={cellClass(cell.key, cell.current)}
                        >
                            <span className="leading-none">{cell.day}</span>
                            {cell.current && renderDotRow(cell.key)}
                        </button>
                    ))}

                    {mode === "week" && weekDays.map((cell, i) => (
                        <button
                            key={i}
                            onClick={() => selectCell(cell.key, true)}
                            className={cellClass(cell.key, true)}
                        >
                            <span className="leading-none">{cell.day}</span>
                            {renderDotRow(cell.key)}
                        </button>
                    ))}
                </motion.div>
            </AnimatePresence>

            {/* ── Filter chips ── */}
            <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                {(["class", "deadline", "event"] as EventType[]).map(t => {
                    const cfg = EV_CFG[t]
                    const active = activeFilters.has(t)
                    return (
                        <button
                            key={t}
                            onClick={() => toggleFilter(t)}
                            className={[
                                "flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition-all duration-150 border",
                                active
                                    ? `${cfg.bg} ${cfg.color} border-current/20`
                                    : "text-muted-foreground/50 border-muted-foreground/15 bg-transparent",
                            ].join(" ")}
                        >
                            <span className={`size-[5px] rounded-full ${active ? cfg.dot : "bg-muted-foreground/30"}`} />
                            {cfg.label}
                        </button>
                    )
                })}
            </div>

            {/* ── Selected day events panel ── */}
            <AnimatePresence initial={false}>
                {selectedKey && (
                    <motion.div
                        key={selectedKey}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="overflow-hidden"
                    >
                        <Separator className="my-2" />

                        {/* Panel header */}
                        <div className="flex items-center justify-between mb-1.5 px-0.5">
                            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                {(() => {
                                    const [m, d] = parseKey(selectedKey)
                                    return `${d} ${MONTH_NAMES_SHORT[m]}`
                                })()}
                            </span>
                            <Button
                                variant="ghost"
                                size="lg"
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                onClick={() => { setShowAddForm(v => !v); setNewTitle(""); setNewTime(""); setNewType("class") }}
                                title="Додати подію"
                            >
                                <motion.div animate={{ rotate: showAddForm ? 45 : 0 }} transition={{ duration: 0.15 }}>
                                    <PlusIcon className="size-4" />
                                </motion.div>
                            </Button>
                        </div>

                        {/* Add event form */}
                        <AnimatePresence>
                            {showAddForm && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="overflow-hidden mb-2"
                                >
                                    <div className="rounded-lg border border-border/60 bg-muted/40 p-2 flex flex-col gap-1.5">
                                        <Input
                                            ref={titleRef}
                                            value={newTitle}
                                            onChange={e => setNewTitle(e.target.value)}
                                            onKeyDown={e => e.key === "Enter" && addEvent()}
                                            placeholder="Назва події…"
                                            className="h-6 text-[11px] px-2 bg-background"
                                        />
                                        <div className="flex gap-1.5">
                                            <Input
                                                value={newTime}
                                                onChange={e => setNewTime(e.target.value)}
                                                placeholder="08:30"
                                                className="h-6 text-[11px] px-2 bg-background w-16 shrink-0"
                                                maxLength={5}
                                            />
                                            {/* Type selector */}
                                            <div className="flex gap-1 flex-1">
                                                {(["class", "deadline", "event"] as EventType[]).map(t => (
                                                    <button
                                                        key={t}
                                                        onClick={() => setNewType(t)}
                                                        className={[
                                                            "flex-1 rounded-md text-[9px] font-medium py-0.5 transition-all border",
                                                            newType === t
                                                                ? `${EV_CFG[t].bg} ${EV_CFG[t].color} border-current/20`
                                                                : "text-muted-foreground/60 border-transparent bg-background",
                                                        ].join(" ")}
                                                    >
                                                        {EV_CFG[t].label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="h-6 text-[11px] font-medium"
                                            onClick={addEvent}
                                            disabled={!newTitle.trim()}
                                        >
                                            Додати
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Events list */}
                        {selectedEvents.length === 0 ? (
                            <p className="text-[11px] text-muted-foreground/60 px-1 py-0.5 italic">Немає подій</p>
                        ) : (
                            <div className="flex flex-col gap-1">
                                <AnimatePresence initial={false}>
                                    {selectedEvents.map(ev => {
                                        const cfg = EV_CFG[ev.type]
                                        return (
                                            <motion.div
                                                key={ev.id}
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: 10, height: 0, marginBottom: 0 }}
                                                transition={{ duration: 0.15 }}
                                                className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg ${cfg.bg} relative overflow-hidden`}
                                            >
                                                {/* Accent line */}
                                                <span className={`absolute left-0 inset-y-0 w-[3px] rounded-l-lg ${cfg.dot}`} />
                                                <cfg.icon className={`size-4 shrink-0 ${cfg.color} ml-1`} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[13px] font-medium truncate leading-tight">{ev.title}</p>
                                                </div>
                                                {ev.time && (
                                                    <span className="text-[12px] text-muted-foreground shrink-0">{ev.time}</span>
                                                )}
                                                <button
                                                    onClick={() => deleteEvent(ev.id)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-0.5 text-muted-foreground/60 hover:text-destructive"
                                                >
                                                    <XIcon className="size-4" />
                                                </button>
                                            </motion.div>
                                        )
                                    })}
                                </AnimatePresence>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </SidebarGroup>
    )
}
