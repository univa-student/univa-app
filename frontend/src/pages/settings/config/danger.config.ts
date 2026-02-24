import type { SectionConfig } from "../settings.types"
import { Trash2Icon } from "lucide-react"

export const dangerSection: SectionConfig = {
    title: "Небезпечна зона",
    icon: Trash2Icon,
    description: "Ці дії не можна скасувати",
}

export const dangerActions = [
    {
        id: "deactivate",
        label: "Деактивувати аккаунт",
        description: "Тимчасово приховати профіль, дані збережуться",
        buttonLabel: "Деактивувати",
        variant: "outline" as const,
        destructive: false,
    },
    {
        id: "clearData",
        label: "Видалити всі дані",
        description: "Очистити файли, конспекти та чати, але зберегти аккаунт",
        buttonLabel: "Очистити",
        variant: "outline" as const,
        destructive: true,
    },
    {
        id: "deleteAccount",
        label: "Видалити аккаунт назавжди",
        description: "Усі дані будуть видалені безповоротно",
        buttonLabel: "Видалити",
        variant: "destructive" as const,
        destructive: true,
        highlight: true,
    },
]
