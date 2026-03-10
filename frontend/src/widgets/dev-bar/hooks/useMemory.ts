import { useState, useEffect } from "react";
import type { MemoryInfo } from "../types";

export function useMemory(): MemoryInfo | null {
    const [mem, setMem] = useState<MemoryInfo | null>(null);

    useEffect(() => {
        const update = () => {
            const p = performance as any;
            if (p?.memory) {
                const used = Math.round(p.memory.usedJSHeapSize / 1048576);
                const total = Math.round(p.memory.jsHeapSizeLimit / 1048576);
                setMem({ used, total, pct: Math.round((used / total) * 100) });
            }
        };

        update();
        const id = setInterval(update, 2000);
        return () => clearInterval(id);
    }, []);

    return mem;
}