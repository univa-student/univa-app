import { Link } from "react-router-dom"
import { ArrowLeftIcon, UserRoundIcon } from "lucide-react"
import { ApiError } from "@/shared/types/api"
import { Button } from "@/shared/shadcn/ui/button"
import { Card, CardContent } from "@/shared/shadcn/ui/card"

export function ProfileErrorState({
    error,
    isForbidden,
}: {
    error: unknown
    isForbidden: boolean
}) {
    const apiError = error instanceof ApiError ? error : null

    return (
        <div className="mx-auto flex min-h-[60vh] w-full max-w-4xl items-center justify-center py-16">
            <Card className="w-full rounded-3xl border-border/50 text-center">
                <CardContent className="space-y-5 p-10">
                    <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted">
                        <UserRoundIcon className="size-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-semibold">
                            {isForbidden ? "Профіль закритий" : "Профіль не знайдено"}
                        </h1>
                        <p className="mx-auto max-w-md text-sm text-muted-foreground">
                            {isForbidden
                                ? (apiError?.body.message || "Користувач обмежив доступ до свого профілю.")
                                : "Можливо, користувач змінив username або такого профілю ще не існує."}
                        </p>
                    </div>
                    <Button asChild variant="outline" className="rounded-full">
                        <Link to="/dashboard/profile">
                            <ArrowLeftIcon className="mr-2 size-4" />
                            Повернутися до мого профілю
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
