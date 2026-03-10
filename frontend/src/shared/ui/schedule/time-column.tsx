import { PX_PER_MIN } from "@/widgets/schedule-calendar/schedule.utils";

interface Props {
    hours: number[];
    gridHeight: number;
}

export function TimeColumn({ hours, gridHeight }: Props) {
    return (
        <div className="w-14 shrink-0 relative select-none" style={{ height: gridHeight }}>
            {hours.map((h, i) => (
                <div
                    key={h}
                    className="absolute right-3 text-[10px] font-semibold tabular-nums text-muted-foreground/60"
                    style={{ top: i * 60 * PX_PER_MIN - 7 }}
                >
                    {String(h).padStart(2, "0")}:00
                </div>
            ))}
        </div>
    );
}
