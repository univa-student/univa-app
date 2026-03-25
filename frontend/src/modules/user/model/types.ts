export type FriendshipStatus =
    | "none"
    | "accepted"
    | "pending_sent"
    | "pending_received"
    | "self";

export interface FriendProfilePreview {
    city: string | null;
    telegram: string | null;
    phone: string | null;
}

export interface FriendCard {
    id: number;
    firstName: string;
    lastName: string | null;
    username: string;
    avatarPath: string | null;
    friendshipStatus: FriendshipStatus;
    profile: FriendProfilePreview;
}

export interface PendingFriendRequest {
    id: number;
    createdAt: string;
    user: FriendCard;
}

export interface FriendshipMutationResult {
    message: string;
    status: "pending" | "accepted";
}
