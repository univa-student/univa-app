import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Hash, Lock, Mail, User } from "lucide-react";

import { cn } from "@/shared/shadcn/lib/utils";
import { Button } from "@/shared/shadcn/ui/button";
import { Card, CardContent } from "@/shared/shadcn/ui/card";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/shared/shadcn/ui/field";
import { Input } from "@/shared/shadcn/ui/input";

/** ===== Types ===== */

export interface RegisterFormData {
    // Персональні
    last_name: string;
    first_name: string;
    middle_name: string;

    // Акаунт
    username: string;
    email: string;

    // Безпека
    password: string;
    password_confirmation: string;

    // Згоди
    agree_terms: boolean;
    marketing_opt_in: boolean;
}

type RegisterFieldName = keyof RegisterFormData;
type FieldType = "text" | "email" | "password" | "checkbox";
type SectionName =
    | "Персональні дані"
    | "Дані акаунта"
    | "Безпека"
    | "Підтвердження";

interface RegisterFormProps {
    className?: string;
    form: RegisterFormData;
    onFieldChange: (
        field: RegisterFieldName,
        value: RegisterFormData[RegisterFieldName]
    ) => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void | Promise<void>;
    isPending: boolean;
    errors?: Record<string, string>;
}

type FieldDef = {
    section: SectionName;
    name: RegisterFieldName;
    label: string;
    type: FieldType;
    placeholder?: string;
    autoComplete?: string;
    required?: boolean;
    icon?: ReactNode;
    colSpan?: 1 | 2;
    helper?: string;
};

/** ===== Helpers ===== */

function passwordScore(password: string): number {
    let score = 0;

    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/\p{Lu}/u.test(password)) score += 1;
    if (/\p{Ll}/u.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^\p{L}\p{N}]/u.test(password)) score += 1;

    return Math.min(score, 5);
}

function scoreLabel(score: number): string {
    if (score <= 1) return "Слабкий";
    if (score === 2) return "Нормальний";
    if (score === 3) return "Добрий";
    return "Сильний";
}

/** ===== Fields config ===== */

const FIELDS: FieldDef[] = [
    {
        section: "Персональні дані",
        name: "last_name",
        label: "Прізвище",
        type: "text",
        placeholder: "Шевченко",
        autoComplete: "family-name",
        required: true,
        icon: <User className="h-4 w-4" />,
        colSpan: 1,
    },
    {
        section: "Персональні дані",
        name: "first_name",
        label: "Ім’я",
        type: "text",
        placeholder: "Тарас",
        autoComplete: "given-name",
        required: true,
        icon: <User className="h-4 w-4" />,
        colSpan: 1,
    },
    {
        section: "Персональні дані",
        name: "middle_name",
        label: "По батькові",
        type: "text",
        placeholder: "Григорович",
        autoComplete: "additional-name",
        required: false,
        icon: <User className="h-4 w-4" />,
        colSpan: 2,
    },
    {
        section: "Дані акаунта",
        name: "username",
        label: "Нік (логін)",
        type: "text",
        placeholder: "univa_user",
        autoComplete: "username",
        required: true,
        icon: <Hash className="h-4 w-4" />,
        colSpan: 1,
        helper: "Лише для входу та профілю.",
    },
    {
        section: "Дані акаунта",
        name: "email",
        label: "Email",
        type: "email",
        placeholder: "you@example.com",
        autoComplete: "email",
        required: true,
        icon: <Mail className="h-4 w-4" />,
        colSpan: 1,
    },
    {
        section: "Безпека",
        name: "password",
        label: "Пароль",
        type: "password",
        placeholder: "••••••••",
        autoComplete: "new-password",
        required: true,
        icon: <Lock className="h-4 w-4" />,
        colSpan: 1,
        helper: "8+ символів, краще з цифрами та спеціальними знаками.",
    },
    {
        section: "Безпека",
        name: "password_confirmation",
        label: "Підтвердіть пароль",
        type: "password",
        placeholder: "••••••••",
        autoComplete: "new-password",
        required: true,
        icon: <Lock className="h-4 w-4" />,
        colSpan: 1,
    },
    {
        section: "Підтвердження",
        name: "agree_terms",
        label: "Погоджуюсь з умовами та політикою приватності",
        type: "checkbox",
        required: true,
        colSpan: 2,
    },
    {
        section: "Підтвердження",
        name: "marketing_opt_in",
        label: "Отримувати новини та оновлення (опційно)",
        type: "checkbox",
        required: false,
        colSpan: 2,
    },
];

const SECTIONS: SectionName[] = [
    "Персональні дані",
    "Дані акаунта",
    "Безпека",
    "Підтвердження",
];

/** ===== Component ===== */

