/**
 * shared/lib/index.ts
 *
 * Shared utility functions — date formatting, string helpers, misc.
 */

// ─── Date helpers ─────────────────────────────────────────────────────────────

/** Format an ISO date string to a locale-aware short date (e.g. "10.03.2026"). */
export function formatDate(iso: string, locale = "uk-UA"): string {
    return new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(iso));
}

/** Format an ISO date string to a short time (e.g. "14:30"). */
export function formatTime(iso: string, locale = "uk-UA"): string {
    return new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(iso));
}

/** Format an ISO date string to a full datetime (e.g. "10.03.2026, 14:30"). */
export function formatDateTime(iso: string, locale = "uk-UA"): string {
    return `${formatDate(iso, locale)}, ${formatTime(iso, locale)}`;
}

// ─── String helpers ───────────────────────────────────────────────────────────

/** Truncate a string to `maxLength` chars, appending "…" if needed. */
export function truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength).trimEnd() + "…";
}

/** Convert a name tuple to initials (e.g. "Іван Петренко" → "ІП"). */
export function initials(firstName: string, lastName?: string | null): string {
    const parts = [firstName, lastName].filter(Boolean) as string[];
    return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

/** Sleep for `ms` milliseconds (useful in async flows). */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
