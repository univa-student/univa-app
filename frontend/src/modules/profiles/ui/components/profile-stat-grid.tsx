import { type ComponentType } from "react"

export function ProfileStatGrid({
    items,
    cols = 2,
}: {
    items: Array<{ icon: ComponentType<{ className?: string }>; label: string; value: string }>
    cols?: 2 | 4
}) {
    return (
        <div className={`grid gap-3 ${cols === 4 ? "grid-cols-2 xl:grid-cols-4" : "grid-cols-2"}`}>
            {items.map(({ icon: Icon, label, value }) => (
                <div
                    key={label}
                    className="group relative overflow-hidden rounded-xl border border-border/40 bg-muted/20 p-4 transition-colors hover:bg-muted/30"
                >
                    <div className="mb-3 flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-105">
                        <Icon className="size-4" />
                    </div>
                    <p className="text-lg font-semibold leading-none tracking-tight">{value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{label}</p>
                </div>
            ))}
        </div>
    )
}
