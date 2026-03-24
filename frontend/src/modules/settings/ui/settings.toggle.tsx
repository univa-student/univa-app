export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
    return (
        <button
            role="switch"
            aria-checked={checked}
            aria-label={label}
            onClick={() => onChange(!checked)}
            className={[
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors",
                checked ? "bg-primary" : "bg-input",
            ].join(" ")}
        >
            <span
                className={[
                    "pointer-events-none block size-3.5 rounded-full bg-white shadow-sm transition-transform",
                    checked ? "translate-x-[18px]" : "translate-x-[3px]",
                ].join(" ")}
            />
        </button>
    )
}
