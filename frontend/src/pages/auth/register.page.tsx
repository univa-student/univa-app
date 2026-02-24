import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignUp } from "@/features/auth/sign-up/use-sign-up";
import { ApiError } from "@/shared/types/api";
import { useToast } from "@/shared/providers/toast-provider";
import usePageTitle from "@/shared/hooks/usePageTitle";

import { OrbitHero } from "@/shared/ui/animations/orbit-hero.animations";
import { RegisterForm, type RegisterFormData } from "@/shared/shadcn/components/auth/register-form";
import logoConfig from "@/app/config/logo.config";

export function RegisterPage() {
    usePageTitle("Реєстрація");

    const nav = useNavigate();
    const { mutateAsync, isPending } = useSignUp();
    const { toast } = useToast();

    const [form, setForm] = useState<RegisterFormData>({
        first_name: "",
        last_name: "",
        middle_name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    function onFieldChange(field: keyof RegisterFormData, value: string) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrors({});

        try {
            await mutateAsync(form);
            toast({ variant: "success", message: "Акаунт створено! Ласкаво просимо." });
            nav("/dashboard", { replace: true });
        } catch (err) {
            if (err instanceof ApiError) {
                if (err.isValidation && err.body.errors) {
                    const fieldErrors: Record<string, string> = {};
                    for (const [key, msgs] of Object.entries(err.body.errors)) {
                        fieldErrors[key] = msgs[0];
                    }
                    setErrors(fieldErrors);
                } else {
                    toast({ variant: "destructive", message: err.body.message });
                }
            } else {
                toast({ variant: "destructive", message: "Щось пішло не так. Спробуйте пізніше." });
            }
        }
    }

    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-center">
                    <a href="#" className="flex items-center gap-2 font-medium">
                        <div className="flex w-full h-16 items-center">
                            <img src={logoConfig['full-logo-black-no-bg']} alt="" className="w-48" />
                        </div>
                    </a>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full">
                        <RegisterForm
                            form={form}
                            onFieldChange={onFieldChange}
                            onSubmit={onSubmit}
                            isPending={isPending}
                            errors={errors}
                        />
                    </div>
                </div>
            </div>
            <div className="bg-muted relative hidden lg:flex items-center justify-center">
                <OrbitHero size={500} />
            </div>
        </div>
    );
}
