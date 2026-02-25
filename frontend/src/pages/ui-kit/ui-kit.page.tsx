import { Button } from "@/shared/shadcn/ui/button.tsx";
import { useToast } from "@/shared/providers/toast-provider.tsx";
import { themedLogo } from "@/app/config/logo.config";

export function UiKitPage() {
    const { toast, clear } = useToast();

    return (
        <div className="p-10 flex gap-2">
            <header>
                <img
                    src={themedLogo("full-no-bg")}
                    alt="Univa Logo"
                    className="h-10"
                />
            </header>

            <Button
                onClick={() =>
                    toast({
                        variant: "success",
                        title: "Успіх",
                        message: "Збережено ✅"
                    })
                }
            >
                Success
            </Button>

            <Button
                variant="destructive"
                onClick={() =>
                    toast({ variant: "destructive", title: "Помилка", message: "Помилка" })
                }
            >
                Destructive
            </Button>

            <Button
                variant="secondary"
                onClick={() =>
                    toast({ variant: "warning", title: "Увага", message: "Перевір поля" })
                }
            >
                Warning
            </Button>

            <Button variant="destructive" onClick={clear}>
                Clear all
            </Button>
        </div>
    );
}