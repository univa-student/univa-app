import { Link } from "react-router-dom"
import { Button } from "@/shared/shadcn/ui/button"

export function EmptyEducationState({ isOwnProfile }: { isOwnProfile: boolean }) {
    return (
        <div className="rounded-xl border border-dashed border-border/50 bg-muted/10 px-6 py-10 text-center">
            <div className="mx-auto mb-3 size-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground/50">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5"
                >
                    <path d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
            </div>
            <p className="text-sm font-medium text-foreground/60">
                {isOwnProfile
                    ? "Освітній профіль не заповнений"
                    : "Навчальна інформація відсутня"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
                {isOwnProfile
                    ? "Додайте університет, групу та курс."
                    : "Користувач не вказав дані про навчання."}
            </p>
            {isOwnProfile && (
                <Button asChild variant="outline" size="sm" className="mt-4 rounded-xl text-xs">
                    <Link to="/dashboard/settings?tab=profile">Заповнити зараз</Link>
                </Button>
            )}
        </div>
    )
}
