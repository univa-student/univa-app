import { useState, useMemo } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    CalendarIcon,
    AlertCircleIcon,
    CalendarDaysIcon,
    LayoutGridIcon,
    GraduationCapIcon,
    BookOpenIcon,
} from "lucide-react"
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns"
import { SidebarGroup } from "@/shared/shadcn/ui/sidebar"
import { Button } from "@/shared/shadcn/ui/button"
import { Separator } from "@/shared/shadcn/ui/separator"
import { Skeleton } from "@/shared/shadcn/ui/skeleton"

import { useSchedule } from "@/entities/schedule/api/hooks"
import { useDeadlines } from "@/entities/deadline/api/hooks"
import type { LessonInstance } from "@/entities/schedule/model/types"
import type { Deadline } from "@/entities/deadline/model/types"

/* ─────────────────────────── Types ─────────────────────────── */

type EventType = "class" | "deadline" | "event"

interface CalendarEvent {
    id: string
    date: string   // "YYYY-MM-DD"
    title: string
    subtitle?: string
    time?: string
    type: EventType
    accent?: string
    isOverdue?: boolean
    isCompleted?: boolean
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

/* ─────────────────────────── Event config ───────────────────── */

const EV_CFG = {
    class: {
        dot: "bg-blue-500",
        icon: BookOpenIcon,
        color: "text-blue-400",
        bg: "bg-blue-500/8 dark:bg-blue-500/10",
        activeBg: "bg-blue-500/12",
        border: "border-blue-500/15",
        label: "Пари",
    },
    deadline: {
        dot: "bg-rose-500",
        icon: AlertCircleIcon,
        color: "text-rose-400",
        bg: "bg-rose-500/8 dark:bg-rose-500/10",
        activeBg: "bg-rose-500/12",
        border: "border-rose-500/15",
        label: "Дедлайни",
    },
    event: {
        dot: "bg-amber-500",
        icon: GraduationCapIcon,
        color: "text-amber-400",
        bg: "bg-amber-500/8 dark:bg-amber-500/10",
        activeBg: "bg-amber-500/12",
        border: "border-amber-500/15",
        label: "Іспити",
    },
} as const

/* ─────────────────────────── Helpers ───────────────────────── */

function toKey(y: number, m: number, d: number) {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
}

function parseKey(key: string): [number, number, number] {
    const [y, m, d] = key.split("-").map(Number)
    return [y, m - 1, d]
}

function fmtTime(t: string | null | undefined): string | undefined {
    if (!t) return undefined
    return t.slice(0, 5)
}

function getMonthCells(year: number, month: number) {
    let startDow = new Date(year, month, 1).getDay() - 1
    if (startDow < 0) startDow = 6
    const dim = new Date(year, month + 1, 0).getDate()
    const prevDim = new Date(year, month, 0).getDate()
    const [pm, py] = month === 0 ? [11, year - 1] : [month - 1, year]
    const [nm, ny] = month === 11 ? [0, year + 1] : [month + 1, year]

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

/* ── Map API data to CalendarEvent ────────────────────────── */

function mapLessons(instances: LessonInstance[]): CalendarEvent[] {
    return instances.map(inst => ({
        id: `lesson-${inst.source}-${inst.id}-${inst.date}`,
        date: inst.date,
        title: inst.subject?.name ?? "Предмет",
        subtitle: inst.lessonType?.name ?? undefined,
        time: fmtTime(inst.startsAt),
        type: inst.source === "exam" ? "event" as EventType : "class" as EventType,
        accent: inst.subject?.color ?? undefined,
    }))
}

function mapDeadlines(deadlines: Deadline[]): CalendarEvent[] {
    const now = new Date()
    return deadlines
        .filter(d => d.status !== "cancelled")
        .map(d => {
            const dt = new Date(d.dueAt)
            return {
                id: `deadline-${d.id}`,
                date: format(dt, "yyyy-MM-dd"),
                title: d.title,
                time: fmtTime(format(dt, "HH:mm")),
                type: "deadline" as EventType,
                isOverdue: dt < now && d.status !== "completed",
                isCompleted: d.status === "completed",
            }
        })
}

/* ─────────────────────────── Component ─────────────────────── */

export function SidebarCalendar() {
    const today = new Date()
    const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate())

    /* State */
    const [viewYear, setViewYear] = useState(today.getFullYear())
    const [viewMonth, setViewMonth] = useState(today.getMonth())
    const [viewDay, setViewDay] = useState(today.getDate())
    const [selectedKey, setSelectedKey] = useState<string | null>(todayKey)
    const [direction, setDirection] = useState(0)
    const [mode, setMode] = useState<"month" | "week">("month")
    const [activeFilters, setActiveFilters] = useState<Set<EventType>>(new Set(["class", "deadline", "event"]))

    /* Compute visible date range for API queries */
    const dateRange = useMemo(() => {
        if (mode === "month") {
            const mStart = startOfMonth(new Date(viewYear, viewMonth, 1))
            const mEnd = endOfMonth(new Date(viewYear, viewMonth, 1))
            const from = startOfWeek(mStart, { weekStartsOn: 1 })
            const to = endOfWeek(mEnd, { weekStartsOn: 1 })
            return { from: format(from, "yyyy-MM-dd"), to: format(to, "yyyy-MM-dd") }
        }
        const wDays = getWeekDays(viewYear, viewMonth, viewDay)
        return { from: wDays[0].key, to: wDays[6].key }
    }, [viewYear, viewMonth, viewDay, mode])

    /* API data */
    const { data: instances = [], isLoading: isLoadingSchedule } = useSchedule(dateRange.from, dateRange.to)
    const { data: deadlines = [], isLoading: isLoadingDeadlines } = useDeadlines({
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
    })
    const isLoading = isLoadingSchedule || isLoadingDeadlines

    /* Merge into CalendarEvent[] */
    const allEvents = useMemo(() => {
        return [...mapLessons(instances), ...mapDeadlines(deadlines)]
    }, [instances, deadlines])

    /* Derived */
    const eventsByDate = useMemo(() => {
        const map: Record<string, CalendarEvent[]> = {}
        allEvents.forEach(e => { (map[e.date] ??= []).push(e) })
        Object.values(map).forEach(arr =>
            arr.sort((a, b) => (a.time ?? "99:99").localeCompare(b.time ?? "99:99"))
        )
        return map
    }, [allEvents])

    const monthCells = useMemo(() => getMonthCells(viewYear, viewMonth), [viewYear, viewMonth])
    const weekDays = useMemo(() => getWeekDays(viewYear, viewMonth, viewDay), [viewYear, viewMonth, viewDay])

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
    }

