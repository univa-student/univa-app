import { type ComponentType } from "react"

export function FeatureCard({
    icon: Icon,
    title,
    text,
    accent = false,
}: {
    icon: ComponentType<{ className?: string }>
    title: string
    text: string
    accent?: boolean
}) {
    return (
        <div
            className={`group relative overflow-hidden rounded-xl border p-5 transition-all hover:shadow-md ${
                accent
                    ? "border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5"
                    : "border-border/40 bg-muted/10 hover:bg-muted/20"
            }`}
        >
            <div
                className={`mb-3.5 flex size-9 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${
                    accent ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"
                }`}
            >
                <Icon className="size-4.5" />
            </div>
            <p className="text-sm font-semibold leading-tight">{title}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{text}</p>
        </div>
    )
}
