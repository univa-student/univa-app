import { SearchIcon, XIcon, ChevronDownIcon } from "lucide-react";
import { Input } from "@/shared/shadcn/ui/input";
import { Button } from "@/shared/shadcn/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/shared/shadcn/ui/dropdown-menu";
import { typeConfig } from "@/shared/ui/deadlines/deadline-type-icon";
import { priorityConfig } from "@/shared/ui/deadlines/deadline-priority-badge";

function FilterMultiSelect({ title, value, options, onChange }: {
    title: string, value?: string, options: { value: string, label: string }[], onChange: (val: string | undefined) => void
}) {
    const selectedValues = value ? value.split(',') : [];

    const toggleOption = (optValue: string) => {
        let newVals = [...selectedValues];
        if (newVals.includes(optValue)) {
            newVals = newVals.filter(v => v !== optValue);
        } else {
            newVals.push(optValue);
        }
        onChange(newVals.length > 0 ? newVals.join(',') : undefined);
    };

    const label = selectedValues.length > 0
        ? `${title} (${selectedValues.length})`
        : title;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-9 font-normal justify-between w-full sm:w-auto sm:min-w-[130px] bg-background">
                    {label}
                    <ChevronDownIcon className="size-4 ml-2 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
                {options.map(opt => (
                    <DropdownMenuCheckboxItem
                        key={opt.value}
                        checked={selectedValues.includes(opt.value)}
                        onCheckedChange={() => toggleOption(opt.value)}
                    >
                        {opt.label}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export interface DeadlineFiltersState {
    search: string;
    subjectId?: string;
    status?: string;
    priority?: string;
    type?: string;
    sortBy?: string;
    sortDir?: "asc" | "desc";
}

interface Props {
    filters: DeadlineFiltersState;
    onChange: (f: DeadlineFiltersState) => void;
    subjects: { id: number; name: string }[];
}

export function DeadlinesFilters({ filters, onChange, subjects }: Props) {
    const updateFilter = (key: keyof DeadlineFiltersState, value: string | undefined) => {
        onChange({ ...filters, [key]: value });
    };

    const hasFilters = filters.subjectId || filters.status || filters.priority || filters.type || filters.sortBy;

    return (
        <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full max-w-sm">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Пошук завдань..."
                    className="pl-9 bg-background"
                    value={filters.search}
                    onChange={(e) => updateFilter("search", e.target.value)}
                />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto hidescrollbar">
                <FilterMultiSelect
                    title="Предмети"
                    value={filters.subjectId}
                    onChange={(v) => updateFilter("subjectId", v)}
                    options={subjects.map(s => ({ value: String(s.id), label: s.name }))}
                />

                <FilterMultiSelect
                    title="Статуси"
                    value={filters.status}
                    onChange={(v) => updateFilter("status", v)}
                    options={[
                        { value: "new", label: "Нове" },
                        { value: "in_progress", label: "В процесі" },
                        { value: "completed", label: "Виконано" },
                        { value: "cancelled", label: "Відмінено" }
                    ]}
                />

                <FilterMultiSelect
                    title="Пріоритети"
                    value={filters.priority}
                    onChange={(v) => updateFilter("priority", v)}
                    options={Object.entries(priorityConfig).map(([k, c]) => ({ value: k, label: c.label }))}
                />

                <FilterMultiSelect
                    title="Типи"
                    value={filters.type}
                    onChange={(v) => updateFilter("type", v)}
                    options={Object.entries(typeConfig).map(([k, c]) => ({ value: k, label: c.label }))}
                />

                <div className="flex items-center gap-1 border border-input rounded-md bg-background px-1 shadow-sm h-9">
                    <select
                        value={filters.sortBy || "dueAt"}
                        onChange={(e) => updateFilter("sortBy", e.target.value)}
                        className="h-full bg-transparent text-sm focus:outline-none px-2 w-[110px]"
                    >
                        <option value="dueAt">За датою</option>
                        <option value="priority">За пріоритетом</option>
                        <option value="createdAt">За створенням</option>
                    </select>
                    <div className="w-[1px] h-4 bg-border"></div>
                    <select
                        value={filters.sortDir || "asc"}
                        onChange={(e) => updateFilter("sortDir", e.target.value as "asc" | "desc")}
                        className="h-full bg-transparent text-sm focus:outline-none px-2"
                    >
                        <option value="asc">↑</option>
                        <option value="desc">↓</option>
                    </select>
                </div>

                {hasFilters && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onChange({ search: filters.search })}
                        title="Скинути фільтри"
                    >
                        <XIcon className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
