// ─── All API routes in one place ─────────────────────────────────────────────
const API = "/api/v1";

export const ENDPOINTS = {
    auth: {
        csrf: "/sanctum/csrf-cookie",
        register: `${API}/register`,
        login: `${API}/login`,
        logout: `${API}/logout`,
        me: `${API}/univa-user`,
    },
    settings: {
        me: `${API}/settings`,
    },
    // Готово для розширення:
    // files:  { list: `${API}/files`, upload: `${API}/files`, ... },
    // spaces: { list: `${API}/spaces`, ... },
    // tasks:  { list: `${API}/tasks`, ... },
} as const;
