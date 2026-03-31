import { type ComponentType } from "react"

export function TimelineRow({
    icon: Icon,
    title,
    subtitle,
}: {
    icon: ComponentType<{ className?: string }>
    title: string
    subtitle: string
}) {
    return (
        <div className="flex items-start gap-3.5 rounded-xl p-3 transition-colors hover:bg-muted/30">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" />
            </div>
            <div className="min-w-0">
                <p className="text-sm font-medium leading-tight">{title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
            </div>
        </div>
    )
}
