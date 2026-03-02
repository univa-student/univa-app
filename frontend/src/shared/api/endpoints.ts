// ─── All API routes in one place ─────────────────────────────────────────────
const API = "/api/v1";

export const ENDPOINTS = {
    auth: {
        csrf: "/sanctum/csrf-cookie",
        register: `${API}/register`,
        login: `${API}/login`,
        logout: `${API}/logout`,
        me: `${API}/me/univa-user`,
    },
    settings: {
        group: (groupId: number) => `${API}/settings?group_id=${groupId}`,
        update: (key: string) => `${API}/settings/${encodeURIComponent(key)}`,
    },
} as const;
