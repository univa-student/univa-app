import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckIcon, SearchIcon, XIcon } from "lucide-react";
import {
    useAcceptFriendRequest,
    useFriends,
    usePendingFriendRequests,
    useRemoveFriend,
    useSearchFriendUsers,
} from "../api/hooks";
import type { FriendCard, PendingFriendRequest } from "../model/types";
import { FriendshipActionButton } from "./friendship-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/shadcn/ui/avatar";
import { Button } from "@/shared/shadcn/ui/button";
import { ButtonGroup } from "@/shared/shadcn/ui/button-group";
import { Input } from "@/shared/shadcn/ui/input";
import { Skeleton } from "@/shared/shadcn/ui/skeleton";

function getInitials(name: string) {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((chunk) => chunk[0] ?? "")
        .join("")
        .toUpperCase() || "U";
}

function getDisplayName(user: FriendCard) {
    return [user.firstName, user.lastName].filter(Boolean).join(" ") || "Студент";
}

function getContactsLine(user: FriendCard) {
    return [user.profile?.city, user.profile?.telegram, user.profile?.phone]
        .filter(Boolean)
        .join(" • ");
}

function FriendCardSkeleton() {
    return (
        <div className="flex items-center gap-4 rounded-2xl border border-border/50 p-4">
            <Skeleton className="size-12 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-8 w-40 rounded-lg" />
        </div>
    );
}

function EmptyState({ title, description }: { title: string; description: string }) {
    return (
        <div className="rounded-3xl border border-dashed border-border/70 p-10 text-center">
            <p className="font-medium">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
    );
}

function FriendUserCard({
    user,
    statusText,
    actions,
    accentClassName = "border-border/60 bg-card/50 hover:bg-accent/30",
}: {
    user: FriendCard;
    statusText?: string | null;
    actions: React.ReactNode;
    accentClassName?: string;
}) {
    const name = getDisplayName(user);
    const contactsLine = getContactsLine(user);

    return (
        <div
            className={`flex flex-col gap-4 rounded-2xl border p-4 transition-colors sm:flex-row sm:items-center sm:justify-between ${accentClassName}`}
        >
            <Link to={`/dashboard/profile/${user.username}`} className="flex min-w-0 flex-1 items-center gap-4">
                <Avatar className="size-12 rounded-full border border-background">
                    <AvatarImage src={user.avatarPath || ""} />
                    <AvatarFallback>{getInitials(name)}</AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{name}</p>
                    <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
                    {statusText ? (
                        <p className="mt-1 truncate text-xs text-muted-foreground">{statusText}</p>
                    ) : null}
                    {contactsLine ? (
                        <p className="mt-1 truncate text-xs text-muted-foreground">{contactsLine}</p>
                    ) : null}
                </div>
            </Link>

            <div className="w-full shrink-0 sm:w-auto sm:pl-3">{actions}</div>
        </div>
    );
}

export function FriendsList() {
    const { data: friends, isLoading } = useFriends();

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                    <FriendCardSkeleton key={item} />
                ))}
            </div>
        );
    }

    if (!friends || friends.length === 0) {
        return (
            <EmptyState
                title="У вас поки немає друзів"
                description="Скористайтеся пошуком, щоб додати одногрупників і знайомих без переходу в кожен профіль."
            />
        );
    }

    return (
        <div className="grid gap-3 sm:grid-cols-2">
            {friends.map((friend) => (
                <FriendUserCard
                    key={friend.id}
                    user={friend}
                    actions={
                        <FriendshipActionButton
                            userId={friend.id}
                            status={friend.friendshipStatus}
                        />
                    }
                />
            ))}
        </div>
    );
}

export function PendingRequestsList() {
    const { data: requests, isLoading } = usePendingFriendRequests();
    const acceptReq = useAcceptFriendRequest();
    const declineReq = useRemoveFriend();
    const [processingUserId, setProcessingUserId] = useState<number | null>(null);

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2].map((item) => (
                    <FriendCardSkeleton key={item} />
                ))}
            </div>
        );
    }

    if (!requests || requests.length === 0) {
        return (
            <EmptyState
                title="Немає вхідних запитів"
                description="Коли хтось захоче додати вас у друзі, запит з’явиться тут."
            />
        );
    }

    return (
        <div className="grid gap-3 sm:grid-cols-2">
            {requests.map((request: PendingFriendRequest) => {
                const isCurrentPending = processingUserId === request.user.id;

                return (
                    <FriendUserCard
                        key={request.id}
                        user={request.user}
                        statusText="Хоче додати вас у друзі"
                        accentClassName="border-primary/20 bg-primary/5 hover:bg-primary/10"
                        actions={
                            <ButtonGroup className="w-full sm:w-auto">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 text-destructive hover:bg-destructive/10 sm:flex-none"
                                    onClick={() => {
                                        setProcessingUserId(request.user.id);
                                        declineReq.mutate(request.user.id, {
                                            onSettled: () => setProcessingUserId(null),
                                        });
                                    }}
                                    disabled={isCurrentPending}
                                    title="Відхилити"
                                >
                                    <XIcon className="size-4" />
                                    <span className="ml-2 sm:hidden">Відхилити</span>
                                </Button>

                                <Button
                                    size="sm"
                                    className="flex-1 sm:flex-none"
                                    onClick={() => {
                                        setProcessingUserId(request.user.id);
                                        acceptReq.mutate(request.user.id, {
                                            onSettled: () => setProcessingUserId(null),
                                        });
                                    }}
                                    disabled={isCurrentPending}
                                    title="Прийняти"
                                >
                                    <CheckIcon className="size-4" />
                                    <span className="ml-2 sm:hidden">Прийняти</span>
                                </Button>
                            </ButtonGroup>
                        }
                    />
                );
            })}
        </div>
    );
}
export function FriendsSearchList() {
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setDebouncedQuery(query.trim());
        }, 300);

        return () => {
            window.clearTimeout(timer);
        };
    }, [query]);

    const isReady = debouncedQuery.length >= 2;
    const { data: users, isFetching } = useSearchFriendUsers(debouncedQuery, isReady);

    return (
        <div className="space-y-4">
            <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Шукайте за ім'ям або @username"
                    className="h-11 rounded-2xl pl-10 pr-4"
                />
            </div>

            {query.trim().length === 0 ? (
                <EmptyState
                    title="Пошук користувачів"
                    description="Введіть ім’я або @username, щоб швидко знайти людину і додати її в друзі."
                />
            ) : query.trim().length < 2 ? (
                <EmptyState
                    title="Замало символів"
                    description="Введіть щонайменше 2 символи, щоб почати пошук."
                />
            ) : null}

            {query.trim().length >= 2 && isFetching && (!users || users.length === 0) ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                        <FriendCardSkeleton key={item} />
                    ))}
                </div>
            ) : null}

            {query.trim().length >= 2 && users && users.length > 0 ? (
                <div className="space-y-3">
                    {isFetching ? (
                        <p className="text-xs text-muted-foreground">Оновлюю результати пошуку...</p>
                    ) : null}
                    <div className="grid gap-3 sm:grid-cols-2">
                        {users.map((user) => (
                            <FriendUserCard
                                key={user.id}
                                user={user}
                                actions={
                                    <FriendshipActionButton
                                        userId={user.id}
                                        status={user.friendshipStatus}
                                    />
                                }
                            />
                        ))}
                    </div>
                </div>
            ) : null}

            {query.trim().length >= 2 && !isFetching && users?.length === 0 ? (
                <EmptyState
                    title="Нічого не знайдено"
                    description="Спробуйте інше ім’я або перевірте написання @username."
                />
            ) : null}
        </div>
    );
}
