import { useState, useEffect } from "react";
import {
    BookOpenIcon,
    CalendarIcon,
    ClockIcon,
    FlaskConicalIcon,
    MapPinIcon,
    PencilIcon,
    RefreshCwIcon,
    StickyNoteIcon,
    TrashIcon,
    PaperclipIcon,
} from "lucide-react";
import {
    useSubjects,
    useUpdateLesson,
    useDeleteLesson,
    useLessonTypes,
    useDeliveryModes,
    useRecurrenceRules,
    useLessonMaterials,
} from "@/modules/schedule/api/hooks";
import type { ScheduleLesson } from "@/modules/schedule/model/types";
import { ModalShell } from "@/shared/ui/modal-shell";
import { FilePreviewDialog } from "@/modules/files/ui/preview-file/file-preview-dialog";
import { isPreviewable } from "@/modules/files/ui/file-type-icon";
import type { FileItem } from "@/modules/files/model/types";
import { API_BASE_URL } from "@/app/config/app.config";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { DateInput, TimeInput } from "@/shared/ui/date-time-input";

interface Props {
    lesson: ScheduleLesson;
    onClose: () => void;
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

function Field({
    label,
    required,
    children,
}: {
    label: string;
    required?: boolean;
    children: React.ReactNode;
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
    "appearance-none transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 " +
    "disabled:cursor-not-allowed disabled:opacity-50";

const inputCls =
    "h-10 w-full rounded-xl border border-border bg-muted/30 px-3 text-sm font-medium text-foreground " +
    "placeholder:text-muted-foreground/50 transition-colors hover:bg-muted/50 " +
    "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50";

type FormState = {
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
};

export function EditLessonModal({ lesson, onClose }: Props) {
    const [form, setForm] = useState<FormState>({
        subjectId: lesson.subjectId,
        weekday: lesson.weekday,
        startsAt: lesson.startsAt,
        endsAt: lesson.endsAt,
        lessonTypeId: lesson.lessonTypeId,
        deliveryModeId: lesson.deliveryModeId,
        locationText: lesson.locationText ?? "",
        note: lesson.note ?? "",
        recurrenceRuleId: lesson.recurrenceRuleId,
        activeFrom: lesson.activeFrom,
        activeTo: lesson.activeTo ?? "",
    });

    const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
    const { data: materials, isLoading: isLoadingMaterials } = useLessonMaterials(lesson.id);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setForm({
            subjectId: lesson.subjectId,
            weekday: lesson.weekday,
            startsAt: lesson.startsAt,
            endsAt: lesson.endsAt,
            lessonTypeId: lesson.lessonTypeId,
            deliveryModeId: lesson.deliveryModeId,
            locationText: lesson.locationText ?? "",
            note: lesson.note ?? "",
            recurrenceRuleId: lesson.recurrenceRuleId,
            activeFrom: lesson.activeFrom,
            activeTo: lesson.activeTo ?? "",
        });
    }, [lesson]);

    const { data: subjects = [] } = useSubjects();
    const { data: lessonTypes = [] } = useLessonTypes();
    const { data: deliveryModes = [] } = useDeliveryModes();
    const { data: recurrenceRules = [] } = useRecurrenceRules();

    const updateLesson = useUpdateLesson();
    const deleteLesson = useDeleteLesson();

    function set<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm(prev => ({ ...prev, [key]: value }));
    }

