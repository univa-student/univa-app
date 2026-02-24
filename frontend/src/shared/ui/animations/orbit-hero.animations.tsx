import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
    BotIcon,
    BrainIcon,
    CalendarDaysIcon,
    ClockIcon,
    FileTextIcon,
    FolderOpenIcon,
    ListChecksIcon,
    MessagesSquareIcon,
} from "lucide-react";
import logoConfig from "@/app/config/logo.config";

/* ─────────────── Types ─────────────── */

interface IconDef {
    Icon: LucideIcon;
    label: string;
    color: string;
    bg: string;
    border: string;
    orbitIdx: 0 | 1 | 2;
    startAngle: number; // radians
    boxSize: number;    // px at size=420
}

/* ─────────────── Orbit definitions ─────────────── */

// Three atom-like planes: same tilt, rotated 60° apart around Z
const ORBIT_TILT   = 68;  // degrees — how much each ellipse is tipped toward viewer
const ORBIT_SPEEDS = [38, 50, 62]; // seconds per revolution
const ORBIT_COLORS = [
    "rgba(59,130,246,0.22)",
    "rgba(124,58,237,0.20)",
    "rgba(219,39,119,0.20)",
];
const ORBIT_Z_ANGLES = [0, 120, -120]; // degrees, rotation around Z

/* ─────────────── Icon definitions ─────────────── */

