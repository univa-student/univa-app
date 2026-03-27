import { useEffect, useMemo, useRef, useState } from "react";
import {
    BookOpenIcon,
    CheckIcon,
    Loader2Icon,
    MapPinIcon,
    SearchIcon,
    XIcon,
} from "lucide-react";

import {
    useProfileInformation,
    useStudentProfile,
    useUniversitiesByRegion,
    useUniversityDetails,
} from "@/modules/profiles/api/hooks";
import { cn } from "@/shared/shadcn/lib/utils";
import { Input } from "@/shared/shadcn/ui/input";

import { GroupSelect } from "./group-select";
import { Field } from "./ui";
import type { GroupUniversityFormValue } from "./view";

interface GroupUniversityFieldsProps {
    value: GroupUniversityFormValue;
    onChange: (patch: Partial<GroupUniversityFormValue>) => void;
    disabled?: boolean;
}

function isEmpty(value: GroupUniversityFormValue) {
    return !(
        value.institutionName ||
        value.institutionShortName ||
        value.facultyName ||
        value.specialtyName ||
        value.course ||
        value.studyYear
    );
}

export function GroupUniversityFields({
                                          value,
                                          onChange,
                                          disabled,
                                      }: GroupUniversityFieldsProps) {
    const { data: profile } = useStudentProfile();
    const { data: profileInformation } = useProfileInformation();

    const [regionCode, setRegionCode] = useState("");
    const [universityId, setUniversityId] = useState("");
    const [universityQuery, setUniversityQuery] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const { data: universities = [], isFetching: isUniversitiesLoading } =
        useUniversitiesByRegion(regionCode || null);

    const { data: universityDetails, isFetching: isUniversityDetailsLoading } =
        useUniversityDetails(universityId || null);

    useEffect(() => {
        if (!profile?.university) return;
        if (!isEmpty(value)) return;

        const university = profile.university;

        onChange({
            institutionName: university.name ?? "",
            institutionShortName: university.shortName ?? "",
            facultyName: university.facultyName ?? "",
            course: university.course?.toString() ?? "",
        });

        setRegionCode(university.regionCode ?? "");
        setUniversityId(university.externalId ?? "");
        setUniversityQuery(university.name ?? "");
    }, [onChange, profile, value]);

    // Close dropdown on outside click
    useEffect(() => {
        function handleOutside(e: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (dropdownOpen) {
            setTimeout(() => searchRef.current?.focus(), 0);
        }
    }, [dropdownOpen]);

    const regionOptions = useMemo(
        () =>
            (profileInformation?.regions ?? []).map((region) => ({
                value: region.value.toString(),
                label: region.label,
            })),
        [profileInformation?.regions],
    );

    const courseOptions = useMemo(
        () =>
            (profileInformation?.courses ?? []).map((course) => ({
                value: course.value.toString(),
                label: course.label,
            })),
        [profileInformation?.courses],
    );

    const filteredUniversities = useMemo(() => {
        const query = universityQuery.trim().toLowerCase();
        if (!query) return universities;
        return universities.filter((item) =>
            `${item.name} ${item.shortName ?? ""} ${item.region ?? ""}`
                .toLowerCase()
                .includes(query),
        );
    }, [universities, universityQuery]);

    const selectedUniversity = useMemo(
        () => universities.find((item) => item.id === universityId) ?? null,
        [universities, universityId],
    );

    const specialitySuggestions = useMemo(
        () =>
            Array.from(
                new Set(
                    [
                        ...(universityDetails?.faculties ?? []).map((item) => item.name),
                        ...(universityDetails?.specialities ?? []).map((item) =>
                            item.degree
                                ? `${item.code} ${item.name} (${item.degree})`
                                : `${item.code} ${item.name}`,
                        ),
                    ].filter(Boolean),
                ),
            ),
        [universityDetails],
    );

    function handleRegionChange(nextRegionCode: string) {
        setRegionCode(nextRegionCode);
        setUniversityId("");
        setUniversityQuery("");
        setDropdownOpen(false);

        onChange({
            institutionName: "",
            institutionShortName: "",
            facultyName: "",
            specialtyName: "",
        });
    }

    function handleUniversitySelect(nextUniversityId: string) {
        setUniversityId(nextUniversityId);
        setDropdownOpen(false);

        const selected = universities.find((item) => item.id === nextUniversityId);
        if (!selected) return;

        setUniversityQuery("");

        onChange({
            institutionName: selected.name,
            institutionShortName: selected.shortName ?? "",
            facultyName: "",
            specialtyName: "",
        });
    }

    function handleClearUniversity() {
        setUniversityId("");
        setUniversityQuery("");
        onChange({
            institutionName: "",
            institutionShortName: "",
            facultyName: "",
            specialtyName: "",
        });
    }

    const hasRegion = Boolean(regionCode);
    const hasUniversity = Boolean(universityId);

    return (
        <div className="space-y-3">
            {/* Region + Course row */}
            <div className="grid grid-cols-2 gap-3">
                <Field label="Регіон">
                    <GroupSelect
                        value={regionCode}
                        onChange={handleRegionChange}
                        options={regionOptions}
                        placeholder="Оберіть регіон"
                        disabled={disabled}
                    />
                </Field>

                <Field label="Курс">
                    <GroupSelect
                        value={value.course}
                        onChange={(nextValue) => onChange({ course: nextValue })}
                        options={courseOptions}
                        placeholder="Курс"
                        disabled={disabled || !hasRegion}
                    />
                </Field>
            </div>

            {/* University picker */}
            <Field label="Університет">
                <div className="relative" ref={dropdownRef}>
                    {/* Trigger */}
                    <button
                        type="button"
                        disabled={disabled || !hasRegion}
                        onClick={() => setDropdownOpen((prev) => !prev)}
                        className={cn(
                            "flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-input bg-background px-3 text-sm transition-colors",
                            "hover:border-ring/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            "disabled:cursor-not-allowed disabled:opacity-50",
                            dropdownOpen && "border-ring ring-2 ring-ring/20",
                        )}
                    >
                        <span
                            className={cn(
                                "flex-1 truncate text-left",
                                !selectedUniversity && "text-muted-foreground",
                            )}
                        >
                            {selectedUniversity?.name ||
                                value.institutionName ||
                                (hasRegion
                                    ? "Оберіть університет"
                                    : "Спочатку оберіть регіон")}
                        </span>

                        <div className="flex shrink-0 items-center gap-1">
                            {hasUniversity && !disabled && (
                                <span
                                    role="button"
                                    tabIndex={0}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleClearUniversity();
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.stopPropagation();
                                            handleClearUniversity();
                                        }
                                    }}
                                    className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                                >
                                    <XIcon className="size-3.5" />
                                </span>
                            )}
                            <SearchIcon className="size-3.5 text-muted-foreground" />
                        </div>
                    </button>

                    {/* Inline dropdown */}
                    {dropdownOpen && (
                        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 overflow-hidden rounded-xl border border-border bg-background shadow-md">
                            {/* Search */}
                            <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2">
                                <SearchIcon className="size-3.5 shrink-0 text-muted-foreground" />
                                <input
                                    ref={searchRef}
                                    value={universityQuery}
                                    onChange={(e) => setUniversityQuery(e.target.value)}
                                    placeholder="Пошук університету..."
                                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                                />
                            </div>

                            {/* List */}
                            <div className="max-h-64 overflow-y-auto">
                                {isUniversitiesLoading ? (
                                    <div className="flex items-center gap-2 px-3 py-4 text-sm text-muted-foreground">
                                        <Loader2Icon className="size-4 animate-spin" />
                                        Завантаження списку…
                                    </div>
                                ) : filteredUniversities.length === 0 ? (
                                    <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                                        Університети не знайдені
                                    </div>
                                ) : (
                                    filteredUniversities.slice(0, 20).map((item) => {
                                        const isSelected = item.id === universityId;
                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => handleUniversitySelect(item.id)}
                                                className={cn(
                                                    "flex w-full items-start gap-3 border-b border-border/40 px-3 py-2.5 text-left transition-colors last:border-b-0",
                                                    isSelected
                                                        ? "bg-primary/5"
                                                        : "hover:bg-muted/50",
                                                )}
                                            >
                                                <CheckIcon
                                                    className={cn(
                                                        "mt-0.5 size-3.5 shrink-0 text-primary",
                                                        isSelected ? "opacity-100" : "opacity-0",
                                                    )}
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <div className="truncate text-sm font-medium text-foreground">
                                                        {item.name}
                                                    </div>
                                                    {item.shortName && (
                                                        <div className="mt-0.5 text-xs text-muted-foreground">
                                                            {item.shortName}
                                                        </div>
                                                    )}
                                                    {item.region && (
                                                        <div className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                            <MapPinIcon className="size-3" />
                                                            {item.region}
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>

                            {/* Footer count */}
                            {!isUniversitiesLoading && filteredUniversities.length > 0 && (
                                <div className="border-t border-border/40 px-3 py-1.5 text-xs text-muted-foreground">
                                    {filteredUniversities.length > 20
                                        ? `Показано 20 з ${filteredUniversities.length} — уточніть пошук`
                                        : `${filteredUniversities.length} університетів`}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Field>

            {/* University preview card */}
            {(universityDetails || isUniversityDetailsLoading) && (
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                    {isUniversityDetailsLoading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2Icon className="size-4 animate-spin" />
                            Завантаження деталей…
                        </div>
                    ) : universityDetails ? (
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="rounded-lg bg-primary/10 p-1.5 text-primary">
                                    <BookOpenIcon className="size-4" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-medium text-foreground">
                                        {universityDetails.name}
                                    </div>
                                    {universityDetails.shortName && (
                                        <div className="text-xs text-muted-foreground">
                                            {universityDetails.shortName}
                                        </div>
                                    )}
                                    {universityDetails.location && (
                                        <div className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                                            <MapPinIcon className="size-3" />
                                            {universityDetails.location}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { label: "Тип", value: universityDetails.typeName ?? "—" },
                                    { label: "Факультети", value: universityDetails.faculties.length },
                                    { label: "Спеціальності", value: universityDetails.specialities.length },
                                ].map((stat) => (
                                    <div
                                        key={stat.label}
                                        className="rounded-lg border border-border/60 bg-background px-2.5 py-2 text-center"
                                    >
                                        <div className="text-xs text-muted-foreground">{stat.label}</div>
                                        <div className="mt-0.5 text-sm font-medium text-foreground">
                                            {stat.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>
            )}

            {/* Short name + Study year */}
            <div className="grid grid-cols-2 gap-3">
                <Field label="Скорочена назва">
                    <Input
                        value={value.institutionShortName}
                        onChange={(e) => onChange({ institutionShortName: e.target.value })}
                        disabled={disabled}
                        className="h-10 rounded-xl"
                        placeholder="КПІ"
                    />
                </Field>

                <Field label="Рік вступу">
                    <Input
                        type="number"
                        min={2000}
                        max={2100}
                        value={value.studyYear}
                        onChange={(e) => onChange({ studyYear: e.target.value })}
                        disabled={disabled}
                        className="h-10 rounded-xl"
                        placeholder="2024"
                    />
                </Field>
            </div>

            {/* Full name */}
            <Field label="Повна назва">
                <Input
                    value={value.institutionName}
                    onChange={(e) => onChange({ institutionName: e.target.value })}
                    disabled={disabled}
                    className="h-10 rounded-xl"
                    placeholder="Повна назва університету"
                />
            </Field>

            {/* Faculty */}
            <Field label="Факультет">
                <Input
                    value={value.facultyName}
                    onChange={(e) => onChange({ facultyName: e.target.value })}
                    disabled={disabled}
                    className="h-10 rounded-xl"
                    placeholder="Факультет інформатики"
                />
            </Field>

            {/* Specialty */}
            <Field label="Спеціальність">
                <Input
                    value={value.specialtyName}
                    onChange={(e) => onChange({ specialtyName: e.target.value })}
                    disabled={disabled || !universityId}
                    list="group-speciality-suggestions"
                    className="h-10 rounded-xl"
                    placeholder="122 Комп'ютерні науки"
                />
                <datalist id="group-speciality-suggestions">
                    {specialitySuggestions.map((item) => (
                        <option key={item} value={item} />
                    ))}
                </datalist>
            </Field>
        </div>
    );
}