    const isValid =
        form.subjectId > 0 &&
        form.lessonTypeId > 0 &&
        form.deliveryModeId > 0 &&
        form.recurrenceRuleId > 0 &&
        !!form.startsAt &&
        !!form.endsAt;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!isValid) return;

        await updateLesson.mutateAsync({
            id: lesson.id,
            payload: {
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
            },
        });

        onClose();
    }

    async function handleDelete() {
        if (!confirm("Видалити цю пару з розкладу? Цю дію не можна скасувати.")) {
            return;
        }

        await deleteLesson.mutateAsync(lesson.id);
        onClose();
    }

    return (
        <>
            <ModalShell
                isOpen={true}
                onClose={onClose}
                title=""
                className="overflow-hidden p-0 sm:max-w-[520px]"
            >
                <div className="flex items-center gap-3 border-b border-border px-6 pt-6 pb-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <PencilIcon className="h-5 w-5 text-primary" />
                    </div>

                    <div className="flex-1">
                        <h2 className="text-base font-black text-foreground">
                            Редагувати пару
                        </h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            Змінити дані заняття в розкладі
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleteLesson.isPending}
                        className="flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                        <TrashIcon className="h-4 w-4" />
                        Видалити
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="flex max-h-[80vh] flex-col gap-4 overflow-y-auto px-6 py-5"
                >
                    <Field label="Предмет" required>
                        <div className="relative">
                            <BookOpenIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                            <select
                                className={`${selectCls} pl-9`}
                                value={form.subjectId}
                                onChange={e => set("subjectId", +e.target.value)}
                                required
                            >
                                <option value={0} disabled>
                                    Оберіть предмет
                                </option>
                                {subjects.map(subject => (
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
                                    <CalendarIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                                    <select
                                        className={`${selectCls} pl-9`}
                                        value={form.weekday}
                                        onChange={e => set("weekday", +e.target.value)}
                                    >
                                        {WEEKDAYS.map(day => (
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
                                <ClockIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                                <TimeInput
                                    className="w-full"
                                    inputClassName={`${inputCls} pl-9`}
                                    value={form.startsAt}
                                    onChange={value => set("startsAt", value)}
                                    withSeconds
                                    required
                                />
                            </div>
                        </Field>

                        <Field label="Кінець" required>
                            <div className="relative">
                                <ClockIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                                <TimeInput
                                    className="w-full"
                                    inputClassName={`${inputCls} pl-9`}
                                    value={form.endsAt}
                                    onChange={value => set("endsAt", value)}
                                    withSeconds
                                    required
                                />
                            </div>
                        </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Тип пари" required>
                            <div className="relative">
                                <FlaskConicalIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                                <select
                                    className={`${selectCls} pl-9`}
                                    value={form.lessonTypeId}
                                    onChange={e => set("lessonTypeId", +e.target.value)}
                                    required
                                >
                                    <option value={0} disabled>
                                        Тип
                                    </option>
                                    {lessonTypes.map(type => (
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
                                onChange={e => set("deliveryModeId", +e.target.value)}
                                required
                            >
                                <option value={0} disabled>
                                    Формат
                                </option>
                                {deliveryModes.map(mode => (
                                    <option key={mode.id} value={mode.id}>
                                        {mode.name}
                                    </option>
                                ))}
                            </select>
                        </Field>
                    </div>

                    <Field label="Повторення" required>
                        <div className="relative">
                            <RefreshCwIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                            <select
                                className={`${selectCls} pl-9`}
                                value={form.recurrenceRuleId}
                                onChange={e => set("recurrenceRuleId", +e.target.value)}
                                required
                            >
                                <option value={0} disabled>
                                    Оберіть правило
                                </option>
                                {recurrenceRules.map(rule => (
                                    <option key={rule.id} value={rule.id}>
                                        {rule.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </Field>

                    <Field label="Аудиторія / Посилання">
                        <div className="relative">
                            <MapPinIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                            <input
                                type="text"
                                className={`${inputCls} pl-9`}
                                placeholder="А-201 або https://meet..."
                                value={form.locationText}
                                onChange={e => set("locationText", e.target.value)}
                            />
                        </div>
                    </Field>

                    <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-muted/20 p-3.5">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
                            Активний період
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            <Field label="З" required>
                                <DateInput
                                    inputClassName={inputCls}
                                    value={form.activeFrom}
                                    onChange={value => set("activeFrom", value)}
                                    required
                                />
                            </Field>

                            <Field label="До (включно)">
                                <DateInput
                                    inputClassName={inputCls}
                                    value={form.activeTo}
                                    onChange={value => set("activeTo", value)}
                                />
                            </Field>
                        </div>
                    </div>

                    <Field label="Нотатка">
                        <div className="relative">
                            <StickyNoteIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                            <input
                                type="text"
                                className={`${inputCls} pl-9`}
                                placeholder="Необов'язково"
                                value={form.note}
                                onChange={e => set("note", e.target.value)}
                            />
                        </div>
                    </Field>

                    <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-muted/20 p-3.5 mb-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-1.5">
                            <BookOpenIcon className="h-4 w-4 text-muted-foreground" /> Матеріали заняття
                        </p>
                        {isLoadingMaterials ? (
                            <div className="text-xs text-muted-foreground animate-pulse">Завантаження...</div>
                        ) : (materials && materials.length > 0) ? (
                            <div className="flex flex-wrap gap-1.5">
                                {materials.map(f => (
                                    <button
                                        key={f.id}
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            if (isPreviewable(f.mimeType)) setPreviewFile(f);
                                            else window.open(`${API_BASE_URL}${ENDPOINTS.files.download(f.id)}`, "_blank");
                                        }}
                                        className="flex items-center gap-1 text-[11px] font-medium bg-background hover:bg-muted border border-border/50 px-2 py-1.5 rounded-lg transition-colors text-foreground max-w-[200px]"
                                        title={f.originalName}
                                    >
                                        <PaperclipIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                        <span className="truncate">{f.originalName}</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-xs text-muted-foreground">Немає доступних матеріалів.</div>
                        )}
                    </div>

                    {(updateLesson.isError || deleteLesson.isError) && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-800/50 dark:bg-red-950/40 dark:text-red-400">
                            Помилка. Перевірте дані або спробуйте ще раз.
                        </div>
                    )}

                    <div className="sticky bottom-0 -mx-6 mt-1 flex items-center justify-end gap-2 border-t border-border bg-background/95 px-6 py-3 pt-1 backdrop-blur-sm">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-9 rounded-xl px-4 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            Скасувати
                        </button>

                        <button
                            type="submit"
                            disabled={!isValid || updateLesson.isPending}
                            className="h-9 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {updateLesson.isPending ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
                                    Збереження…
                                </span>
                            ) : (
                                "Зберегти зміни"
                            )}
                        </button>
                    </div>
                </form>
            </ModalShell>

            <FilePreviewDialog
                file={previewFile}
                open={!!previewFile}
                onOpenChange={(v) => !v && setPreviewFile(null)}
            />
        </>
    );
}
