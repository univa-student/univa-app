/**
 * entities/space/api/index.ts
 *
 * Space CRUD API — stubs ready for backend integration.
 */
import { apiFetch } from "@/shared/api/http";
import type { Space, SpaceMember } from "../model/types";

const API = "/api/v1";

export function listSpaces(): Promise<Space[]> {
    return apiFetch<Space[]>(`${API}/spaces`);
}

export function getSpace(id: number): Promise<Space> {
    return apiFetch<Space>(`${API}/spaces/${id}`);
}

export function createSpace(data: Pick<Space, "name" | "description">): Promise<Space> {
    return apiFetch<Space>(`${API}/spaces`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export function joinSpace(id: number): Promise<void> {
    return apiFetch<void>(`${API}/spaces/${id}/join`, { method: "POST" });
}

export function getSpaceMembers(id: number): Promise<SpaceMember[]> {
    return apiFetch<SpaceMember[]>(`${API}/spaces/${id}/members`);
}
