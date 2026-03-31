
export function ProfileSectionCard({
    title,
    description,
    children,
    noPadding = false,
}: {
    title?: string
    description?: string
    children: React.ReactNode
    noPadding?: boolean
}) {
    return (
        <div className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm">
            {(title || description) && (
                <div className="border-b border-border/30 px-5 py-4">
                    {title && (
                        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
                    )}
                    {description && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
                    )}
                </div>
            )}
            <div className={noPadding ? "" : "p-5"}>{children}</div>
        </div>
    )
}
