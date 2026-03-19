/**
 * entities/space/model/types.ts
 *
 * Space (group / channel) domain types.
 */

export type SpaceRole = "owner" | "admin" | "member";

export interface SpaceMember {
    userId: number;
    firstName: string;
    lastName: string | null;
    role: SpaceRole;
    joinedAt: string;
}

export interface Space {
    id: number;
    name: string;
    description: string | null;
    avatarPath: string | null;
    membersCount: number;
    myRole: SpaceRole | null;
    createdAt: string;
    updatedAt: string;
}
