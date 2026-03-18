export interface AppNotification {
    id: number;
    user_id: number;
    type: string;
    payload: Record<string, any> | null;
    read_at: string | null;
    created_at: string;
}

export interface PaginatedNotifications {
    data: AppNotification[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}
