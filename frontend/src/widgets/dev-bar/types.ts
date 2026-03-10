export type Tab = "env" | "flags" | "cache" | "storage" | "network" | "ws";

export type FlagOverrides = Record<string, boolean>;

export interface NetworkEntry {
    id: number;
    method: string;
    url: string;
    status: number | null;
    duration: number | null;
    ts: number;
    pending: boolean;
    error?: string;
    headers?: Record<string, string>;
    requestBody?: string | null;
    responseHeaders?: Record<string, string>;
    responseBody?: string | null;
    size?: number | null;
}

export type QueryStatusFilter = 'all' | 'success' | 'error' | 'pending';

export interface FlagDefinition {
    key: string;
    label: string;
    base: boolean;
    desc: string;
}

export interface ViewportInfo {
    label: string;
    icon: React.ElementType;
    vw: number;
    vh: number;
}

export interface MemoryInfo {
    used: number;
    total: number;
    pct: number;
}