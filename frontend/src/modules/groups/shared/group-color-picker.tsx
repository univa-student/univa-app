import { Input } from "@/shared/shadcn/ui/input";

const PRESET_COLORS = [
    "#2563eb",
    "#0f766e",
    "#f97316",
    "#dc2626",
    "#7c3aed",
    "#db2777",
    "#16a34a",
    "#0891b2",
];

interface GroupColorPickerProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export function GroupColorPicker({
    value,
    onChange,
    disabled,
}: GroupColorPickerProps) {
    return (
        <div className="space-y-3 rounded-2xl border border-border/70 bg-muted/20 p-3">
            <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                    <button
                        key={color}
                        type="button"
                        disabled={disabled}
                        className="size-8 rounded-full border-2 transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
                        style={{
                            backgroundColor: color,
                            borderColor: value === color ? "hsl(var(--foreground))" : "transparent",
                        }}
                        onClick={() => onChange(color)}
                    />
                ))}
            </div>
            <div className="flex items-center gap-3">
                <div
                    className="size-10 rounded-xl border border-border/70"
                    style={{ backgroundColor: value }}
                />
                <Input
                    disabled={disabled}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder="#2563eb"
                    className="h-10 rounded-xl"
                />
            </div>
        </div>
    );
}
