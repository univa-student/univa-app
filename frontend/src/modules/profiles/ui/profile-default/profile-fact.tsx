export function ProfileFact({ label, value }: { label: string; value: string }) {
    return (
        <div className="group rounded-xl border border-border/30 bg-muted/10 px-4 py-3 transition-colors hover:bg-muted/20">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">{label}</p>
            <p className="mt-1 truncate text-sm font-medium">{value}</p>
        </div>
    )
}
