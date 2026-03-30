import { useState } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
    ActivityIcon,
    AlertCircleIcon,
    CheckCircle2Icon,
    EyeIcon,
    EyeOffIcon,
    KeyIcon,
    LoaderCircleIcon,
    LogOutIcon,
    MonitorIcon,
    ShieldIcon,
    SmartphoneIcon,
} from "lucide-react";
import { useChangePassword, useRevokeSession, useSessions } from "@/modules/auth/api/hooks";
import type { AuthSession } from "@/modules/auth/model/types";
import type { TabDef } from "@/modules/settings/model/settings.types";
import { TabShell } from "@/modules/settings/ui/settings.renderers";
import { itemAnim } from "@/modules/settings/ui/settings.animations";
import { Alert, AlertDescription } from "@/shared/shadcn/ui/alert";
import { Badge } from "@/shared/shadcn/ui/badge";
import { Button } from "@/shared/shadcn/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/shadcn/ui/card";
import { Input } from "@/shared/shadcn/ui/input";
import { Separator } from "@/shared/shadcn/ui/separator";

const passwordSection = { title: "Пароль", icon: KeyIcon };
const twoFASection = {
    title: "Двофакторна автентифікація",
    icon: ShieldIcon,
    description: "Додатковий рівень захисту для вашого акаунту",
};
const sessionsSection = {
    title: "Поточні сесії",
    icon: ActivityIcon,
    description: "Пристрої, що мають доступ до вашого акаунту прямо зараз",
};

