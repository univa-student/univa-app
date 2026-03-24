import { GRID_TOP_PADDING, PX_PER_MIN } from "@/modules/schedule/ui/schedule-calendar/schedule.utils";

interface Props {
    hours: number[];
    gridHeight: number;
}

export function TimeColumn({ hours, gridHeight }: Props) {
    return (
        <div className="w-12 shrink-0 relative select-none" style={{ height: gridHeight }}>
            {hours.map((h, i) => (
                <div
                    key={h}
                    className="absolute right-2 text-[10px] font-medium tabular-nums text-muted-foreground/40"
                    style={{ top: GRID_TOP_PADDING + i * 60 * PX_PER_MIN - 7 }}
                >
                    {String(h).padStart(2, "0")}:00
                </div>
            ))}
        </div>
    );
}