    const toggleFilter = (t: EventType) => {
        setActiveFilters(prev => {
            const next = new Set(prev)
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            next.has(t) ? next.delete(t) : next.add(t)
            return next
        })
    }

    const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth()

    /* Week label */
    const weekLabel = useMemo(() => {
        if (mode !== "week") return null
        const days = weekDays
        const first = days[0], last = days[6]
        if (first.month === last.month) return `${first.day}–${last.day} ${MONTH_NAMES_SHORT[first.month]} ${first.year}`
        return `${first.day} ${MONTH_NAMES_SHORT[first.month]} – ${last.day} ${MONTH_NAMES_SHORT[last.month]}`
    }, [mode, weekDays])

    /* Selected day label */
    const selectedDayLabel = useMemo(() => {
        if (!selectedKey) return ""
        const [y, m, d] = parseKey(selectedKey)
        const date = new Date(y, m, d)
        const dayName = ["Неділя", "Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця", "Субота"][date.getDay()]
        return `${dayName}, ${d} ${MONTH_NAMES_SHORT[m]}`
    }, [selectedKey])

    /* ── Render helpers ── */

    const renderDotRow = (key: string) => {
        const evs = eventsByDate[key] ?? []
        const hasD = evs.some(e => e.type === "deadline")
        const hasC = evs.some(e => e.type === "class")
        const hasE = evs.some(e => e.type === "event")
        if (!hasD && !hasC && !hasE) return null
        return (
            <span className="flex gap-[3px] absolute bottom-[2px] left-1/2 -translate-x-1/2">
                {hasC && <span className="size-[4px] rounded-full bg-blue-500 shadow-[0_0_3px_rgba(59,130,246,0.5)]" />}
                {hasD && <span className="size-[4px] rounded-full bg-rose-500 shadow-[0_0_3px_rgba(244,63,94,0.5)]" />}
                {hasE && <span className="size-[4px] rounded-full bg-amber-500 shadow-[0_0_3px_rgba(245,158,11,0.5)]" />}
            </span>
        )
    }

