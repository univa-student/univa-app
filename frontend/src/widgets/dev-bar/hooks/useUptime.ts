import { useState, useEffect, useRef } from "react";

export function useUptime(): string {
    const start = useRef(Date.now());
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const id = setInterval(() => {
            setElapsed(Math.floor((Date.now() - start.current) / 1000));
        }, 1000);

        return () => clearInterval(id);
    }, []);

    const h = Math.floor(elapsed / 3600);
    const m = Math.floor((elapsed % 3600) / 60);
    const s = elapsed % 60;

    return `${h > 0 ? `${h}h ` : ""}${m > 0 ? `${m}m ` : ""}${s}s`;
}