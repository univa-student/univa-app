import { useEffect, useState, type FormEvent } from "react";

import { useUpdateGroup } from "@/modules/groups/api/hooks";
import type { Group, UpdateGroupPayload } from "@/modules/groups/model/types";
import { Button } from "@/shared/shadcn/ui/button";
import { Card, CardContent } from "@/shared/shadcn/ui/card";
import { Input } from "@/shared/shadcn/ui/input";

import { GroupColorPicker } from "../shared/group-color-picker";
import { GroupSelect } from "../shared/group-select";
import { GroupUniversityFields } from "../shared/university-fields";
import { Field, SectionHeader, groupTextAreaClassName } from "../shared/ui";
import { JOIN_POLICY_LABELS, ROLE_LABELS, type GroupRole } from "../shared/view";

interface GroupSettingsSectionProps {
    group: Group;
    canEdit: boolean;
    requiredRole: GroupRole;
}

const ROLE_OPTIONS = (Object.entries(ROLE_LABELS) as Array<[GroupRole, string]>).map(
    ([value, label]) => ({ value, label }),
);

const JOIN_POLICY_OPTIONS = (
    Object.entries(JOIN_POLICY_LABELS) as Array<
        [keyof typeof JOIN_POLICY_LABELS, string]
    >
).map(([value, label]) => ({ value, label }));

const VISIBILITY_OPTIONS = [
    { value: "private", label: "Приватна" },
    { value: "public", label: "Публічна" },
];

function buildForm(group: Group) {
    return {
        name: group.name,
        code: group.code,
        description: group.description ?? "",
        visibility: group.visibility,
        joinPolicy: (group.joinPolicy as UpdateGroupPayload["joinPolicy"]) ?? "invite_or_request",
        color: group.color ?? "#2563eb",
        institutionName: group.institutionName ?? "",
        institutionShortName: group.institutionShortName ?? "",
        facultyName: group.facultyName ?? "",
        specialtyName: group.specialtyName ?? "",
        course: group.course?.toString() ?? "",
        studyYear: group.studyYear?.toString() ?? "",
        inviteRole: (group.inviteRole as GroupRole) ?? "headman",
        editRole: (group.editRole as GroupRole) ?? "moderator",
        manageSubjectsRole: (group.manageSubjectsRole as GroupRole) ?? "headman",
        manageScheduleRole: (group.manageScheduleRole as GroupRole) ?? "headman",
        manageDeadlinesRole: (group.manageDeadlinesRole as GroupRole) ?? "headman",
        manageFilesRole: (group.manageFilesRole as GroupRole) ?? "headman",
        postAnnouncementsRole: (group.postAnnouncementsRole as GroupRole) ?? "headman",
        createPollsRole: (group.createPollsRole as GroupRole) ?? "headman",
    };
}