    const cellClass = (key: string, current: boolean) => {
        const isToday = key === todayKey
        const isSelected = key === selectedKey
        const hasEvents = (eventsByDate[key] ?? []).length > 0
        return [
            "relative flex flex-col items-center justify-center text-[13px] rounded-lg transition-all duration-150 select-none h-8 w-8",
            current ? "cursor-pointer" : "cursor-default pointer-events-none",
            !current && "text-muted-foreground/20",
            current && !isToday && !isSelected && "text-foreground/80 hover:bg-accent/60 hover:text-foreground",
            current && hasEvents && !isToday && !isSelected && "font-medium text-foreground",
            isToday && !isSelected && "bg-primary text-primary-foreground font-bold shadow-sm shadow-primary/30",
            isSelected && !isToday && "bg-primary/15 text-primary ring-1 ring-primary/40 font-bold",
            isSelected && isToday && "bg-primary text-primary-foreground ring-2 ring-primary/50 ring-offset-1 ring-offset-background font-bold shadow-md shadow-primary/30",
        ].filter(Boolean).join(" ")
    }

    /* ─── JSX ─── */
    return (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden px-3 pb-2">

            {/* ── Header ── */}
            <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                    <CalendarIcon className="size-4 text-primary/70" />
                    <span className="text-[13px] font-bold tracking-tight">
                        {mode === "month" ? `${MONTH_NAMES[viewMonth]} ${viewYear}` : weekLabel}
                    </span>
                </div>
                <div className="flex items-center gap-0.5">
                    {(mode === "month" ? !isCurrentMonth : !weekDays.some(d => d.key === todayKey)) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-[11px] text-primary font-semibold rounded-full hover:bg-primary/10"
                            onClick={goToday}
                        >
                            Сьогодні
                        </Button>
                    )}
                    <div className="flex items-center rounded-lg bg-muted/50 p-0.5">
                        <button
                            onClick={() => setMode("month")}
                            className={[
                                "h-5 w-5 flex items-center justify-center rounded-md transition-all duration-150",
                                mode === "month" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground/60 hover:text-foreground",
                            ].join(" ")}
                            title="Місяць"
                        >
                            <LayoutGridIcon className="size-3.5" />
                        </button>
                        <button
                            onClick={() => {
                                setMode("week")
                                const anchor = selectedKey ?? todayKey
                                const [y, m, d] = parseKey(anchor)
                                setViewYear(y); setViewMonth(m); setViewDay(d)
                            }}
                            className={[
                                "h-5 w-5 flex items-center justify-center rounded-md transition-all duration-150",
                                mode === "week" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground/60 hover:text-foreground",
                            ].join(" ")}
                            title="Тиждень"
                        >
                            <CalendarDaysIcon className="size-3.5" />
                        </button>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full" onClick={() => navigate(-1)}>
                        <ChevronLeftIcon className="size-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full" onClick={() => navigate(1)}>
                        <ChevronRightIcon className="size-4" />
                    </Button>
                </div>
            </div>

