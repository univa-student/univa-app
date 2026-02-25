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
import { Eye, EyeOff, Mail, Lock, X } from "lucide-react"
import type React from "react"
import { useMemo, useState } from "react"

interface LoginFormProps {
    className?: string
    email: string
    password: string
    remember?: boolean
    onEmailChange: (value: string) => void
    onPasswordChange: (value: string) => void
    onRememberChange?: (value: boolean) => void
    onSubmit: (e: React.FormEvent) => void
    isPending: boolean
    errors?: Record<string, string>
}

export function LoginForm({
                              className,
                              email,
                              password,
                              remember = true,
                              onEmailChange,
                              onPasswordChange,
                              onRememberChange,
                              onSubmit,
                              isPending,
                              errors = {},
                          }: LoginFormProps) {
    const [showPassword, setShowPassword] = useState(false)

    const emailError = errors.email
    const passwordError = errors.password
    const generalError = errors.general || errors.message

    const canSubmit = useMemo(() => {
        const e = email.trim()
        const p = password.trim()
        return e.length > 0 && p.length > 0 && !isPending
    }, [email, password, isPending])

    return (
        <div className={cn("flex flex-col gap-6 justify-center items-center w-full", className)}>
            <Card className="overflow-hidden p-0 w-full max-w-md shadow-xl border-0 bg-gradient-to-br from-background via-background to-muted/20">
                <CardContent className="grid p-0">
                    <form onSubmit={onSubmit} className="p-8 md:p-10">
                        <FieldGroup>
                            <div className="flex flex-col items-center gap-3 text-center">
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                    З поверненням!
                                </h1>
                                <p className="text-muted-foreground text-balance text-sm">
                                    Увійдіть до свого акаунту Univa
                                </p>
                            </div>

                            {/* General error */}
                            {generalError && (
                                <div className="mt-2 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                                    {generalError}
                                </div>
                            )}

                            {/* Email */}
                            <Field data-invalid={!!emailError || undefined} className="mt-2">
                                <FieldLabel htmlFor="login-email" className="text-sm font-medium">
                                    Email адреса
                                </FieldLabel>

                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="login-email"
                                        type="email"
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        value={email}
                                        onChange={(e) => onEmailChange(e.target.value)}
                                        aria-invalid={!!emailError}
                                        className={cn(
                                            "pl-10 pr-10 h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20",
                                            emailError && "border-destructive focus:ring-destructive/20"
                                        )}
                                        required
                                    />

                                    {!!email && (
                                        <button
                                            type="button"
                                            onClick={() => onEmailChange("")}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            aria-label="Очистити email"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                {emailError && <FieldError className="text-xs mt-1">{emailError}</FieldError>}
                            </Field>

                            {/* Password */}
                            <Field data-invalid={!!passwordError || undefined}>
                                <div className="flex items-center justify-between gap-3">
                                    <FieldLabel htmlFor="login-password" className="text-sm font-medium">
                                        Пароль
                                    </FieldLabel>
                                    <Link
                                        to="/forgot-password"
                                        className="text-xs text-primary hover:underline underline-offset-2 transition-colors whitespace-nowrap"
                                    >
                                        Забули пароль?
                                    </Link>
                                </div>

                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="login-password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(e) => onPasswordChange(e.target.value)}
                                        aria-invalid={!!passwordError}
                                        className={cn(
                                            "pl-10 pr-10 h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20",
                                            passwordError && "border-destructive focus:ring-destructive/20"
                                        )}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        aria-label={showPassword ? "Сховати пароль" : "Показати пароль"}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>

                                {passwordError && <FieldError className="text-xs mt-1">{passwordError}</FieldError>}
                            </Field>

                            {/* Remember me + helper */}
                            <div className="flex items-center justify-between gap-4 pt-1">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-muted-foreground/30"
                                        checked={remember}
                                        onChange={(e) => onRememberChange?.(e.target.checked)}
                                    />
                                    <span className="text-sm text-muted-foreground">Запам’ятати мене</span>
                                </label>
                            </div>

                            {/* Submit */}
                            <Field className="pt-2">
                                <Button
                                    type="submit"
                                    disabled={!canSubmit}
                                    className={cn(
                                        "w-full h-11 text-base font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200",
                                        !canSubmit && "opacity-60 cursor-not-allowed hover:shadow-lg"
                                    )}
                                >
                                    {isPending ? (
                                        <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Входимо…
                    </span>
                                    ) : "Увійти"}
                                </Button>
                            </Field>

                            {/* Link to register */}
                            <FieldDescription className="text-center text-sm">
                                Немає акаунту?{" "}
                                <Link
                                    to="/register"
                                    className="font-medium text-primary hover:underline underline-offset-2 transition-colors"
                                >
                                    Зареєструватись
                                </Link>
                            </FieldDescription>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}