import { ServerIcon, ToggleRightIcon, DatabaseIcon, HardDriveIcon, ActivityIcon, WifiIcon } from "lucide-react";
import { ENABLE_AI, ENABLE_SPACES, ENABLE_CHAT, ENABLE_WS } from "@/app/config/feature-flags";
import type { Tab, FlagDefinition } from "./types";

export const LS_FLAGS_KEY = "univa_dev_flags";
export const LS_PANEL_TAB_KEY = "univa_dev_tab";
export const MAX_NET = 50;

export const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "env", label: "ENV", icon: ServerIcon },
    { id: "flags", label: "FLAGS", icon: ToggleRightIcon },
    { id: "cache", label: "CACHE", icon: DatabaseIcon },
    { id: "storage", label: "STORE", icon: HardDriveIcon },
    { id: "network", label: "NET", icon: ActivityIcon },
    { id: "ws", label: "WS", icon: WifiIcon },
];

export const ALL_FLAGS: FlagDefinition[] = [
    { key: "ENABLE_AI", label: "AI Features", base: ENABLE_AI, desc: "LLM-powered UI blocks" },
    { key: "ENABLE_SPACES", label: "Spaces", base: ENABLE_SPACES, desc: "Multi-space navigation" },
    { key: "ENABLE_CHAT", label: "Chat", base: ENABLE_CHAT, desc: "Real-time chat module" },
    { key: "ENABLE_WS", label: "WebSocket", base: ENABLE_WS, desc: "Live push events" },
];