            {/* ── Day-of-week headers ── */}
            <div className="grid grid-cols-7 text-center mb-1">
                {DAYS_OF_WEEK.map((d, i) => (
                    <span
                        key={d}
                        className={[
                            "text-[10px] font-semibold uppercase tracking-wider leading-6",
                            i >= 5 ? "text-muted-foreground/40" : "text-muted-foreground/60",
                        ].join(" ")}
                    >
                        {d}
                    </span>
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
                    className="grid grid-cols-7 gap-y-0.5 place-items-center"
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
            <div className="flex items-center gap-1 mt-2.5 flex-wrap">
                {(["class", "deadline", "event"] as EventType[]).map(t => {
                    const cfg = EV_CFG[t]
                    const active = activeFilters.has(t)
                    const count = selectedKey
                        ? (eventsByDate[selectedKey] ?? []).filter(e => e.type === t).length
                        : allEvents.filter(e => e.type === t).length
                    return (
                        <button
                            key={t}
                            onClick={() => toggleFilter(t)}
                            className={[
                                "flex items-center gap-1 rounded-full px-2 py-[3px] text-[10px] font-semibold transition-all duration-150 border",
                                active
                                    ? `${cfg.bg} ${cfg.color} ${cfg.border}`
                                    : "text-muted-foreground/40 border-transparent bg-transparent hover:bg-muted/50",
                            ].join(" ")}
                        >
                            <span className={`size-[5px] rounded-full transition-colors ${active ? cfg.dot : "bg-muted-foreground/25"}`} />
                            {cfg.label}
                            {count > 0 && (
                                <span className={`text-[9px] font-bold ${active ? "opacity-60" : "opacity-40"}`}>
                                    {count}
                                </span>
                            )}
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
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="overflow-hidden"
                    >
                        <Separator className="my-2.5" />

                        {/* Panel header */}
                        <div className="flex items-center justify-between mb-2 px-0.5">
                            <span className="text-[11px] font-bold text-foreground/80 tracking-tight">
                                {selectedDayLabel}
                            </span>
                            {selectedEvents.length > 0 && (
                                <span className="text-[10px] font-medium text-muted-foreground/50 tabular-nums">
                                    {selectedEvents.length}
                                </span>
                            )}
                        </div>

                        {/* Events list */}
                        {isLoading ? (
                            <div className="flex flex-col gap-1.5">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-2 px-2 py-1.5">
                                        <Skeleton className="size-4 rounded" />
                                        <Skeleton className="h-3.5 flex-1 rounded" />
                                        <Skeleton className="h-3 w-10 rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : selectedEvents.length === 0 ? (
                            <div className="flex flex-col items-center py-3 gap-1">
                                <CalendarIcon className="size-5 text-muted-foreground/20" />
                                <p className="text-[11px] text-muted-foreground/40 font-medium">Немає подій</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1">
                                <AnimatePresence initial={false}>
                                    {selectedEvents.map(ev => {
                                        const cfg = EV_CFG[ev.type]
                                        const accentColor = ev.accent ?? (ev.type === "class" ? "#3b82f6" : ev.type === "deadline" ? "#f43f5e" : "#f59e0b")
                                        return (
                                            <motion.div
                                                key={ev.id}
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: 10, height: 0, marginBottom: 0 }}
                                                transition={{ duration: 0.15 }}
                                                className={[
                                                    "group flex items-center gap-2 px-2 py-[6px] rounded-lg relative overflow-hidden transition-colors",
                                                    cfg.bg,
                                                    "hover:brightness-105",
                                                    ev.isCompleted && "opacity-50",
                                                ].filter(Boolean).join(" ")}
                                            >
                                                {/* Accent line */}
                                                <span
                                                    className="absolute left-0 inset-y-0 w-[3px] rounded-l-lg"
                                                    style={{ backgroundColor: accentColor }}
                                                />

                                                {/* Icon */}
                                                <div className="ml-1.5 shrink-0">
                                                    <cfg.icon
                                                        className={[
                                                            "size-3.5",
                                                            ev.isOverdue ? "text-rose-500" : cfg.color,
                                                        ].join(" ")}
                                                    />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <p className={[
                                                        "text-[12px] font-semibold truncate leading-tight",
                                                        ev.isOverdue && "text-rose-500",
                                                        ev.isCompleted && "line-through",
                                                    ].filter(Boolean).join(" ")}>
                                                        {ev.title}
                                                    </p>
                                                    {ev.subtitle && (
                                                        <p className="text-[10px] text-muted-foreground/50 truncate leading-tight mt-px">
                                                            {ev.subtitle}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Time */}
                                                {ev.time && (
                                                    <span className="text-[11px] font-medium text-muted-foreground/60 tabular-nums shrink-0">
                                                        {ev.time}
                                                    </span>
                                                )}
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
