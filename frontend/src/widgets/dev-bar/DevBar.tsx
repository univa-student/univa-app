import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
    BugIcon, SunIcon, MoonIcon, ChevronRightIcon, ChevronLeftIcon,
    MoveIcon, LayoutPanelTopIcon, ExternalLinkIcon
} from "lucide-react";
import {
    IS_DEV, APP_VERSION, APP_NAME, APP_ENV, LS_DEV_BAR_CLOSED
} from "@/app/config/app.config";
import type { Tab } from "./types";
import { TABS, LS_PANEL_TAB_KEY } from "./constants";
import { useOnline } from "./hooks/useOnline";
import { useViewport } from "./hooks/useViewport";
import { useNetworkInterceptor } from "./hooks/useNetworkInterceptor";
import { Pill } from "./ui/Pill";
import { EnvTab } from "./tabs/EnvTab";
import { FlagsTab } from "./tabs/FlagsTab";
import { CacheTab } from "./tabs/CacheTab";
import { StorageTab } from "./tabs/StorageTab";
import { NetworkTab } from "./tabs/NetworkTab";
import { WsTab } from "./tabs/WsTab";

type DevBarMode = "floating" | "bottom" | "popup";

const LS_DEV_BAR_MODE = "univa_dev_bar_mode";
const LS_DEV_BAR_POS = "univa_dev_bar_position";
const LS_DEV_BAR_SIZE = "univa_dev_bar_size";

