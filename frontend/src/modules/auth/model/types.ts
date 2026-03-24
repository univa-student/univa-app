export interface User {
    id: number;
    firstName: string;
    lastName: string | null;
    username: string;
    avatarPath: string | null;
    email: string;
    emailVerifiedAt?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateProfilePayload {
    firstName: string;
    lastName?: string;
    username: string;
}

export interface ChangePasswordPayload {
    currentPassword: string;
    password: string;
    password_confirmation: string;
}

export interface RegisterFormData {
    last_name: string;
    first_name: string;
    middle_name: string;
    username: string;
    email: string;
    password: string;
    password_confirmation: string;
    agree_terms: boolean;
    marketing_opt_in: boolean;
}
