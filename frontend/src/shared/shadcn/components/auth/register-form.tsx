import { cn } from "@/shared/shadcn/lib/utils"
import { Button } from "@/shared/shadcn/ui/button"
import { Card, CardContent } from "@/shared/shadcn/ui/card"
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/shared/shadcn/ui/field"
import { Input } from "@/shared/shadcn/ui/input"
import { Link } from "react-router-dom"
import type React from "react"

export interface RegisterFormData {
    first_name: string
    last_name: string
    middle_name: string
    email: string
    password: string
    password_confirmation: string
}

interface RegisterFormProps {
    className?: string
    form: RegisterFormData
    onFieldChange: (field: keyof RegisterFormData, value: string) => void
    onSubmit: (e: React.FormEvent) => void
    isPending: boolean
    errors?: Record<string, string>
}

const FIELDS: {
    name: keyof RegisterFormData
    label: string
    type: string
    placeholder: string
    autoComplete: string
    required: boolean
}[] = [
        { name: "last_name", label: "Прізвище", type: "text", placeholder: "Шевченко", autoComplete: "family-name", required: true },
        { name: "first_name", label: "Ім'я", type: "text", placeholder: "Тарас", autoComplete: "given-name", required: true },
        { name: "middle_name", label: "По-батькові", type: "text", placeholder: "Григорович", autoComplete: "additional-name", required: false },
        { name: "email", label: "Email", type: "email", placeholder: "you@example.com", autoComplete: "email", required: true },
        { name: "password", label: "Пароль", type: "password", placeholder: "••••••••", autoComplete: "new-password", required: true },
        { name: "password_confirmation", label: "Підтвердіть пароль", type: "password", placeholder: "••••••••", autoComplete: "new-password", required: true },
    ]

export function RegisterForm({
    className,
    form,
    onFieldChange,
    onSubmit,
    isPending,
    errors = {},
}: RegisterFormProps) {
    return (
        <div className={cn("flex flex-col gap-6 justify-center items-center w-full", className)}>
            <Card className="overflow-hidden p-0 w-96">
                <CardContent className="grid p-0">
                    <form onSubmit={onSubmit} className="p-6 md:p-8">
                        <FieldGroup>
                            <div className="flex flex-col items-center gap-2 text-center">
                                <h1 className="text-2xl font-bold">Створити акаунт</h1>
                                <p className="text-muted-foreground text-balance">
                                    Зареєструйтесь в Univa
                                </p>
                            </div>

                            {FIELDS.map((f) => (
                                <Field key={f.name} data-invalid={!!errors[f.name] || undefined}>
                                    <FieldLabel htmlFor={`reg-${f.name}`}>{f.label}</FieldLabel>
                                    <Input
                                        id={`reg-${f.name}`}
                                        type={f.type}
                                        placeholder={f.placeholder}
                                        autoComplete={f.autoComplete}
                                        value={form[f.name]}
                                        onChange={(e) => onFieldChange(f.name, e.target.value)}
                                        aria-invalid={!!errors[f.name]}
                                        required={f.required}
                                    />
                                    {errors[f.name] && <FieldError>{errors[f.name]}</FieldError>}
                                </Field>
                            ))}

                            {/* Submit */}
                            <Field>
                                <Button type="submit" disabled={isPending} className="w-full">
                                    {isPending ? "Реєструємо…" : "Зареєструватись"}
                                </Button>
                            </Field>

                            {/* Link to login */}
                            <FieldDescription className="text-center">
                                Вже є акаунт?{" "}
                                <Link to="/login">Увійти</Link>
                            </FieldDescription>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
