import {
    addDays,
    addMonths,
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    isSameDay,
    isSameMonth,
    startOfMonth,
    startOfWeek,
    subMonths,
} from "date-fns"
import { useEffect, useMemo, useState, type ComponentPropsWithoutRef } from "react"
import {
    CalendarDaysIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    Clock3Icon,
    RotateCcwIcon,
} from "lucide-react"
import { Button } from "@/shared/shadcn/ui/button"
import { Input } from "@/shared/shadcn/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/shared/shadcn/ui/popover"
import { cn } from "@/shared/shadcn/lib/utils"

type BaseInputProps = Omit<ComponentPropsWithoutRef<"input">, "type" | "value" | "onChange">

interface DateInputProps extends BaseInputProps {
    value: string
    onChange: (value: string) => void
    inputClassName?: string
}

interface TimeInputProps extends BaseInputProps {
    value: string
    onChange: (value: string) => void
    inputClassName?: string
    withSeconds?: boolean
}

interface DateTimeInputProps {
    value: string | null | undefined
    onChange: (value: string) => void
    valueType?: "local" | "iso"
    className?: string
    dateInputClassName?: string
    timeInputClassName?: string
    datePlaceholder?: string
    timePlaceholder?: string
    disabled?: boolean
    required?: boolean
    name?: string
    id?: string
}

const WEEKDAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"]
const ACADEMIC_TIME_SLOTS = ["08:30", "10:05", "11:50", "13:25", "15:10", "16:45", "18:20"]
const DEFAULT_TIME_SLOTS = Array.from({ length: 48 }, (_, index) => {
    const hours = Math.floor(index / 2).toString().padStart(2, "0")
    const minutes = index % 2 === 0 ? "00" : "30"
    return `${hours}:${minutes}`
})

function formatDateValue(value: string): string {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
    if (!match) return ""

    return `${match[3]}.${match[2]}.${match[1]}`
}

function normalizeDateDisplay(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 8)

    if (digits.length <= 2) return digits
    if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`

    return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`
}

