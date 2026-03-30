import { cn } from "@/shared/shadcn/lib/utils";
import { Button } from "@/shared/shadcn/ui/button";
import { ButtonGroup, ButtonGroupText } from "@/shared/shadcn/ui/button-group";
import { CheckIcon, Clock3Icon, Loader2Icon, UserMinusIcon, UserPlusIcon } from "lucide-react";
import {
    useAcceptFriendRequest,
    useFriendshipStatus,
    useRemoveFriend,
    useSendFriendRequest,
} from "../api/hooks";
import type { FriendshipStatus } from "../model/types";

interface FriendshipActionButtonProps {
    userId: number;
    status: FriendshipStatus | null | undefined;
    isStatusLoading?: boolean;
    className?: string;
}

function LoadingState({ className }: { className?: string }) {
    return (
        <ButtonGroup className={cn("w-full sm:w-auto", className)}>
            <ButtonGroupText className="min-h-8 min-w-[10.5rem] justify-center rounded-lg px-3 text-xs text-muted-foreground">
                <Loader2Icon className="size-4 animate-spin" />
                Завантаження
            </ButtonGroupText>
        </ButtonGroup>
    );
}

export function FriendshipActionButton({
    userId,
    status,
    isStatusLoading = false,
    className,
}: FriendshipActionButtonProps) {
    const sendReq = useSendFriendRequest();
    const acceptReq = useAcceptFriendRequest();
    const removeReq = useRemoveFriend();

    if (status === "self") {
        return null;
    }

    if (isStatusLoading || !status) {
        return <LoadingState className={className} />;
    }

    const isPendingMut = sendReq.isPending || acceptReq.isPending || removeReq.isPending;

    if (status === "none") {
        return (
            <Button
                variant="default"
                size="default"
                className="min-w-[10.5rem] justify-center"
                disabled={isPendingMut}
                onClick={() => sendReq.mutate(userId)}
            >
                {isPendingMut ? (
                    <Loader2Icon className="size-4 animate-spin" />
                ) : (
                    <UserPlusIcon className="size-4" />
                )}
                Додати
            </Button>
        );
    }

    if (status === "pending_sent") {
        return (
            <ButtonGroup className={cn("w-full sm:w-auto", className)}>
                <ButtonGroupText className="min-h-8 min-w-[10.5rem] justify-center rounded-lg px-3 text-xs text-muted-foreground">
                    <Clock3Icon className="size-4" />
                    Запит надіслано
                </ButtonGroupText>
            </ButtonGroup>
        );
    }

    if (status === "pending_received") {
        return (
            <Button
                variant="default"
                size="default"
                className="min-w-[10.5rem] justify-center bg-green-600 text-white hover:bg-green-700"
                disabled={isPendingMut}
                onClick={() => acceptReq.mutate(userId)}
            >
                {isPendingMut ? (
                    <Loader2Icon className="size-4 animate-spin" />
                ) : (
                    <CheckIcon className="size-4" />
                )}
                Прийняти
            </Button>
        );
    }

    if (status === "accepted") {
        return (
            <ButtonGroup className={cn("w-full sm:w-auto", className)}>
                <Button
                    variant="outline"
                    size="default"
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    disabled={isPendingMut}
                    onClick={() => removeReq.mutate(userId)}
                    title="Видалити з друзів"
                >
                    {isPendingMut ? (
                        <Loader2Icon className="size-4 animate-spin" />
                    ) : (
                        <UserMinusIcon className="size-4" />
                    )}
                </Button>

            </ButtonGroup>
        );
    }

    return null;
}

export function FriendshipButton({ userId }: { userId: number }) {
    const { data: status, isLoading: isStatusLoading } = useFriendshipStatus(userId);

    return (
        <FriendshipActionButton
            userId={userId}
            status={status}
            isStatusLoading={isStatusLoading}
        />
    );
}