export function RegisterForm({
    className,
    form,
    onFieldChange,
    onSubmit,
    isPending,
    errors = {},
}: RegisterFormProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const passScore = useMemo(() => passwordScore(form.password), [form.password]);
    const passText = useMemo(() => scoreLabel(passScore), [passScore]);

    const sectionFields = useMemo(() => {
        return SECTIONS.reduce<Record<SectionName, FieldDef[]>>(
            (acc, section) => {
                acc[section] = FIELDS.filter((field) => field.section === section);
                return acc;
            },
            {
                "Персональні дані": [],
                "Дані акаунта": [],
                "Безпека": [],
                "Підтвердження": [],
            }
        );
    }, []);

    const renderField = (field: FieldDef) => {
        const error = errors[String(field.name)];
        const invalid = Boolean(error);

        if (field.type === "checkbox") {
            const checked = Boolean(form[field.name]);

            return (
                <Field
                    key={String(field.name)}
                    data-invalid={invalid || undefined}
                    className={cn(field.colSpan === 2 && "md:col-span-2")}
                >
                    <label className="flex cursor-pointer select-none items-start gap-3">
                        <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 rounded border-muted-foreground/30"
                            checked={checked}
                            onChange={(e) => onFieldChange(field.name, e.target.checked)}
                            required={Boolean(field.required)}
                            aria-invalid={invalid}
                        />
                        <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium leading-snug">
                                {field.label}
                            </span>
                            {error && <FieldError className="text-xs">{error}</FieldError>}
                        </div>
                    </label>
                </Field>
            );
        }

        const isPassword = field.type === "password";
        const isConfirmPassword = field.name === "password_confirmation";
        const isVisible = isPassword
            ? isConfirmPassword
                ? showConfirmPassword
                : showPassword
            : false;

        return (
            <Field
                key={String(field.name)}
                data-invalid={invalid || undefined}
                className={cn(field.colSpan === 2 && "md:col-span-2")}
            >
                <FieldLabel
                    htmlFor={`reg-${String(field.name)}`}
                    className="text-sm font-medium"
                >
                    {field.label}
                    {!field.required && " (опційно)"}
                </FieldLabel>

                <div className="relative">
                    {field.icon && (
                        <div className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2">
                            {field.icon}
                        </div>
                    )}

                    <Input
                        id={`reg-${String(field.name)}`}
                        type={isPassword && isVisible ? "text" : field.type}
                        placeholder={field.placeholder}
                        autoComplete={field.autoComplete}
                        value={String(form[field.name] ?? "")}
                        onChange={(e) => onFieldChange(field.name, e.target.value)}
                        aria-invalid={invalid}
                        required={Boolean(field.required)}
                        className={cn(
                            "h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20",
                            isPassword ? "pl-10 pr-10" : "pl-10",
                            invalid && "border-destructive focus:ring-destructive/20"
                        )}
                    />

                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => {
                                if (isConfirmPassword) {
                                    setShowConfirmPassword((prev) => !prev);
                                } else {
                                    setShowPassword((prev) => !prev);
                                }
                            }}
                            className="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                            aria-label={isVisible ? "Сховати пароль" : "Показати пароль"}
                        >
                            {isVisible ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    )}
                </div>

                {field.name === "password" && (
                    <FieldDescription className="text-xs">
                        Сила пароля: <span className="font-medium">{passText}</span>
                    </FieldDescription>
                )}

                {field.helper && field.name !== "password" && (
                    <FieldDescription className="text-xs">{field.helper}</FieldDescription>
                )}

                {error && <FieldError className="mt-1 text-xs">{error}</FieldError>}
            </Field>
        );
    };

    return (
        <div className={cn("flex w-full flex-col items-center justify-center gap-6", className)}>
            <Card className="w-full overflow-hidden border-0 bg-gradient-to-br from-background via-background to-muted/20 p-0 shadow-xl">
                <CardContent className="grid p-0">
                    <form onSubmit={onSubmit} className="p-8 md:p-10">
                        <FieldGroup>
                            <div className="mb-4 flex flex-col items-center gap-3 text-center">
                                <h1 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-3xl font-bold text-transparent">
                                    Створити акаунт
                                </h1>
                                <p className="text-muted-foreground text-balance text-sm">
                                    Приєднуйтесь до Univa
                                </p>
                            </div>

                            {SECTIONS.map((section) => {
                                const fields = sectionFields[section];

                                return (
                                    <div key={section} className="mt-4">
                                        <div className="mb-3 flex items-center gap-2">
                                            <div className="h-px flex-1 bg-border/60" />
                                            <h2 className="text-muted-foreground text-xs font-semibold tracking-wide">
                                                {section}
                                            </h2>
                                            <div className="h-px flex-1 bg-border/60" />
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            {fields.map(renderField)}
                                        </div>
                                    </div>
                                );
                            })}

                            <div className="mt-5">
                                <Button
                                    type="submit"
                                    disabled={isPending}
                                    className="h-11 w-full bg-gradient-to-r from-primary to-primary/90 text-base font-medium shadow-lg transition-all duration-200 hover:from-primary/90 hover:to-primary hover:shadow-xl"
                                >
                                    {isPending ? (
                                        <span className="flex items-center gap-2">
                                            <svg
                                                className="h-4 w-4 animate-spin"
                                                viewBox="0 0 24 24"
                                                aria-hidden="true"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                    fill="none"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                />
                                            </svg>
                                            Реєструємо…
                                        </span>
                                    ) : (
                                        "Зареєструватись"
                                    )}
                                </Button>
                            </div>

                            <FieldDescription className="mt-3 text-center text-sm">
                                Вже є акаунт?{" "}
                                <Link
                                    to="/login"
                                    className="text-primary font-medium underline-offset-2 transition-colors hover:underline"
                                >
                                    Увійти
                                </Link>
                            </FieldDescription>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
