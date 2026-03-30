import { useState, type FormEvent, type ReactNode } from "react";
import { format } from "date-fns";
import {
    BookOpenIcon,
    CalendarIcon,
    ClockIcon,
    FlaskConicalIcon,
    MapPinIcon,
    PlusIcon,
    RefreshCwIcon,
    StickyNoteIcon,
} from "lucide-react";
import {
    useSubjects,
    useCreateLesson,
    useLessonTypes,
    useDeliveryModes,
    useRecurrenceRules,
} from "@/modules/schedule/api/hooks";
import { ModalShell } from "@/shared/ui/modal-shell";

interface Props {
    onClose: () => void;
}

interface LessonForm {
    subjectId: number;
    weekday: number;
    startsAt: string;
    endsAt: string;
    lessonTypeId: number;
    deliveryModeId: number;
    locationText: string;
    note: string;
    recurrenceRuleId: number;
    activeFrom: string;
    activeTo: string;
}

const WEEKDAYS = [
    { value: 1, label: "Понеділок" },
    { value: 2, label: "Вівторок" },
    { value: 3, label: "Середа" },
    { value: 4, label: "Четвер" },
    { value: 5, label: "П'ятниця" },
    { value: 6, label: "Субота" },
    { value: 7, label: "Неділя" },
];

/* ── Field wrapper ── */
function Field({
    label,
    required,
    children,
}: {
    label: string;
    required?: boolean;
    children: ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                {label}
                {required && <span className="ml-0.5 text-red-500">*</span>}
            </label>
            {children}
        </div>
    );
}

const selectCls =
    "h-10 w-full rounded-xl border border-border bg-muted/30 px-3 text-sm font-medium text-foreground " +
    "transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 " +
    "disabled:opacity-50 disabled:cursor-not-allowed appearance-none";

const inputCls =
    "h-10 w-full rounded-xl border border-border bg-muted/30 px-3 text-sm font-medium text-foreground " +
    "placeholder:text-muted-foreground/50 transition-colors hover:bg-muted/50 " +
    "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50";

