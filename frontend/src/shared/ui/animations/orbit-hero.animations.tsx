import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
    BotIcon, BrainIcon, CalendarDaysIcon, ClockIcon,
    FileTextIcon, FolderOpenIcon, ListChecksIcon, MessagesSquareIcon,
} from "lucide-react";
import { themedLogo } from "@/app/config/logo.config";

/* ── Icon definitions with fixed positions (% of container) ── */
interface IconDef {
    Icon: LucideIcon;
    label: string;
    color: string;
    bg: string;
    border: string;
    size: number;
    px: number; // left position in %
    py: number; // top  position in %
    phase: number; // float animation delay offset
}

const ICONS: IconDef[] = [
    { Icon: CalendarDaysIcon,  label: "Розклад",    color: "#3b82f6", bg: "#eff6ff",  border: "#bfdbfe", size: 52, px: 18, py: 20, phase: 0     },
    { Icon: BotIcon,           label: "AI",         color: "#7c3aed", bg: "#f5f3ff",  border: "#c4b5fd", size: 56, px: 70, py: 16, phase: 0.9   },
    { Icon: FolderOpenIcon,    label: "Файли",      color: "#d97706", bg: "#fffbeb",  border: "#fde68a", size: 46, px: 10, py: 50, phase: 1.8   },
    { Icon: MessagesSquareIcon,label: "Чати",       color: "#059669", bg: "#ecfdf5",  border: "#a7f3d0", size: 48, px: 78, py: 48, phase: 2.7   },
    { Icon: ListChecksIcon,    label: "Органайзер", color: "#e11d48", bg: "#fff1f2",  border: "#fecdd3", size: 46, px: 20, py: 76, phase: 3.6   },
    { Icon: BrainIcon,         label: "Навчання",   color: "#db2777", bg: "#fdf2f8",  border: "#fbcfe8", size: 50, px: 68, py: 73, phase: 4.5   },
    { Icon: FileTextIcon,      label: "Конспекти",  color: "#ea580c", bg: "#fff7ed",  border: "#fed7aa", size: 42, px: 46, py:  8, phase: 5.4   },
    { Icon: ClockIcon,         label: "Дедлайни",   color: "#0891b2", bg: "#ecfeff",  border: "#a5f3fc", size: 44, px: 44, py: 82, phase: 6.3   },
];

/* ── Canvas connections ── */
function Lines({ size }: { size: number }) {
    const ref  = useRef<HTMLCanvasElement>(null);
    const raf  = useRef<number>(0);
    const tRef = useRef(0);

    useEffect(() => {
        const cvs = ref.current;
        if (!cvs || size === 0) return;

        const dpr = window.devicePixelRatio || 1;
        cvs.width  = Math.round(size * dpr);
        cvs.height = Math.round(size * dpr);
        cvs.style.width  = `${size}px`;
        cvs.style.height = `${size}px`;
        const ctx = cvs.getContext("2d")!;
        ctx.scale(dpr, dpr);

        const MAX_D = size * 0.50;

        // compute static center positions per icon
        const centers = ICONS.map(ic => ({
            x: (ic.px / 100) * size + ic.size / 2,
            y: (ic.py / 100) * size + ic.size / 2,
        }));

        const toHex = (v: number) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, "0");

        const draw = () => {
            tRef.current += 0.014;
            const t = tRef.current;
            ctx.clearRect(0, 0, size, size);

            for (let a = 0; a < ICONS.length; a++) {
                for (let b = a + 1; b < ICONS.length; b++) {
                    const pa = centers[a], pb = centers[b];
                    const dx = pa.x - pb.x, dy = pa.y - pb.y;
                    const d  = Math.sqrt(dx * dx + dy * dy);
                    if (d > MAX_D) continue;

                    const fade = 1 - d / MAX_D;

                    /* line */
                    const grad = ctx.createLinearGradient(pa.x, pa.y, pb.x, pb.y);
                    grad.addColorStop(0, ICONS[a].color + toHex(fade * 0.16));
                    grad.addColorStop(1, ICONS[b].color + toHex(fade * 0.16));
                    ctx.beginPath();
                    ctx.moveTo(pa.x, pa.y);
                    ctx.lineTo(pb.x, pb.y);
                    ctx.strokeStyle = grad;
                    ctx.lineWidth   = 0.8 + fade * 0.9;
                    ctx.stroke();

                    /* spark */
                    if (d < MAX_D * 0.7) {
                        const phase = ((a * 0.38 + b * 0.21 + t * 0.45)) % 1;
                        const alpha = Math.sin(phase * Math.PI) * fade * 0.65;
                        const sx    = pa.x + (pb.x - pa.x) * phase;
                        const sy    = pa.y + (pb.y - pa.y) * phase;
                        ctx.beginPath();
                        ctx.arc(sx, sy, 1.6, 0, Math.PI * 2);
                        ctx.fillStyle = ICONS[a].color + toHex(alpha);
                        ctx.fill();
                    }
                }
            }

            raf.current = requestAnimationFrame(draw);
        };

        cancelAnimationFrame(raf.current);
        raf.current = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(raf.current);
    }, [size]);

    return <canvas ref={ref} className="absolute inset-0 pointer-events-none" />;
}

