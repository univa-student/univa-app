import { Skeleton } from "@/shared/shadcn/ui/skeleton"

export function ProfilePageSkeleton() {
    return (
        <div className="mx-auto w-full max-w-7xl space-y-6 py-10">
            <Skeleton className="h-24 w-full rounded-3xl" />
            <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
                <Skeleton className="h-[520px] w-full rounded-3xl" />
                <Skeleton className="h-[520px] w-full rounded-3xl" />
            </div>
        </div>
    )
}
