export interface User {
    id: number;
    first_name: string;
    last_name: string;
    middle_name: string;
    full_name: string;
    avatar_path: string | null;
    email: string;
    phone?: string | null;
    role?: 'user' | 'admin' | 'moderator';
    email_verified_at?: string | null;
    created_at: string;
    updated_at: string;
}
