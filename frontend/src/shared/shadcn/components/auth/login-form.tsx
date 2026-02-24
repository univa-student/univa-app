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

interface LoginFormProps {
    className?: string
    email: string
    password: string
    onEmailChange: (value: string) => void
    onPasswordChange: (value: string) => void
    onSubmit: (e: React.FormEvent) => void
    isPending: boolean
    errors?: Record<string, string>
}

export function LoginForm({
    className,
    email,
    password,
    onEmailChange,
    onPasswordChange,
    onSubmit,
    isPending,
    errors = {},
}: LoginFormProps) {
    return (
        <div className={cn("flex flex-col gap-6 justify-center items-center w-full", className)}>
            <Card className="overflow-hidden p-0 w-96">
                <CardContent className="grid p-0">
                    <form onSubmit={onSubmit} className="p-6 md:p-8">
                        <FieldGroup>
                            <div className="flex flex-col items-center gap-2 text-center">
                                <h1 className="text-2xl font-bold">З поверненням!</h1>
                                <p className="text-muted-foreground text-balance">
                                    Увійдіть до свого акаунту Univa
                                </p>
                            </div>

                            {/* Email */}
                            <Field data-invalid={!!errors.email || undefined}>
                                <FieldLabel htmlFor="login-email">Email</FieldLabel>
                                <Input
                                    id="login-email"
                                    type="email"
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => onEmailChange(e.target.value)}
                                    aria-invalid={!!errors.email}
                                    required
                                />
                                {errors.email && <FieldError>{errors.email}</FieldError>}
                            </Field>

                            {/* Password */}
                            <Field data-invalid={!!errors.password || undefined}>
                                <div className="flex items-center">
                                    <FieldLabel htmlFor="login-password">Пароль</FieldLabel>
                                    <a
                                        href="#"
                                        className="ml-auto text-sm underline-offset-2 hover:underline"
                                    >
                                        Забули пароль?
                                    </a>
                                </div>
                                <Input
                                    id="login-password"
                                    type="password"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => onPasswordChange(e.target.value)}
                                    aria-invalid={!!errors.password}
                                    required
                                />
                                {errors.password && <FieldError>{errors.password}</FieldError>}
                            </Field>

                            {/* Submit */}
                            <Field>
                                <Button type="submit" disabled={isPending} className="w-full">
                                    {isPending ? "Входимо…" : "Увійти"}
                                </Button>
                            </Field>

                            {/* Link to register */}
                            <FieldDescription className="text-center">
                                Немає акаунту?{" "}
                                <Link to="/register">Зареєструватись</Link>
                            </FieldDescription>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
