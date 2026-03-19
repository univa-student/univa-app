import { minToTop } from "@/widgets/schedule-calendar/schedule.utils";

interface Props {
    now: Date;
    slotStart: number;
    slotEnd: number;
}

export function NowLine({ now, slotStart, slotEnd }: Props) {
    const min = now.getHours() * 60 + now.getMinutes();
    if (min < slotStart || min > slotEnd) return null;
    return (
        <div
            className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
            style={{ top: minToTop(min, slotStart) }}
        >
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1 shrink-0 shadow-md shadow-red-500/50" />
            <div className="flex-1 h-[1.5px] bg-red-500/70" />
        </div>
    );
}