function PasswordInput({
    value,
    onChange,
    placeholder,
    id,
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    id?: string;
}) {
    const [show, setShow] = useState(false);

    return (
        <div className="relative">
            <Input
                id={id}
                type={show ? "text" : "password"}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className="pr-10"
            />
            <button
                type="button"
                onClick={() => setShow((state) => !state)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                tabIndex={-1}
            >
                {show ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
            </button>
        </div>
    );
}

function getSessionIcon(userAgent: string | null): LucideIcon {
    const normalized = userAgent?.toLowerCase() ?? "";

    return /(iphone|ipad|android|mobile)/.test(normalized)
        ? SmartphoneIcon
        : MonitorIcon;
}

function getDeviceLabel(userAgent: string | null): string {
    const normalized = userAgent?.toLowerCase() ?? "";

    if (normalized.includes("iphone")) return "iPhone";
    if (normalized.includes("ipad")) return "iPad";
    if (normalized.includes("android")) return "Android";
    if (normalized.includes("windows")) return "Windows";
    if (normalized.includes("macintosh") || normalized.includes("mac os x")) return "Mac";
    if (normalized.includes("linux")) return "Linux";

    return "Невідомий пристрій";
}

function getPlatformLabel(userAgent: string | null): string {
    const normalized = userAgent?.toLowerCase() ?? "";

    if (normalized.includes("iphone") || normalized.includes("ipad")) return "iOS";
    if (normalized.includes("android")) return "Android";
    if (normalized.includes("windows")) return "Windows";
    if (normalized.includes("macintosh") || normalized.includes("mac os x")) return "macOS";
    if (normalized.includes("linux")) return "Linux";

    return "Невідома платформа";
}

function getBrowserLabel(userAgent: string | null): string {
    const normalized = userAgent?.toLowerCase() ?? "";

    if (normalized.includes("edg/")) return "Microsoft Edge";
    if (normalized.includes("opr/") || normalized.includes("opera")) return "Opera";
    if (normalized.includes("chrome/") && !normalized.includes("edg/")) return "Google Chrome";
    if (normalized.includes("firefox/")) return "Mozilla Firefox";
    if (normalized.includes("safari/") && !normalized.includes("chrome/")) return "Safari";

    return "Невідомий браузер";
}

function formatLastActiveAt(value: string | null): string {
    if (!value) {
        return "Немає даних про активність";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Немає даних про активність";
    }

    return new Intl.DateTimeFormat("uk-UA", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

function buildSessionMeta(session: AuthSession) {
    const ipLabel = session.ipAddress ? `IP: ${session.ipAddress}` : null;
    const activityLabel = `Активність: ${formatLastActiveAt(session.lastActiveAt)}`;

    return {
        icon: getSessionIcon(session.userAgent),
        title: getDeviceLabel(session.userAgent),
        description: `${getBrowserLabel(session.userAgent)} • ${getPlatformLabel(session.userAgent)}`,
        details: [ipLabel, activityLabel].filter(Boolean).join(" • "),
    };
}

function getErrorMessage(error: unknown, fallback: string): string {
    if (error && typeof error === "object" && "body" in error) {
        const body = (error as { body?: { message?: string } }).body;
        if (body?.message) {
            return body.message;
        }
    }

    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallback;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function SecurityTab(_: { tab: TabDef }) {
    const changePassword = useChangePassword();
    const sessionsQuery = useSessions();
    const revokeSession = useRevokeSession();

    const [currentPass, setCurrentPass] = useState("");
    const [newPass, setNewPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [clientError, setClientError] = useState<string | null>(null);
    const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);

    const handleChangePassword = () => {
        setClientError(null);
        changePassword.reset();

        if (!currentPass || !newPass || !confirmPass) {
            setClientError("Заповніть усі поля паролю.");
            return;
        }

        if (newPass.length < 8) {
            setClientError("Новий пароль має бути не менше 8 символів.");
            return;
        }

        if (newPass !== confirmPass) {
            setClientError("Паролі не збігаються.");
            return;
        }

        changePassword.mutate(
            {
                currentPassword: currentPass,
                password: newPass,
                password_confirmation: confirmPass,
            },
            {
                onSuccess: () => {
                    setCurrentPass("");
                    setNewPass("");
                    setConfirmPass("");
                },
            },
        );
    };

    const handleRevokeSession = (sessionId: string) => {
        setPendingSessionId(sessionId);

        revokeSession.mutate(sessionId, {
            onSettled: () => {
                setPendingSessionId(null);
            },
        });
    };

    const sessions = [...(sessionsQuery.data ?? [])].sort((left, right) => {
        const currentPriority = Number(right.current) - Number(left.current);
        if (currentPriority !== 0) {
            return currentPriority;
        }

        const leftTime = left.lastActiveAt ? new Date(left.lastActiveAt).getTime() : 0;
        const rightTime = right.lastActiveAt ? new Date(right.lastActiveAt).getTime() : 0;

        return rightTime - leftTime;
    });

    const isPasswordLoading = changePassword.isPending;
    const isPasswordSuccess = changePassword.isSuccess;
    const passwordError = clientError
        ?? (changePassword.isError
            ? getErrorMessage(changePassword.error, "Не вдалося змінити пароль.")
            : null);
    const sessionsError = sessionsQuery.isError
        ? getErrorMessage(sessionsQuery.error, "Не вдалося завантажити активні сесії.")
        : null;

    return (
        <TabShell showSave={false}>
            <motion.div variants={itemAnim}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <passwordSection.icon className="size-5 text-primary" />
                            {passwordSection.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div>
                            <label htmlFor="current_pass" className="mb-1.5 block text-sm font-medium">
                                Поточний пароль
                            </label>
                            <PasswordInput
                                id="current_pass"
                                value={currentPass}
                                onChange={setCurrentPass}
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <label htmlFor="new_pass" className="mb-1.5 block text-sm font-medium">
                                Новий пароль
                            </label>
                            <PasswordInput
                                id="new_pass"
                                value={newPass}
                                onChange={setNewPass}
                                placeholder="Мінімум 8 символів"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirm_pass" className="mb-1.5 block text-sm font-medium">
                                Підтвердження пароля
                            </label>
                            <PasswordInput
                                id="confirm_pass"
                                value={confirmPass}
                                onChange={setConfirmPass}
                                placeholder="Повторіть новий пароль"
                            />
                        </div>

                        {isPasswordSuccess && (
                            <Alert variant="default" className="border-green-500/30 bg-green-500/5">
                                <CheckCircle2Icon className="size-4 text-green-500" />
                                <AlertDescription className="text-green-600">
                                    Пароль успішно змінено.
                                </AlertDescription>
                            </Alert>
                        )}

                        {passwordError && (
                            <Alert variant="destructive">
                                <AlertCircleIcon className="size-4" />
                                <AlertDescription>{passwordError}</AlertDescription>
                            </Alert>
                        )}

                        <div className="flex justify-end">
                            <Button onClick={handleChangePassword} disabled={isPasswordLoading}>
                                {isPasswordLoading && (
                                    <LoaderCircleIcon className="mr-2 size-4 animate-spin" />
                                )}
                                Змінити пароль
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div variants={itemAnim}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <twoFASection.icon className="size-5 text-primary" />
                            {twoFASection.title}
                        </CardTitle>
                        <CardDescription>{twoFASection.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                            <div>
                                <p className="text-sm font-medium">Статус: вимкнено</p>
                                <p className="text-xs text-muted-foreground">
                                    Рекомендуємо увімкнути для додаткового захисту акаунту
                                </p>
                            </div>
                            <Button variant="outline" size="sm">
                                Налаштувати
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div variants={itemAnim}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <sessionsSection.icon className="size-5 text-primary" />
                            {sessionsSection.title}
                        </CardTitle>
                        <CardDescription>{sessionsSection.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        {sessionsQuery.isLoading && (
                            <div className="flex items-center gap-2 rounded-lg bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
                                <LoaderCircleIcon className="size-4 animate-spin" />
                                Завантажуємо список активних сесій...
                            </div>
                        )}

                        {sessionsError && (
                            <Alert variant="destructive">
                                <AlertCircleIcon className="size-4" />
                                <AlertDescription>{sessionsError}</AlertDescription>
                            </Alert>
                        )}

                        {!sessionsQuery.isLoading && !sessionsError && sessions.length === 0 && (
                            <div className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
                                Активних сесій не знайдено.
                            </div>
                        )}

                        {!sessionsQuery.isLoading && !sessionsError && sessions.map((session, index) => {
                            const meta = buildSessionMeta(session);
                            const SessionIcon = meta.icon;
                            const isRevoking = revokeSession.isPending && pendingSessionId === session.id;

                            return (
                                <div key={session.id}>
                                    {index > 0 && <Separator className="mb-3" />}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3">
                                            <SessionIcon className="mt-0.5 size-5 text-muted-foreground" />
                                            <div className="space-y-1">
                                                <p className="flex items-center gap-2 text-sm font-medium">
                                                    {meta.title}
                                                    {session.current && (
                                                        <Badge variant="secondary" className="text-[9px] uppercase">
                                                            Поточна
                                                        </Badge>
                                                    )}
                                                </p>
                                                <p className="text-xs text-muted-foreground">{meta.description}</p>
                                                <p className="text-xs text-muted-foreground">{meta.details}</p>
                                            </div>
                                        </div>

                                        {!session.current && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRevokeSession(session.id)}
                                                disabled={isRevoking}
                                            >
                                                {isRevoking ? (
                                                    <LoaderCircleIcon className="mr-1 size-3.5 animate-spin" />
                                                ) : (
                                                    <LogOutIcon className="mr-1 size-3.5" />
                                                )}
                                                Завершити
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            </motion.div>
        </TabShell>
    );
}
