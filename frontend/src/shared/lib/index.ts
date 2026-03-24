/**
 * shared/lib/index.ts
 */

// ─── Date helpers ─────────────────────────────────────────

function safeDate(iso: string): Date | null {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? null : d;
}

export function formatDate(iso: string, locale = "uk-UA"): string {
    const d = safeDate(iso);
    if (!d) return "—";

    return new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(d);
}

export function formatTime(iso: string, locale = "uk-UA"): string {
    const d = safeDate(iso);
    if (!d) return "—";

    return new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
    }).format(d);
}

export function formatDateTime(iso: string, locale = "uk-UA"): string {
    const d = safeDate(iso);
    if (!d) return "—";

    return `${formatDate(iso, locale)}, ${formatTime(iso, locale)}`;
}

// ─── String helpers ───────────────────────────────────────

export function truncate(str: string, maxLength: number): string {
    if (!str) return "";
    if (str.length <= maxLength) return str;

    return str.slice(0, maxLength).trimEnd() + "…";
}

export function initials(firstName: string, lastName?: string | null): string {
    const parts = [firstName, lastName]
        .filter(Boolean)
        .map((p) => p!.trim())
        .filter(Boolean);

    return parts
        .map((p) => p[0]?.toUpperCase() ?? "")
        .join("")
        .slice(0, 2);
}

// ─── Misc ─────────────────────────────────────────────────

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}