const ICONS: IconDef[] = [
    { Icon: CalendarDaysIcon,   label: "Розклад",    color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe", orbitIdx: 0, startAngle: 0,                    boxSize: 44 },
    { Icon: ListChecksIcon,     label: "Органайзер", color: "#e11d48", bg: "#fff1f2", border: "#fecdd3", orbitIdx: 0, startAngle: Math.PI,              boxSize: 42 },
    { Icon: ClockIcon,          label: "Дедлайни",   color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc", orbitIdx: 0, startAngle: Math.PI * 0.5,        boxSize: 40 },
    { Icon: BotIcon,            label: "AI",          color: "#7c3aed", bg: "#f5f3ff", border: "#c4b5fd", orbitIdx: 1, startAngle: Math.PI / 3,          boxSize: 48 },
    { Icon: FolderOpenIcon,     label: "Файли",      color: "#d97706", bg: "#fffbeb", border: "#fde68a", orbitIdx: 1, startAngle: Math.PI / 3 + Math.PI, boxSize: 40 },
    { Icon: FileTextIcon,       label: "Конспекти",  color: "#ea580c", bg: "#fff7ed", border: "#fed7aa", orbitIdx: 1, startAngle: Math.PI * 1.5,         boxSize: 42 },
    { Icon: MessagesSquareIcon, label: "Чати",        color: "#059669", bg: "#ecfdf5", border: "#a7f3d0", orbitIdx: 2, startAngle: -Math.PI / 4,         boxSize: 42 },
    { Icon: BrainIcon,          label: "Навчання",   color: "#db2777", bg: "#fdf2f8", border: "#fbcfe8", orbitIdx: 2, startAngle: -Math.PI / 4 + Math.PI, boxSize: 44 },
];

/* ─────────────── 3-D projection ─────────────── */

/**
 * Given an angle on a tilted ellipse, returns the 2-D screen-space offset
 * from the centre, plus a Z value for depth sorting.
 *
 * rx / ry are the ellipse semi-axes in pixels.
 * tiltXDeg: rotation around X (tips the ellipse away from viewer).
 * rotateZDeg: rotation around Z (spins the plane).
 */
function project(
    angle: number,
    rx: number,
    ry: number,
    tiltXDeg: number,
    rotateZDeg: number,
): { x: number; y: number; z: number } {
    const px = Math.cos(angle) * rx;
    const py = Math.sin(angle) * ry;

    // Rotate around X
    const tx  = tiltXDeg * (Math.PI / 90);
    const r1y = py * Math.cos(tx);
    const r1z = py * Math.sin(tx);

    // Rotate around Z
    const tz  = rotateZDeg * (Math.PI / 180);
    const r2x = px * Math.cos(tz) - r1y * Math.sin(tz);
    const r2y = px * Math.sin(tz) + r1y * Math.cos(tz);

    return { x: r2x, y: r2y, z: r1z };
}

/* ─────────────── Component ─────────────── */

interface OrbitHeroProps {
    size?: number;   // max width; actual size auto-measured
    className?: string;
}

export function OrbitHero({ size: maxSize = 720, className }: OrbitHeroProps) {
    const wrapRef       = useRef<HTMLDivElement>(null);
    const canvasRef     = useRef<HTMLCanvasElement>(null);
    const iconsRef      = useRef<HTMLDivElement>(null);
    const rafRef        = useRef<number>(0);
    const anglesRef     = useRef<number[]>(ICONS.map(d => d.startAngle));
    const expandedRef   = useRef(false);
    const sizeRef       = useRef(maxSize);          // live actual size

    const [size, setSize]       = useState(maxSize);
    const [expanded, setExpanded] = useState(false);

    // Keep refs in sync
    useEffect(() => { expandedRef.current = expanded; }, [expanded]);
    useEffect(() => { sizeRef.current = size; }, [size]);

    /* ── Measure actual rendered size ── */
    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;

        const measure = () => {
            const w = el.getBoundingClientRect().width;
            if (w > 0) setSize(Math.round(w));
        };

        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    /* ── Single RAF loop: draw canvas + move icons ── */
    useEffect(() => {
        const cvs = canvasRef.current;
        const layer = iconsRef.current;
        if (!cvs || !layer) return;

        // Collect icon wrapper elements in order
        const iconEls = ICONS.map((_, i) =>
            layer.querySelector<HTMLElement>(`[data-i="${i}"]`)
        );

        let last = performance.now();

        const loop = (now: number) => {
            const dt  = Math.min((now - last) / 1000, 0.05);
            last      = now;

            const s   = sizeRef.current;
            const exp = expandedRef.current;
            const half = s / 2;
            const ctx = cvs.getContext("2d")!;

            // Resize canvas if needed (handles zoom / ResizeObserver updates)
            const dpr = window.devicePixelRatio || 1;
            if (cvs.width !== Math.round(s * dpr) || cvs.height !== Math.round(s * dpr)) {
                cvs.width  = Math.round(s * dpr);
                cvs.height = Math.round(s * dpr);
                cvs.style.width  = `${s}px`;
                cvs.style.height = `${s}px`;
                ctx.scale(dpr, dpr);
            }

            // ── Draw orbits ──
            ctx.clearRect(0, 0, s, s);

            const rx = half * (exp ? 0.84 : 0.72);
            const ry = half * (exp ? 0.30 : 0.22);

            for (let oi = 0; oi < 3; oi++) {
                ctx.beginPath();
                for (let i = 0; i <= 200; i++) {
                    const a  = (i / 200) * Math.PI * 2;
                    const pt = project(a, rx, ry, ORBIT_TILT, ORBIT_Z_ANGLES[oi]);
                    const sx = half + pt.x;
                    const sy = half + pt.y;
                    i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
                }
                ctx.closePath();
                ctx.strokeStyle = ORBIT_COLORS[oi];
                ctx.lineWidth   = 1;
                ctx.setLineDash([5, 8]);
                ctx.stroke();
                ctx.setLineDash([]);
            }

            // ── Move icons ──
            const scale = s / 420;

            ICONS.forEach((ic, i) => {
                anglesRef.current[i] += (2 * Math.PI) / ORBIT_SPEEDS[ic.orbitIdx] * dt;

                const pt       = project(anglesRef.current[i], rx, ry, ORBIT_TILT, ORBIT_Z_ANGLES[ic.orbitIdx]);
                const el       = iconEls[i];
                if (!el) return;

                // Depth factor 0..1 (z ranges roughly -ry..+ry after tilt)
                const depth    = Math.max(0, Math.min(1, (pt.z + ry) / (ry * 2)));
                const sc       = (0.80 + depth * 0.28) * scale;

                el.style.transform  = `translate(${half + pt.x - (ic.boxSize * scale) / 2}px, ${half + pt.y - (ic.boxSize * scale) / 2}px)`;
                el.style.opacity    = String(0.45 + depth * 0.55);
                el.style.zIndex     = String(Math.round(depth * 10));
                // Use width/height directly for scale to avoid CSS scale quirks
                el.style.width      = `${ic.boxSize * sc}px`;
                el.style.height     = `${ic.boxSize * sc}px`;
            });

            rafRef.current = requestAnimationFrame(loop);
        };

        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rafRef.current);
    }, []); // runs once — reads everything via refs

    const centerSize = Math.max(48, Math.min(92, Math.round(size * 0.19)));

    return (
        <div
            ref={wrapRef}
            className={["hidden lg:block relative select-none overflow-hidden flex-shrink-0", className]
                .filter(Boolean).join(" ")}
            style={{ width: `min(100%, ${maxSize}px)`, aspectRatio: "1 / 1" }}
        >
            <style>{`
                @keyframes orbitPulse {
                    0%   { transform: translate(-50%,-50%) scale(1);    opacity: 0.35; }
                    100% { transform: translate(-50%,-50%) scale(2.0);  opacity: 0; }
                }
                @keyframes breatheGlow {
                    0%,100% { box-shadow: 0 4px 28px rgba(124,58,237,0.16), 0 1px 6px rgba(0,0,0,0.07); }
                    50%     { box-shadow: 0 8px 44px rgba(124,58,237,0.28), 0 3px 12px rgba(0,0,0,0.09); }
                }
            `}</style>

            {/* Orbit canvas — sized by JS */}
            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 pointer-events-none"
            />

            {/* Pulse rings */}
            {[0, 1.6].map((delay, i) => (
                <div key={i} className="absolute pointer-events-none rounded-full" style={{
                    width: centerSize * 2.2, height: centerSize * 2.2,
                    left: "50%", top: "50%",
                    border: "1.5px solid rgba(124,58,237,0.18)",
                    animation: `orbitPulse 3.4s ease-out ${delay}s infinite`,
                }} />
            ))}

            {/* Icons — positioned by JS via transform */}
            <div ref={iconsRef} className="absolute inset-0 pointer-events-none">
                {ICONS.map((ic, i) => (
                    <div
                        key={ic.label}
                        data-i={i}
                        className="absolute top-0 left-0 pointer-events-auto"
                        style={{ willChange: "transform, opacity, width, height" }}
                    >
                        <motion.div
                            className="flex items-center justify-center rounded-xl w-full h-full relative group"
                            whileHover={{ scale: 1.18 }}
                            transition={{ type: "spring", stiffness: 300, damping: 22 }}
                            style={{
                                background: ic.bg,
                                border: `1px solid ${ic.border}`,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            }}
                        >
                            <ic.Icon
                                className="w-[42%] h-[42%]"
                                style={{ color: ic.color }}
                            />
                            {/* Tooltip */}
                            <div
                                className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2
                                           whitespace-nowrap opacity-0 group-hover:opacity-100
                                           transition-opacity duration-150 z-50"
                                style={{
                                    background:   "var(--u-card, #fff)",
                                    border:       "1px solid var(--u-border, #e5e7eb)",
                                    borderRadius: 6, padding: "2px 8px",
                                    fontSize: 10, fontWeight: 600, color: ic.color,
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                }}
                            >
                                {ic.label}
                            </div>
                        </motion.div>
                    </div>
                ))}
            </div>

            {/* Center logo */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.5, type: "spring", bounce: 0.3 }}
                onClick={() => setExpanded(v => !v)}
                className="absolute z-20 flex items-center justify-center cursor-pointer"
                style={{
                    width:  centerSize,
                    height: centerSize,
                    left:   "50%",
                    top:    "50%",
                    marginLeft: -centerSize / 2,
                    marginTop:  -centerSize / 2,
                    borderRadius: Math.round(centerSize * 0.24),
                    background: "var(--u-card, #fff)",
                    border: "1px solid var(--u-border, #e5e7eb)",
                    animation: "breatheGlow 4s ease-in-out infinite",
                }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
            >
                <picture>
                    <source srcSet={logoConfig["logo-black-no-bg"]} media="(prefers-color-scheme: dark)" />
                    <img
                        src={logoConfig["logo-white-no-bg"]}
                        alt="Univa"
                        style={{ height: Math.round(centerSize * 0.48) }}
                        draggable={false}
                    />
                </picture>

                {/* Expand indicator ring */}
                <motion.div
                    className="absolute inset-0 rounded-[inherit] pointer-events-none"
                    animate={{
                        boxShadow: expanded
                            ? "0 0 0 3px rgba(124,58,237,0.48)"
                            : "0 0 0 0px rgba(124,58,237,0)",
                    }}
                    transition={{ duration: 0.22 }}
                />
            </motion.div>
        </div>
    );
}
