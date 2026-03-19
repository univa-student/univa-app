export function formatRelativeDate(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 60) return `${minutes} хв тому`;
    const hours = Math.floor(diff / 3_600_000);
    if (hours < 24) return `${hours} год тому`;
    const days = Math.floor(diff / 86_400_000);
    if (days === 1) return "вчора";
    return new Date(iso).toLocaleDateString("uk-UA", { day: "numeric", month: "short" });
}
