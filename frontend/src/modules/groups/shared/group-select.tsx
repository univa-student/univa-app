import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/shared/shadcn/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/shared/shadcn/ui/dropdown-menu";

export interface GroupSelectOption {
    value: string;
    label: string;
    description?: string;
}

interface GroupSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: GroupSelectOption[];
    placeholder?: string;
    label?: string;
    disabled?: boolean;
    className?: string;
}

export function GroupSelect({
    value,
    onChange,
    options,
    placeholder = "Оберіть значення",
    label,
    disabled,
    className,
}: GroupSelectProps) {
    const selected = options.find((option) => option.value === value) ?? null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={disabled}>
                <Button
                    type="button"
                    variant="outline"
                    className={className ?? "h-10 w-full justify-between rounded-xl px-3"}
                >
                    <span className="truncate text-left">
                        {selected?.label ?? placeholder}
                    </span>
                    <ChevronDownIcon className="size-4 text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72">
                {label ? <DropdownMenuLabel>{label}</DropdownMenuLabel> : null}
                <DropdownMenuRadioGroup onValueChange={onChange} value={value}>
                    {options.map((option) => (
                        <DropdownMenuRadioItem key={option.value} value={option.value}>
                            <div className="flex flex-col">
                                <span>{option.label}</span>
                                {option.description ? (
                                    <span className="text-xs text-muted-foreground">
                                        {option.description}
                                    </span>
                                ) : null}
                            </div>
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
