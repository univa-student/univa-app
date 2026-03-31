import { type ComponentType } from "react"

export function ProfileInfoRow({
    icon: Icon,
    label,
    value,
}: {
    icon: ComponentType<{ className?: string }>
    label: string
    value: string
}) {
    return (
        <div className="flex items-center gap-3 rounded-2xl bg-muted/30 px-4 py-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-background">
                <Icon className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
                <p className="truncate font-medium">{value}</p>
            </div>
        </div>
    )
}