function parseDateDisplay(value: string): string | null {
    const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value.trim())
    if (!match) return null

    const day = Number(match[1])
    const month = Number(match[2])
    const year = Number(match[3])
    const date = new Date(year, month - 1, day)

    if (
        Number.isNaN(date.getTime()) ||
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null
    }

    return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`
}

function parseIsoDate(value: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
    if (!match) return null

    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    return Number.isNaN(date.getTime()) ? null : date
}

function formatTimeValue(value: string): string {
    const match = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(value)
    if (!match) return ""

    const hours = Number(match[1])
    const minutes = Number(match[2])

    if (hours > 23 || minutes > 59) return ""

    return `${match[1]}:${match[2]}`
}

function normalizeTimeDisplay(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 4)

    if (digits.length <= 2) return digits

    return `${digits.slice(0, 2)}:${digits.slice(2)}`
}

function parseTimeDisplay(value: string): string | null {
    const match = /^(\d{2}):(\d{2})$/.exec(value.trim())
    if (!match) return null

    const hours = Number(match[1])
    const minutes = Number(match[2])

    if (hours > 23 || minutes > 59) return null

    return `${match[1]}:${match[2]}`
}

function toTimeOutput(value: string, withSeconds = false): string {
    return withSeconds ? `${value}:00` : value
}

function toLocalDateTimeValue(value: string | null | undefined, valueType: "local" | "iso"): string {
    if (!value) return ""

    if (valueType === "local") {
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return value
        if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(value)) return value.replace(" ", "T")
        return ""
    }

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ""

    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    return local.toISOString().slice(0, 16)
}

function fromLocalDateTimeValue(value: string, valueType: "local" | "iso"): string {
    if (!value) return ""

    if (valueType === "local") {
        return value
    }

    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? "" : date.toISOString()
}

function getMonthLabel(date: Date): string {
    return date.toLocaleString("uk-UA", {
        month: "long",
        year: "numeric",
    })
}

function buildCalendarDays(cursor: Date): Date[] {
    const intervalStart = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 })
    const intervalEnd = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 })

    return eachDayOfInterval({
        start: intervalStart,
        end: intervalEnd,
    })
}

function PickerButton({
    children,
    disabled,
}: {
    children: React.ReactNode
    disabled?: boolean
}) {
    return (
        <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={disabled}
            className="absolute top-1/2 right-1.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
            {children}
        </Button>
    )
}

export function DateInput({
    value,
    onChange,
    className,
    inputClassName,
    placeholder = "ДД.ММ.РРРР",
    disabled,
    required,
    name,
    id,
    ...props
}: DateInputProps) {
    const [open, setOpen] = useState(false)
    const [displayValue, setDisplayValue] = useState(() => formatDateValue(value))
    const [monthCursor, setMonthCursor] = useState(() => parseIsoDate(value) ?? new Date())
    const selectedDate = parseIsoDate(value)

    useEffect(() => {
        setDisplayValue(formatDateValue(value))
    }, [value])

    useEffect(() => {
        if (open) {
            setMonthCursor(selectedDate ?? new Date())
        }
    }, [open, selectedDate])

    function commit(nextDisplayValue: string) {
        const normalized = normalizeDateDisplay(nextDisplayValue)
        const parsed = parseDateDisplay(normalized)

        setDisplayValue(parsed ? formatDateValue(parsed) : formatDateValue(value))

        if (nextDisplayValue.trim() === "") {
            onChange("")
            return
        }

        if (parsed) {
            onChange(parsed)
        }
    }

    const days = useMemo(() => buildCalendarDays(monthCursor), [monthCursor])

    return (
        <div className={cn("relative", className)}>
            <Input
                {...props}
                id={id}
                name={name}
                value={displayValue}
                onChange={(event) => {
                    const next = normalizeDateDisplay(event.target.value)
                    setDisplayValue(next)

                    if (next === "") {
                        onChange("")
                        return
                    }

                    const parsed = parseDateDisplay(next)
                    if (parsed) {
                        onChange(parsed)
                    }
                }}
                onBlur={(event) => {
                    props.onBlur?.(event)
                    commit(event.target.value)
                }}
                placeholder={placeholder}
                inputMode="numeric"
                autoComplete="off"
                disabled={disabled}
                required={required}
                className={cn("pr-10", inputClassName)}
            />

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <span>
                        <PickerButton disabled={disabled}>
                            <CalendarDaysIcon className="size-4" />
                        </PickerButton>
                    </span>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-[19rem] p-3">
                    <div className="flex items-center justify-between">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setMonthCursor((current) => subMonths(current, 1))}
                        >
                            <ChevronLeftIcon className="size-4" />
                        </Button>
                        <p className="text-sm font-semibold capitalize text-foreground">
                            {getMonthLabel(monthCursor)}
                        </p>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setMonthCursor((current) => addMonths(current, 1))}
                        >
                            <ChevronRightIcon className="size-4" />
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-1">
                        <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={() => {
                                const today = new Date()
                                const nextValue = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`
                                onChange(nextValue)
                                setDisplayValue(formatDateValue(nextValue))
                                setOpen(false)
                            }}
                        >
                            Сьогодні
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={() => {
                                const tomorrow = addDays(new Date(), 1)
                                const nextValue = `${tomorrow.getFullYear()}-${(tomorrow.getMonth() + 1).toString().padStart(2, "0")}-${tomorrow.getDate().toString().padStart(2, "0")}`
                                onChange(nextValue)
                                setDisplayValue(formatDateValue(nextValue))
                                setOpen(false)
                            }}
                        >
                            Завтра
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            onClick={() => {
                                onChange("")
                                setDisplayValue("")
                                setOpen(false)
                            }}
                        >
                            Очистити
                        </Button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {WEEKDAY_LABELS.map((label) => (
                            <div key={label} className="py-1">
                                {label}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {days.map((day) => {
                            const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
                            const isCurrentMonth = isSameMonth(day, monthCursor)

                            return (
                                <button
                                    key={day.toISOString()}
                                    type="button"
                                    onClick={() => {
                                        const nextValue = `${day.getFullYear()}-${(day.getMonth() + 1).toString().padStart(2, "0")}-${day.getDate().toString().padStart(2, "0")}`
                                        onChange(nextValue)
                                        setDisplayValue(formatDateValue(nextValue))
                                        setOpen(false)
                                    }}
                                    className={cn(
                                        "flex h-9 items-center justify-center rounded-lg text-sm transition-colors",
                                        isSelected
                                            ? "bg-primary font-semibold text-primary-foreground"
                                            : isCurrentMonth
                                                ? "text-foreground hover:bg-muted"
                                                : "text-muted-foreground/45 hover:bg-muted/60",
                                        !isSelected && isSameDay(day, new Date()) && "ring-1 ring-primary/35",
                                    )}
                                >
                                    {day.getDate()}
                                </button>
                            )
                        })}
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Формат вводу: <span className="font-medium text-foreground">ДД.ММ.РРРР</span>
                    </p>
                </PopoverContent>
            </Popover>
        </div>
    )
}

export function TimeInput({
    value,
    onChange,
    className,
    inputClassName,
    placeholder = "ГГ:ХХ",
    disabled,
    required,
    name,
    id,
    withSeconds = false,
    ...props
}: TimeInputProps) {
    const [open, setOpen] = useState(false)
    const [displayValue, setDisplayValue] = useState(() => formatTimeValue(value))

    useEffect(() => {
        setDisplayValue(formatTimeValue(value))
    }, [value])

    function commit(nextDisplayValue: string) {
        const normalized = normalizeTimeDisplay(nextDisplayValue)
        const parsed = parseTimeDisplay(normalized)

        setDisplayValue(parsed ? parsed : formatTimeValue(value))

        if (nextDisplayValue.trim() === "") {
            onChange("")
            return
        }

        if (parsed) {
            onChange(toTimeOutput(parsed, withSeconds))
        }
    }

    return (
        <div className={cn("relative", className)}>
            <Input
                {...props}
                id={id}
                name={name}
                value={displayValue}
                onChange={(event) => {
                    const next = normalizeTimeDisplay(event.target.value)
                    setDisplayValue(next)

                    if (next === "") {
                        onChange("")
                        return
                    }

                    const parsed = parseTimeDisplay(next)
                    if (parsed) {
                        onChange(toTimeOutput(parsed, withSeconds))
                    }
                }}
                onBlur={(event) => {
                    props.onBlur?.(event)
                    commit(event.target.value)
                }}
                placeholder={placeholder}
                inputMode="numeric"
                autoComplete="off"
                disabled={disabled}
                required={required}
                className={cn("pr-10", inputClassName)}
            />

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <span>
                        <PickerButton disabled={disabled}>
                            <Clock3Icon className="size-4" />
                        </PickerButton>
                    </span>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-[19rem] p-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground">Час</p>
                        <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            onClick={() => {
                                onChange("")
                                setDisplayValue("")
                                setOpen(false)
                            }}
                        >
                            Очистити
                        </Button>
                    </div>

                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Пари</p>
                        <div className="flex flex-wrap gap-1">
                            {ACADEMIC_TIME_SLOTS.map((slot) => (
                                <Button
                                    key={slot}
                                    type="button"
                                    variant={formatTimeValue(value) === slot ? "default" : "outline"}
                                    size="xs"
                                    onClick={() => {
                                        onChange(toTimeOutput(slot, withSeconds))
                                        setDisplayValue(slot)
                                        setOpen(false)
                                    }}
                                >
                                    {slot}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-muted-foreground">Швидкий вибір</p>
                            <Button
                                type="button"
                                variant="ghost"
                                size="xs"
                                onClick={() => {
                                    const now = new Date()
                                    const roundedMinutes = now.getMinutes() < 30 ? "00" : "30"
                                    const slot = `${now.getHours().toString().padStart(2, "0")}:${roundedMinutes}`
                                    onChange(toTimeOutput(slot, withSeconds))
                                    setDisplayValue(slot)
                                    setOpen(false)
                                }}
                            >
                                <RotateCcwIcon className="size-3" />
                                Зараз
                            </Button>
                        </div>

                        <div className="grid max-h-48 grid-cols-4 gap-1 overflow-y-auto pr-1">
                            {DEFAULT_TIME_SLOTS.map((slot) => (
                                <Button
                                    key={slot}
                                    type="button"
                                    variant={formatTimeValue(value) === slot ? "default" : "ghost"}
                                    size="xs"
                                    className="justify-center"
                                    onClick={() => {
                                        onChange(toTimeOutput(slot, withSeconds))
                                        setDisplayValue(slot)
                                        setOpen(false)
                                    }}
                                >
                                    {slot}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Формат вводу: <span className="font-medium text-foreground">ГГ:ХХ</span>
                    </p>
                </PopoverContent>
            </Popover>
        </div>
    )
}

export function DateTimeInput({
    value,
    onChange,
    valueType = "local",
    className,
    dateInputClassName,
    timeInputClassName,
    datePlaceholder,
    timePlaceholder,
    disabled,
    required,
    name,
    id,
}: DateTimeInputProps) {
    const localValue = toLocalDateTimeValue(value, valueType)
    const [dateValue, setDateValue] = useState(() => localValue.slice(0, 10))
    const [timeValue, setTimeValue] = useState(() => localValue.slice(11, 16))

    useEffect(() => {
        const nextLocalValue = toLocalDateTimeValue(value, valueType)
        setDateValue(nextLocalValue.slice(0, 10))
        setTimeValue(nextLocalValue.slice(11, 16))
    }, [value, valueType])

    function emit(nextDateValue: string, nextTimeValue: string) {
        if (!nextDateValue && !nextTimeValue) {
            onChange("")
            return
        }

        if (!nextDateValue || !nextTimeValue) {
            return
        }

        onChange(fromLocalDateTimeValue(`${nextDateValue}T${nextTimeValue}`, valueType))
    }

    return (
        <div className={cn("grid gap-2 sm:grid-cols-[minmax(0,1fr)_9rem]", className)}>
            <DateInput
                id={id}
                name={name ? `${name}-date` : undefined}
                value={dateValue}
                onChange={(nextValue) => {
                    setDateValue(nextValue)
                    emit(nextValue, timeValue)
                }}
                disabled={disabled}
                required={required}
                placeholder={datePlaceholder}
                inputClassName={dateInputClassName}
            />
            <TimeInput
                name={name ? `${name}-time` : undefined}
                value={timeValue}
                onChange={(nextValue) => {
                    setTimeValue(formatTimeValue(nextValue))
                    emit(dateValue, formatTimeValue(nextValue))
                }}
                disabled={disabled}
                required={required}
                placeholder={timePlaceholder}
                inputClassName={timeInputClassName}
            />
        </div>
    )
}