export function DevBar() {
    if (!IS_DEV) return null;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [hidden] = useState(() =>
        localStorage.getItem(LS_DEV_BAR_CLOSED) === "univa_dev_bar_closed"
    );

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [collapsed, setCollapsed] = useState(false);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [mode, setMode] = useState<DevBarMode>(() => {
        const saved = localStorage.getItem(LS_DEV_BAR_MODE) as DevBarMode;
        if (saved === "popup") {
            // Cannot reliably restore portal connections across page reloads
            localStorage.setItem(LS_DEV_BAR_MODE, "floating");
            return "floating";
        }
        return saved ?? "floating";
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [tab, setTab] = useState<Tab>(() =>
        (localStorage.getItem(LS_PANEL_TAB_KEY) as Tab) ?? "env"
    );

    // Floating mode state
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [position, setPosition] = useState(() => {
        const saved = localStorage.getItem(LS_DEV_BAR_POS);
        return saved ? JSON.parse(saved) : { x: window.innerWidth - 820, y: 20 };
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [size, setSize] = useState(() => {
        const saved = localStorage.getItem(LS_DEV_BAR_SIZE);
        return saved ? JSON.parse(saved) : { width: 800, height: 600 };
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isDragging, setIsDragging] = useState(false);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isResizing, setIsResizing] = useState(false);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const dragOffset = useRef({ x: 0, y: 0 });
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const resizeStart = useRef({ width: 0, height: 0, x: 0, y: 0 });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const popupRef = useRef<Window | null>(null);
    const [popupContainer, setPopupContainer] = useState<HTMLElement | null>(null);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const qc = useQueryClient();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const online = useOnline();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const vp = useViewport();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { entries: netEntries, clear: clearNet } = useNetworkInterceptor();

    const switchTab = (t: Tab) => {
        setTab(t);
        localStorage.setItem(LS_PANEL_TAB_KEY, t);
    };

    const switchMode = (m: DevBarMode) => {
        if (m === "popup") {
            openPopup();
        } else {
            if (popupRef.current && !popupRef.current.closed) {
                popupRef.current.close();
            }
            setMode(m);
            localStorage.setItem(LS_DEV_BAR_MODE, m);
        }
    };

    const openPopup = () => {
        if (popupRef.current && !popupRef.current.closed) {
            popupRef.current.focus();
            return;
        }

        const popup = window.open(
            "about:blank",
            "DevBarPopup",
            `width=1000,height=700,left=100,top=100,menubar=no,toolbar=no,location=no,status=no`
        );

        if (!popup) {
            alert("Popup blocked! Please allow popups for this site.");
            return;
        }

        popupRef.current = popup;

        // Inject styles and content
        popup.document.write(`
            <!DOCTYPE html>
            <html class="dark">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>DevBar - ${APP_NAME}</title>
                    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
                <!-- Initial styles from main window -->
                ${Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
                .map(node => node.outerHTML)
                .join('\n')}
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: ui-monospace, monospace;
                        background: #09090b;
                        color: #fff;
                        overflow: hidden;
                    }
                    #root { 
                        width: 100vw; 
                        height: 100vh; 
                        display: flex;
                        flex-direction: column;
                    }
                </style>
            </head>
            <body>
                <div id="root"></div>
            </body>
            </html>
        `);

        popup.document.close();

        // Let the browser parse the HTML before mounting React
        setTimeout(() => {
            const rootNode = popup.document.getElementById("root");
            if (rootNode) {
                setPopupContainer(rootNode);
                setMode("popup");
                localStorage.setItem(LS_DEV_BAR_MODE, "popup");
            }
        }, 50);

        // Keep styles in sync using a cleaner MutationObserver (for Vite HMR)
        const observer = new MutationObserver((mutations) => {
            if (!popupRef.current || popupRef.current.closed) return;
            mutations.forEach(m => {
                m.addedNodes.forEach(node => {
                    if (node.nodeName === 'STYLE' || node.nodeName === 'LINK') {
                        popupRef.current?.document.head.appendChild(node.cloneNode(true));
                    }
                });
            });
        });
        observer.observe(document.head, { childList: true });

        const handleClose = () => {
            observer.disconnect();
            popupRef.current = null;
            setPopupContainer(null);
            setMode("floating");
            localStorage.setItem(LS_DEV_BAR_MODE, "floating");
        };

        // Listen for popup close
        const checkClosed = setInterval(() => {
            if (popup.closed) {
                clearInterval(checkClosed);
                handleClose();
            }
        }, 500);

        popup.addEventListener("beforeunload", () => {
            clearInterval(checkClosed);
            handleClose();
        });
    };

    // Dragging logic
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            setPosition({
                x: e.clientX - dragOffset.current.x,
                y: e.clientY - dragOffset.current.y,
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            localStorage.setItem(LS_DEV_BAR_POS, JSON.stringify(position));
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging, position]);

    // Resizing logic
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - resizeStart.current.x;
            const deltaY = e.clientY - resizeStart.current.y;

            setSize({
                width: Math.max(400, resizeStart.current.width + deltaX),
                height: Math.max(300, resizeStart.current.height + deltaY),
            });
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            localStorage.setItem(LS_DEV_BAR_SIZE, JSON.stringify(size));
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isResizing, size]);

    const handleDragStart = (e: React.MouseEvent) => {
        if (mode !== "floating") return;
        setIsDragging(true);
        dragOffset.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        };
    };

    const handleResizeStart = (e: React.MouseEvent) => {
        if (mode !== "floating") return;
        e.stopPropagation();
        setIsResizing(true);
        resizeStart.current = {
            width: size.width,
            height: size.height,
            x: e.clientX,
            y: e.clientY,
        };
    };

    if (hidden) return null;

    const renderContent = () => (
        <>
            {/* Header */}
            <div
                className="flex items-center justify-between gap-2 px-3 py-2.5 border-b border-zinc-800 shrink-0 cursor-move"
                onMouseDown={handleDragStart}
            >
                <div className="flex items-center gap-2">
                    <BugIcon className="size-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold text-[15px] tracking-wide">DEV</span>
                    <Pill color="violet">v{APP_VERSION}</Pill>
                    <Pill color={online ? "emerald" : "red"}>
                        {online ? "online" : "offline"}
                    </Pill>
                </div>
                <div className="flex items-center gap-1">
                    {/* Mode switchers */}
                    <button
                        onClick={() => switchMode("floating")}
                        className={`rounded p-1 transition-colors ${mode === "floating"
                            ? "bg-zinc-700 text-emerald-400"
                            : "hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300"
                            }`}
                        title="Floating mode"
                    >
                        <MoveIcon className="size-4" />
                    </button>
                    <button
                        onClick={() => switchMode("bottom")}
                        className={`rounded p-1 transition-colors ${mode === "bottom"
                            ? "bg-zinc-700 text-emerald-400"
                            : "hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300"
                            }`}
                        title="Bottom panel"
                    >
                        <LayoutPanelTopIcon className="size-4" />
                    </button>
                    <button
                        onClick={() => switchMode("popup")}
                        className="rounded p-1 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                        title="Open in popup"
                    >
                        <ExternalLinkIcon className="size-4" />
                    </button>

                    <div className="w-px h-4 bg-zinc-700 mx-1" />

                    <button
                        onClick={() => document.documentElement.classList.remove("dark")}
                        className="rounded p-1 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                        title="Force light"
                    >
                        <SunIcon className="size-4" />
                    </button>
                    <button
                        onClick={() => document.documentElement.classList.add("dark")}
                        className="rounded p-1 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                        title="Force dark"
                    >
                        <MoonIcon className="size-4" />
                    </button>
                    <button
                        onClick={() => setCollapsed(true)}
                        className="rounded p-1 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                        title="Collapse"
                    >
                        {mode === "bottom" ? <ChevronRightIcon className="size-4 rotate-90" /> : <ChevronRightIcon className="size-4" />}
                    </button>
                </div>
            </div>

            {/* Tab bar */}
            <div className="flex shrink-0 border-b border-zinc-800 bg-zinc-950">
                {TABS.map(({ id, label, icon: Icon }) => {
                    const badge = id === "network" && netEntries.length > 0
                        ? netEntries.length
                        : id === "cache"
                            ? qc.getQueryCache().getAll().length
                            : null;
                    return (
                        <button
                            key={id}
                            onClick={() => switchTab(id)}
                            className={`
                                flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors relative
                                ${tab === id
                                    ? "text-emerald-400 border-b-2 border-emerald-500"
                                    : "text-zinc-600 hover:text-zinc-400 border-b-2 border-transparent"}
                            `}
                        >
                            <Icon className="size-3.5" />
                            <span className="text-[13px] tracking-wider">{label}</span>
                            {badge !== null && badge > 0 && (
                                <span className="absolute top-1 right-1 text-[12px] bg-zinc-700 text-zinc-300 rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold">
                                    {badge > 99 ? "99" : badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Tab content */}
            <div className="flex flex-col flex-1 overflow-hidden">
                {tab === "env" && <EnvTab />}
                {tab === "flags" && <FlagsTab />}
                {tab === "cache" && <CacheTab />}
                {tab === "storage" && <StorageTab />}
                {tab === "network" && <NetworkTab entries={netEntries} clear={clearNet} />}
                {tab === "ws" && <WsTab />}
            </div>

            {/* Footer */}
            <div className="shrink-0 flex items-center justify-between px-3 py-1.5 border-t border-zinc-800 bg-zinc-950">
                <span className="text-[12px] text-zinc-700">{APP_NAME} · {APP_ENV}</span>
                <span className="text-[12px] text-zinc-700">{vp.vw}×{vp.vh} {vp.label}</span>
            </div>
        </>
    );

    // Floating mode
    if (mode === "floating") {
        return (
            <div className="fixed inset-0 z-[9999] pointer-events-none">
                {collapsed ? (
                    <button
                        onClick={() => setCollapsed(false)}
                        className="pointer-events-auto fixed top-4 right-4 flex items-center gap-2 px-3 py-2 bg-zinc-900/95 border border-zinc-700/80 backdrop-blur-lg rounded-lg text-emerald-400 hover:text-emerald-300 transition-colors shadow-xl"
                        title="Open DevBar"
                    >
                        <BugIcon className="size-4" />
                        <span className="text-sm font-mono">DEV</span>
                        <div className={`w-2 h-2 rounded-full ${online ? "bg-emerald-500" : "bg-red-500"}`} />
                    </button>
                ) : (
                    <div
                        className="pointer-events-auto fixed flex flex-col bg-zinc-950/98 border border-zinc-700/80 backdrop-blur-xl shadow-2xl text-xs font-mono rounded-lg overflow-hidden"
                        style={{
                            left: `${position.x}px`,
                            top: `${position.y}px`,
                            width: `${size.width}px`,
                            height: `${size.height}px`,
                        }}
                    >
                        {renderContent()}

                        {/* Resize handle */}
                        <div
                            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
                            onMouseDown={handleResizeStart}
                        >
                            <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-zinc-600" />
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Bottom mode
    if (mode === "bottom") {
        return (
            <div className="fixed bottom-0 left-0 right-0 z-[9999] pointer-events-none">
                {collapsed ? (
                    <button
                        onClick={() => setCollapsed(false)}
                        className="pointer-events-auto absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-zinc-900/95 border-t border-x border-zinc-700/80 backdrop-blur-lg rounded-t-lg text-emerald-400 hover:text-emerald-300 transition-colors shadow-xl"
                        title="Open DevBar"
                    >
                        <BugIcon className="size-4" />
                        <ChevronLeftIcon className="size-4 -rotate-90" />
                        <span className="text-sm font-mono">DEV</span>
                        <div className={`w-2 h-2 rounded-full ${online ? "bg-emerald-500" : "bg-red-500"}`} />
                    </button>
                ) : (
                    <div className="pointer-events-auto flex flex-col w-full h-[400px] bg-zinc-950/98 border-t border-zinc-700/80 backdrop-blur-xl shadow-2xl text-xs font-mono">
                        {renderContent()}
                    </div>
                )}
            </div>
        );
    }

    // Popup mode
    if (mode === "popup" && popupContainer) {
        // Without QueryClientProvider here, useQueryClient inside tabs will THROW an error 
        // and crash the entire React tree, resulting in an empty div!
        return createPortal(
            <QueryClientProvider client={qc}>
                <div className="flex flex-col w-full h-full bg-zinc-950 text-xs font-mono">
                    {renderContent()}
                </div>
            </QueryClientProvider>,
            popupContainer
        );
    }

    return null;
}