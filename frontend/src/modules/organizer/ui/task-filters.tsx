import type { TaskFilters } from "../model/types";
import { taskCategoryOptions } from "../lib/category-registry";
import { Input } from "@/shared/shadcn/ui/input";
import { Label } from "@/shared/shadcn/ui/label";

const selectClassName = "flex h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

interface Props {
    filters: TaskFilters;
    onChange: (filters: TaskFilters) => void;
}

export function TaskFiltersBar({ filters, onChange }: Props) {
    function patch(next: Partial<TaskFilters>) {
        onChange({
            ...filters,
            ...next,
        });
    }

    return (
        <div className="grid gap-3 rounded-[28px] border border-border/70 bg-card p-4 shadow-sm lg:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]">
            <div className="space-y-2">
                <Label htmlFor="task-search">Пошук</Label>
                <Input
                    id="task-search"
                    value={filters.search ?? ""}
                    onChange={(event) => patch({ search: event.target.value })}
                    placeholder="Назва або контекст задачі"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="task-filter-category">Категорія</Label>
                <select
                    id="task-filter-category"
                    className={selectClassName}
                    value={filters.category ?? ""}
                    onChange={(event) => patch({ category: event.target.value as TaskFilters["category"] })}
                >
                    <option value="">Усі</option>
                    {taskCategoryOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="task-filter-priority">Пріоритет</Label>
                <select
                    id="task-filter-priority"
                    className={selectClassName}
                    value={filters.priority ?? ""}
                    onChange={(event) => patch({ priority: event.target.value as TaskFilters["priority"] })}
                >
                    <option value="">Усі</option>
                    <option value="low">Низький</option>
                    <option value="medium">Середній</option>
                    <option value="high">Високий</option>
                    <option value="critical">Критичний</option>
                </select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="task-filter-status">Статус</Label>
                <select
                    id="task-filter-status"
                    className={selectClassName}
                    value={filters.status ?? ""}
                    onChange={(event) => patch({ status: event.target.value as TaskFilters["status"] })}
                >
                    <option value="">Усі</option>
                    <option value="todo">To-do</option>
                    <option value="in_progress">В роботі</option>
                    <option value="done">Готово</option>
                    <option value="cancelled">Скасовано</option>
                </select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="task-filter-due">Дедлайн</Label>
                <select
                    id="task-filter-due"
                    className={selectClassName}
                    value={filters.dueState ?? ""}
                    onChange={(event) => patch({ dueState: event.target.value as TaskFilters["dueState"] })}
                >
                    <option value="">Усі</option>
                    <option value="today">Сьогодні</option>
                    <option value="upcoming">Попереду</option>
                    <option value="overdue">Прострочені</option>
                    <option value="none">Без дедлайну</option>
                </select>
            </div>
        </div>
    );
}