/* ── Main ── */
export function OrbitHero({ className }: { className?: string }) {
    const wrapRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState(0);
    const [hovered, setHovered] = useState<number | null>(null);

    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => {
            const w = el.getBoundingClientRect().width;
            if (w > 0) setSize(Math.round(w));
        });
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
            const dt = Math.min((now - last) / 1000, 0.05);
            last = now;

            const s = sizeRef.current;
            const exp = expandedRef.current;
            const half = s / 2;
            const ctx = cvs.getContext("2d")!;

            // Resize canvas if needed (handles zoom / ResizeObserver updates)
            const dpr = window.devicePixelRatio || 1;
            if (cvs.width !== Math.round(s * dpr) || cvs.height !== Math.round(s * dpr)) {
                cvs.width = Math.round(s * dpr);
                cvs.height = Math.round(s * dpr);
                cvs.style.width = `${s}px`;
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
                    const a = (i / 200) * Math.PI * 2;
                    const pt = project(a, rx, ry, ORBIT_TILT, ORBIT_Z_ANGLES[oi]);
                    const sx = half + pt.x;
                    const sy = half + pt.y;
                    if (i === 0) { ctx.moveTo(sx, sy); } else { ctx.lineTo(sx, sy); }
                }
                ctx.closePath();
                ctx.strokeStyle = ORBIT_COLORS[oi];
                ctx.lineWidth = 1;
                ctx.setLineDash([5, 8]);
                ctx.stroke();
                ctx.setLineDash([]);
            }

            // ── Move icons ──
            const scale = s / 420;

            ICONS.forEach((ic, i) => {
                anglesRef.current[i] += (2 * Math.PI) / ORBIT_SPEEDS[ic.orbitIdx] * dt;

                const pt = project(anglesRef.current[i], rx, ry, ORBIT_TILT, ORBIT_Z_ANGLES[ic.orbitIdx]);
                const el = iconEls[i];
                if (!el) return;

                // Depth factor 0..1 (z ranges roughly -ry..+ry after tilt)
                const depth = Math.max(0, Math.min(1, (pt.z + ry) / (ry * 2)));
                const sc = (0.80 + depth * 0.28) * scale;

                el.style.transform = `translate(${half + pt.x - (ic.boxSize * scale) / 2}px, ${half + pt.y - (ic.boxSize * scale) / 2}px)`;
                el.style.opacity = String(0.45 + depth * 0.55);
                el.style.zIndex = String(Math.round(depth * 10));
                // Use width/height directly for scale to avoid CSS scale quirks
                el.style.width = `${ic.boxSize * sc}px`;
                el.style.height = `${ic.boxSize * sc}px`;
            });

            rafRef.current = requestAnimationFrame(loop);
        };

        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rafRef.current);
    }, []); // runs once — reads everything via refs

    const centerSize = Math.max(28, Math.min(62, Math.round(size * 0.19)));

    return (
        <div
            ref={wrapRef}
            className={["hidden lg:block relative select-none flex-shrink-0", className].filter(Boolean).join(" ")}
            style={{ width: "min(100%, 500px)", aspectRatio: "1 / 1" }}
        >
            {size > 0 && <Lines size={size} />}

            {/* icon nodes */}
            {ICONS.map((ic, i) => (
                <motion.div
                    key={ic.label}
                    className="absolute pointer-events-auto"
                    style={{
                        left:   `${ic.px}%`,
                        top:    `${ic.py}%`,
                        width:  ic.size,
                        height: ic.size,
                        zIndex: hovered === i ? 20 : 10,
                    }}
                    animate={{ y: [0, -9, 0, 7, 0], x: [0, 5, 0, -4, 0] }}
                    transition={{
                        duration: 4.8 + ic.phase * 0.35,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: ic.phase * 0.2,
                    }}
                    whileHover={{ scale: 1.2 }}
                    onHoverStart={() => setHovered(i)}
                    onHoverEnd={() => setHovered(null)}
                >
                    <div
                        className="w-full h-full flex items-center justify-center rounded-2xl"
                        style={{
                            background: ic.bg,
                            border:    `1.5px solid ${ic.border}`,
                            boxShadow:  hovered === i
                                ? `0 8px 28px ${ic.color}40, 0 2px 8px rgba(0,0,0,0.08)`
                                : `0 2px 12px rgba(0,0,0,0.07)`,
                            transition: "box-shadow 0.2s",
                        }}
                    >
                        <ic.Icon style={{ width: "44%", height: "44%", color: ic.color }} strokeWidth={1.8} />
                    </div>

                    <AnimatePresence>
                        {hovered === i && (
                            <motion.div
                                initial={{ opacity: 0, y: 4, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1   }}
                                exit={{   opacity: 0, y: 4, scale: 0.9 }}
                                transition={{ duration: 0.14 }}
                                style={{
                                    position: "absolute",
                                    bottom: "calc(100% + 8px)",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    whiteSpace: "nowrap",
                                    background: "#fff",
                                    border: `1px solid ${ic.border}`,
                                    borderRadius: 8,
                                    padding: "3px 10px",
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: ic.color,
                                    boxShadow: `0 4px 14px ${ic.color}25`,
                                    letterSpacing: "0.02em",
                                    zIndex: 50,
                                    pointerEvents: "none",
                                }}
                            >
                                {ic.label}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            ))}

            {/* center logo */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.25, type: "spring", stiffness: 200, damping: 18 }}
                style={{
                    position: "absolute",
                    width:  logoSize,
                    height: logoSize,
                    left: "50%",
                    top:  "50%",
                    marginLeft: -logoSize / 2,
                    marginTop:  -logoSize / 2,
                    borderRadius: Math.round(logoSize * 0.26),
                    background: "#fff",
                    border: "1.5px solid rgba(109,40,217,0.13)",
                    boxShadow: "0 0 0 10px rgba(109,40,217,0.05), 0 8px 32px rgba(109,40,217,0.16)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 30,
                    cursor: "default",
                }}
                whileHover={{ scale: 1.07 }}
            >
                <img
                    src={themedLogo("logo-no-bg")}
                    alt="Univa"
                    style={{ height: Math.round(logoSize * 0.52) }}
                    draggable={false}
                />

                <style>{`
                    @keyframes heroPulse {
                        0%   { transform: translate(-50%,-50%) scale(1);   opacity: 0.2; }
                        100% { transform: translate(-50%,-50%) scale(2.8); opacity: 0;   }
                    }
                `}</style>
                {[0, 1.8].map((delay, k) => (
                    <div key={k} style={{
                        position: "absolute",
                        width: logoSize, height: logoSize,
                        left: "50%", top: "50%",
                        borderRadius: "50%",
                        border: "1px solid rgba(109,40,217,0.25)",
                        pointerEvents: "none",
                        animation: `heroPulse 3.6s ease-out ${delay}s infinite`,
                    }} />
                ))}
            </motion.div>
        </div>
    );
}