export function AddLessonModal({ onClose }: Props) {
    const today = format(new Date(), "yyyy-MM-dd");

    const [form, setForm] = useState<LessonForm>({
        subjectId: 0,
        weekday: 1,
        startsAt: "08:30",
        endsAt: "10:05",
        lessonTypeId: 0,
        deliveryModeId: 0,
        locationText: "",
        note: "",
        recurrenceRuleId: 0,
        activeFrom: today,
        activeTo: "",
    });

    const { data: subjects = [] } = useSubjects();
    const { data: lessonTypes = [] } = useLessonTypes();
    const { data: deliveryModes = [] } = useDeliveryModes();
    const { data: recurrenceRules = [] } = useRecurrenceRules();
    const createLesson = useCreateLesson();

    function setField<K extends keyof LessonForm>(key: K, value: LessonForm[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    const isValid =
        form.subjectId > 0 &&
        form.lessonTypeId > 0 &&
        form.deliveryModeId > 0 &&
        form.recurrenceRuleId > 0 &&
        !!form.startsAt &&
        !!form.endsAt;

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!isValid) return;

        await createLesson.mutateAsync({
            subjectId: form.subjectId,
            weekday: form.weekday,
            startsAt: form.startsAt,
            endsAt: form.endsAt,
            lessonTypeId: form.lessonTypeId,
            deliveryModeId: form.deliveryModeId,
            locationText: form.locationText || null,
            note: form.note || null,
            recurrenceRuleId: form.recurrenceRuleId,
            activeFrom: form.activeFrom,
            activeTo: form.activeTo || null,
        });

        onClose();
    }

    return (
        <ModalShell
            isOpen={true}
            onClose={onClose}
            title=""
            className="sm:max-w-[520px] p-0 overflow-hidden"
        >
            <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-border">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <PlusIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h2 className="text-base font-black text-foreground">Додати пару</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Регулярне заняття в розкладі
                    </p>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4 px-6 py-5 overflow-y-auto max-h-[80vh]"
            >
                <Field label="Предмет" required>
                    <div className="relative">
                        <BookOpenIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
                        <select
                            className={selectCls + " pl-9"}
                            value={form.subjectId}
                            onChange={(e) => setField("subjectId", Number(e.target.value))}
                            required
                        >
                            <option value={0} disabled>
                                Оберіть предмет
                            </option>
                            {subjects.map((subject) => (
                                <option key={subject.id} value={subject.id}>
                                    {subject.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </Field>

                <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                        <Field label="День тижня" required>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
                                <select
                                    className={selectCls + " pl-9"}
                                    value={form.weekday}
                                    onChange={(e) => setField("weekday", Number(e.target.value))}
                                >
                                    {WEEKDAYS.map((day) => (
                                        <option key={day.value} value={day.value}>
                                            {day.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </Field>
                    </div>

                    <Field label="Початок" required>
                        <div className="relative">
                            <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
                            <input
                                type="time"
                                className={inputCls + " pl-9"}
                                value={form.startsAt}
                                onChange={(e) => setField("startsAt", e.target.value)}
                                required
                            />
                        </div>
                    </Field>

                    <Field label="Кінець" required>
                        <div className="relative">
                            <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
                            <input
                                type="time"
                                className={inputCls + " pl-9"}
                                value={form.endsAt}
                                onChange={(e) => setField("endsAt", e.target.value)}
                                required
                            />
                        </div>
                    </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Field label="Тип пари" required>
                        <div className="relative">
                            <FlaskConicalIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
                            <select
                                className={selectCls + " pl-9"}
                                value={form.lessonTypeId}
                                onChange={(e) => setField("lessonTypeId", Number(e.target.value))}
                                required
                            >
                                <option value={0} disabled>
                                    Тип
                                </option>
                                {lessonTypes.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </Field>

                    <Field label="Формат" required>
                        <select
                            className={selectCls}
                            value={form.deliveryModeId}
                            onChange={(e) => setField("deliveryModeId", Number(e.target.value))}
                            required
                        >
                            <option value={0} disabled>
                                Формат
                            </option>
                            {deliveryModes.map((mode) => (
                                <option key={mode.id} value={mode.id}>
                                    {mode.name}
                                </option>
                            ))}
                        </select>
                    </Field>
                </div>

                <Field label="Повторення" required>
                    <div className="relative">
                        <RefreshCwIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
                        <select
                            className={selectCls + " pl-9"}
                            value={form.recurrenceRuleId}
                            onChange={(e) => setField("recurrenceRuleId", Number(e.target.value))}
                            required
                        >
                            <option value={0} disabled>
                                Оберіть правило
                            </option>
                            {recurrenceRules.map((rule) => (
                                <option key={rule.id} value={rule.id}>
                                    {rule.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </Field>

                <Field label="Аудиторія / Посилання">
                    <div className="relative">
                        <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
                        <input
                            type="text"
                            className={inputCls + " pl-9"}
                            placeholder="А-201 або https://meet..."
                            value={form.locationText}
                            onChange={(e) => setField("locationText", e.target.value)}
                        />
                    </div>
                </Field>

                <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 flex flex-col gap-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
                        Активний період
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="З" required>
                            <input
                                type="date"
                                className={inputCls}
                                value={form.activeFrom}
                                onChange={(e) => setField("activeFrom", e.target.value)}
                                required
                            />
                        </Field>

                        <Field label="До (включно)">
                            <input
                                type="date"
                                className={inputCls}
                                value={form.activeTo}
                                onChange={(e) => setField("activeTo", e.target.value)}
                            />
                        </Field>
                    </div>
                </div>

                <Field label="Нотатка">
                    <div className="relative">
                        <StickyNoteIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
                        <input
                            type="text"
                            className={inputCls + " pl-9"}
                            placeholder="Необов'язково"
                            value={form.note}
                            onChange={(e) => setField("note", e.target.value)}
                        />
                    </div>
                </Field>

                {createLesson.isError && (
                    <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 px-4 py-3 rounded-xl font-medium">
                        Помилка. Перевірте дані або чи немає конфлікту часу.
                    </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-1 sticky bottom-0 bg-background/95 backdrop-blur-sm -mx-6 px-6 py-3 border-t border-border mt-1">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-9 px-4 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        Скасувати
                    </button>

                    <button
                        type="submit"
                        disabled={!isValid || createLesson.isPending}
                        className="h-9 px-5 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        {createLesson.isPending ? (
                            <span className="flex items-center gap-2">
                                <span className="w-3.5 h-3.5 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                                Збереження…
                            </span>
                        ) : (
                            "Зберегти пару"
                        )}
                    </button>
                </div>
            </form>
        </ModalShell>
    );
}