export function GroupSettingsSection({
    group,
    canEdit,
}: GroupSettingsSectionProps) {
    const updateGroup = useUpdateGroup();
    const [form, setForm] = useState(() => buildForm(group));

    useEffect(() => {
        setForm(buildForm(group));
    }, [group]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        await updateGroup.mutateAsync({
            groupId: group.id,
            payload: {
                name: form.name.trim(),
                code: form.code.trim().toUpperCase(),
                description: form.description.trim() || undefined,
                visibility: form.visibility,
                joinPolicy: form.joinPolicy,
                color: form.color,
                institutionName: form.institutionName.trim() || undefined,
                institutionShortName: form.institutionShortName.trim() || undefined,
                facultyName: form.facultyName.trim() || undefined,
                specialtyName: form.specialtyName.trim() || undefined,
                course: form.course ? Number(form.course) : undefined,
                studyYear: form.studyYear ? Number(form.studyYear) : undefined,
                inviteRole: form.inviteRole,
                editRole: form.editRole,
                manageSubjectsRole: form.manageSubjectsRole,
                manageScheduleRole: form.manageScheduleRole,
                manageDeadlinesRole: form.manageDeadlinesRole,
                manageFilesRole: form.manageFilesRole,
                postAnnouncementsRole: form.postAnnouncementsRole,
                createPollsRole: form.createPollsRole,
            },
        });
    }

    return (
        <div className="rounded-[28px] border border-border/70 bg-card shadow-sm">
            <SectionHeader eyebrow="Settings" title="Налаштування групи" />

            <form className="space-y-6 p-4 md:p-6" onSubmit={handleSubmit}>
                <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                    <Card className="border-border/70">
                        <CardContent className="space-y-4 p-5">
                            <div className="text-sm font-semibold text-foreground">
                                General
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Назва">
                                    <Input
                                        disabled={!canEdit}
                                        value={form.name}
                                        onChange={(event) =>
                                            setForm((current) => ({
                                                ...current,
                                                name: event.target.value,
                                            }))
                                        }
                                        className="h-10 rounded-xl"
                                    />
                                </Field>

                                <Field label="Код">
                                    <Input
                                        disabled={!canEdit}
                                        value={form.code}
                                        onChange={(event) =>
                                            setForm((current) => ({
                                                ...current,
                                                code: event.target.value,
                                            }))
                                        }
                                        className="h-10 rounded-xl uppercase"
                                    />
                                </Field>
                            </div>

                            <Field label="Опис">
                                <textarea
                                    disabled={!canEdit}
                                    value={form.description}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            description: event.target.value,
                                        }))
                                    }
                                    className={groupTextAreaClassName}
                                />
                            </Field>

                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Видимість">
                                    <GroupSelect
                                        value={form.visibility}
                                        onChange={(value) =>
                                            setForm((current) => ({
                                                ...current,
                                                visibility:
                                                    value as typeof current.visibility,
                                            }))
                                        }
                                        options={VISIBILITY_OPTIONS}
                                        disabled={!canEdit}
                                    />
                                </Field>

                                <Field label="Політика вступу">
                                    <GroupSelect
                                        value={form.joinPolicy}
                                        onChange={(value) =>
                                            setForm((current) => ({
                                                ...current,
                                                joinPolicy:
                                                    value as typeof current.joinPolicy,
                                            }))
                                        }
                                        options={JOIN_POLICY_OPTIONS}
                                        disabled={!canEdit}
                                    />
                                </Field>
                            </div>

                            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                                <div className="mb-4 text-sm font-semibold text-foreground">
                                    University
                                </div>
                                <GroupUniversityFields
                                    disabled={!canEdit}
                                    value={{
                                        institutionName: form.institutionName,
                                        institutionShortName: form.institutionShortName,
                                        facultyName: form.facultyName,
                                        specialtyName: form.specialtyName,
                                        course: form.course,
                                        studyYear: form.studyYear,
                                    }}
                                    onChange={(patch) =>
                                        setForm((current) => ({ ...current, ...patch }))
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <Card className="border-border/70">
                            <CardContent className="space-y-4 p-5">
                                <div className="text-sm font-semibold text-foreground">
                                    Access
                                </div>

                                <p className="text-sm text-muted-foreground">
                                    Права в групі зібрані тільки тут, без дублювання на інших підсторінках.
                                </p>

                                <Field label="Хто може запрошувати">
                                    <GroupSelect
                                        value={form.inviteRole}
                                        onChange={(value) =>
                                            setForm((current) => ({
                                                ...current,
                                                inviteRole: value as GroupRole,
                                            }))
                                        }
                                        options={ROLE_OPTIONS}
                                        disabled={!canEdit}
                                    />
                                </Field>

                                <Field label="Хто може редагувати групу">
                                    <GroupSelect
                                        value={form.editRole}
                                        onChange={(value) =>
                                            setForm((current) => ({
                                                ...current,
                                                editRole: value as GroupRole,
                                            }))
                                        }
                                        options={ROLE_OPTIONS}
                                        disabled={!canEdit}
                                    />
                                </Field>

                                <Field label="Керування предметами">
                                    <GroupSelect
                                        value={form.manageSubjectsRole}
                                        onChange={(value) =>
                                            setForm((current) => ({
                                                ...current,
                                                manageSubjectsRole: value as GroupRole,
                                            }))
                                        }
                                        options={ROLE_OPTIONS}
                                        disabled={!canEdit}
                                    />
                                </Field>

                                <Field label="Керування розкладом">
                                    <GroupSelect
                                        value={form.manageScheduleRole}
                                        onChange={(value) =>
                                            setForm((current) => ({
                                                ...current,
                                                manageScheduleRole: value as GroupRole,
                                            }))
                                        }
                                        options={ROLE_OPTIONS}
                                        disabled={!canEdit}
                                    />
                                </Field>

                                <Field label="Керування дедлайнами">
                                    <GroupSelect
                                        value={form.manageDeadlinesRole}
                                        onChange={(value) =>
                                            setForm((current) => ({
                                                ...current,
                                                manageDeadlinesRole: value as GroupRole,
                                            }))
                                        }
                                        options={ROLE_OPTIONS}
                                        disabled={!canEdit}
                                    />
                                </Field>

                                <Field label="Керування файлами">
                                    <GroupSelect
                                        value={form.manageFilesRole}
                                        onChange={(value) =>
                                            setForm((current) => ({
                                                ...current,
                                                manageFilesRole: value as GroupRole,
                                            }))
                                        }
                                        options={ROLE_OPTIONS}
                                        disabled={!canEdit}
                                    />
                                </Field>

                                <Field label="Публікація оголошень">
                                    <GroupSelect
                                        value={form.postAnnouncementsRole}
                                        onChange={(value) =>
                                            setForm((current) => ({
                                                ...current,
                                                postAnnouncementsRole:
                                                    value as GroupRole,
                                            }))
                                        }
                                        options={ROLE_OPTIONS}
                                        disabled={!canEdit}
                                    />
                                </Field>

                                <Field label="Створення опитувань">
                                    <GroupSelect
                                        value={form.createPollsRole}
                                        onChange={(value) =>
                                            setForm((current) => ({
                                                ...current,
                                                createPollsRole: value as GroupRole,
                                            }))
                                        }
                                        options={ROLE_OPTIONS}
                                        disabled={!canEdit}
                                    />
                                </Field>
                            </CardContent>
                        </Card>

                        <Card className="border-border/70">
                            <CardContent className="space-y-4 p-5">
                                <div className="text-sm font-semibold text-foreground">
                                    Appearance
                                </div>

                                <Field label="Колір групи">
                                    <GroupColorPicker
                                        value={form.color}
                                        onChange={(value) =>
                                            setForm((current) => ({
                                                ...current,
                                                color: value,
                                            }))
                                        }
                                        disabled={!canEdit}
                                    />
                                </Field>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button type="submit" disabled={!canEdit || updateGroup.isPending}>
                        Зберегти налаштування
                    </Button>
                </div>
            </form>
        </div>
    );
}
