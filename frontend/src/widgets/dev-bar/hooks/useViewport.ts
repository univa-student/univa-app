import { useState, useEffect } from "react";
import { MonitorIcon, TabletIcon, SmartphoneIcon } from "lucide-react";
import type { ViewportInfo } from "../types";

export function useViewport(): ViewportInfo {
    const [vw, setVw] = useState(window.innerWidth);
    const [vh, setVh] = useState(window.innerHeight);

    useEffect(() => {
        const handleResize = () => {
            setVw(window.innerWidth);
            setVh(window.innerHeight);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const bp = vw >= 1280
        ? { label: "XL", icon: MonitorIcon }
        : vw >= 1024
            ? { label: "LG", icon: MonitorIcon }
            : vw >= 768
                ? { label: "MD", icon: TabletIcon }
                : { label: "SM", icon: SmartphoneIcon };

    return { ...bp, vw, vh };
}