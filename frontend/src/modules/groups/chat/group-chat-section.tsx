import { useEffect, useMemo, useState, type FormEvent } from "react";
import { HashIcon, SendIcon } from "lucide-react";

import {
    useCreateGroupChannelMessage,
    useGroupChannelMessages,
} from "@/modules/groups/api/hooks";
import type { GroupChannel } from "@/modules/groups/model/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/shadcn/ui/avatar";
import { Badge } from "@/shared/shadcn/ui/badge";
import { Button } from "@/shared/shadcn/ui/button";
import { Card, CardContent } from "@/shared/shadcn/ui/card";
import { Input } from "@/shared/shadcn/ui/input";

import { EmptyState, SectionHeader } from "../shared/ui";
import { formatDateTime } from "../shared/utils";

interface GroupChatSectionProps {
    groupId: number;
    channels: GroupChannel[];
}

const CHANNEL_TYPE_LABELS: Record<GroupChannel["type"], string> = {
    general: "Загальні",
    announcements: "Оголошення",
    subject: "Предметні",
    custom: "Інші",
};

function initials(channelName: string) {
    return channelName.slice(0, 2).toUpperCase();
}

export function GroupChatSection({ groupId, channels }: GroupChatSectionProps) {
    const [activeChannelId, setActiveChannelId] = useState<number | null>(null);
    const [message, setMessage] = useState("");

    const createMessage = useCreateGroupChannelMessage();

    const groupedChannels = useMemo(() => {
        return channels.reduce<Record<string, GroupChannel[]>>((accumulator, channel) => {
            if (!accumulator[channel.type]) accumulator[channel.type] = [];
            accumulator[channel.type].push(channel);
            return accumulator;
        }, {});
    }, [channels]);

    useEffect(() => {
        if (!channels.length) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setActiveChannelId(null);
            return;
        }

        setActiveChannelId((current) =>
            current && channels.some((channel) => channel.id === current)
                ? current
                : channels[0].id,
        );
    }, [channels]);

    const activeChannel =
        channels.find((channel) => channel.id === activeChannelId) ?? null;
    const { data: messages = [] } = useGroupChannelMessages(groupId, activeChannelId);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!activeChannelId || !message.trim()) return;

        await createMessage.mutateAsync({
            groupId,
            channelId: activeChannelId,
            payload: { content: message.trim() },
        });

        setMessage("");
    }

    return (
        <div>
            <SectionHeader eyebrow="Channels" title="Канали" />

            <div className="grid gap-4 p-4 md:p-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                <Card className="border-border/70">
                    <CardContent className="space-y-4 p-4">
                        {channels.length ? (
                            Object.entries(groupedChannels).map(([type, items]) => (
                                <div key={type} className="space-y-2">
                                    <div className="px-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                        {CHANNEL_TYPE_LABELS[type as GroupChannel["type"]]}
                                    </div>
                                    <div className="space-y-1">
                                        {items.map((channel) => {
                                            const isActive = channel.id === activeChannelId;

                                            return (
                                                <button
                                                    key={channel.id}
                                                    type="button"
                                                    onClick={() => setActiveChannelId(channel.id)}
                                                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                                                        isActive
                                                            ? "bg-primary/8 ring-1 ring-primary/20"
                                                            : "hover:bg-muted/40"
                                                    }`}
                                                >
                                                    <div
                                                        className="flex size-9 items-center justify-center rounded-xl text-xs font-semibold text-white"
                                                        style={{
                                                            backgroundColor:
                                                                channel.subject?.color ??
                                                                "#2563eb",
                                                        }}
                                                    >
                                                        {channel.subject
                                                            ? initials(channel.subject.name)
                                                            : "#"}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="truncate text-sm font-medium text-foreground">
                                                            {channel.name}
                                                        </div>
                                                    </div>
                                                    {channel.type === "subject" ? (
                                                        <Badge variant="outline">Предмет</Badge>
                                                    ) : null}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <EmptyState
                                title="Каналів ще немає"
                                description="Коли група отримає стартові канали, вони з'являться тут у двоколонковому layout."
                            />
                        )}
                    </CardContent>
                </Card>

                <Card className="border-border/70">
                    <CardContent className="flex min-h-[420px] flex-col p-0">
                        {activeChannel ? (
                            <>
                                <div className="border-b border-border/70 px-5 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-xl bg-primary/10 p-2 text-primary">
                                            <HashIcon className="size-4" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-foreground">
                                                {activeChannel.name}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
                                    {messages.length ? (
                                        messages.map((item) => (
                                            <div
                                                key={item.id}
                                                className="rounded-2xl border border-border/70 px-4 py-3"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <Avatar className="size-10">
                                                        <AvatarImage
                                                            src={item.user?.avatarPath ?? undefined}
                                                        />
                                                        <AvatarFallback>
                                                            {item.user?.firstName?.[0] ?? "?"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="font-medium text-foreground">
                                                                {item.user
                                                                    ? `${item.user.firstName} ${item.user.lastName ?? ""}`.trim()
                                                                    : "Учасник"}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {formatDateTime(item.createdAt)}
                                                            </span>
                                                        </div>
                                                        <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                                                            {item.content || "Повідомлення без тексту"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <EmptyState
                                            title="Повідомлень ще немає"
                                            description="Напишіть перше повідомлення в активний канал."
                                        />
                                    )}
                                </div>

                                <form
                                    onSubmit={handleSubmit}
                                    className="border-t border-border/70 px-5 py-4"
                                >
                                    <div className="flex gap-3">
                                        <Input
                                            value={message}
                                            onChange={(event) =>
                                                setMessage(event.target.value)
                                            }
                                            className="h-11 rounded-xl"
                                            placeholder="Напишіть повідомлення"
                                        />
                                        <Button
                                            type="submit"
                                            className="h-11 rounded-xl"
                                            disabled={
                                                !message.trim() || createMessage.isPending
                                            }
                                        >
                                            <SendIcon />
                                            Надіслати
                                        </Button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="flex flex-1 items-center justify-center p-6">
                                <EmptyState
                                    title="Канал не вибрано"
                                    description="Оберіть канал ліворуч, щоб переглянути історію та надіслати повідомлення."
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
