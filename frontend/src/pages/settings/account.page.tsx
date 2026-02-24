import { motion } from "framer-motion"
import usePageTitle from "@/shared/hooks/usePageTitle"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/shared/shadcn/ui/card"
import { Input } from "@/shared/shadcn/ui/input"
import { Button } from "@/shared/shadcn/ui/button"
import { Separator } from "@/shared/shadcn/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/shadcn/ui/avatar"
import { Badge } from "@/shared/shadcn/ui/badge"
import {
    CameraIcon,
    ShieldCheckIcon,
    KeyRoundIcon,
    Trash2Icon,
    MailIcon,
    UserIcon,
    GraduationCapIcon,
    CalendarIcon,
} from "lucide-react"

// ── Mock data ───────────────────────────────────────────────
const user = {
    name: "Анастасія",
    surname: "Коваленко",
    email: "anastasia.kovalenko@univa.edu",
    avatar: "/avatars/default.jpg",
    university: "Київський національний університет",
    faculty: "Факультет інформатики",
    course: 3,
    joinedAt: "2024-09-01",
}

// ── Animations ──────────────────────────────────────────────
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.05 },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
}

// ── Component ───────────────────────────────────────────────
export function AccountPage() {
    usePageTitle("Аккаунт", { suffix: true })

    return (
        <motion.div
            className="flex flex-col gap-6 max-w-3xl"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* ─── Header ─── */}
            <motion.div variants={itemVariants}>
                <h1 className="text-2xl font-bold tracking-tight">Аккаунт</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Керуй своїм профілем та налаштуваннями безпеки
                </p>
            </motion.div>

            {/* ─── Avatar + name ─── */}
            <motion.div variants={itemVariants}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Профіль</CardTitle>
                        <CardDescription>
                            Основна інформація, яку бачать інші користувачі
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-6">
                        {/* Avatar row */}
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback className="text-xl font-semibold">
                                        {user.name[0]}{user.surname[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <button className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <CameraIcon className="size-5 text-white" />
                                </button>
                            </div>
                            <div>
                                <p className="font-medium">{user.name} {user.surname}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                <Badge variant="secondary" className="mt-1.5">
                                    <GraduationCapIcon className="size-3 mr-1" />
                                    {user.course} курс
                                </Badge>
                            </div>
                        </div>

                        <Separator />

                        {/* Form fields */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium flex items-center gap-1.5">
                                    <UserIcon className="size-3.5 text-muted-foreground" />
                                    Ім'я
                                </label>
                                <Input defaultValue={user.name} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium flex items-center gap-1.5">
                                    <UserIcon className="size-3.5 text-muted-foreground" />
                                    Прізвище
                                </label>
                                <Input defaultValue={user.surname} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium flex items-center gap-1.5">
                                    <MailIcon className="size-3.5 text-muted-foreground" />
                                    Email
                                </label>
                                <Input defaultValue={user.email} type="email" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium flex items-center gap-1.5">
                                    <GraduationCapIcon className="size-3.5 text-muted-foreground" />
                                    Університет
                                </label>
                                <Input defaultValue={user.university} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium flex items-center gap-1.5">
                                    <GraduationCapIcon className="size-3.5 text-muted-foreground" />
                                    Факультет
                                </label>
                                <Input defaultValue={user.faculty} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium flex items-center gap-1.5">
                                    <CalendarIcon className="size-3.5 text-muted-foreground" />
                                    Курс
                                </label>
                                <Input defaultValue={String(user.course)} type="number" min={1} max={6} />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button>Зберегти зміни</Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* ─── Security ─── */}
            <motion.div variants={itemVariants}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ShieldCheckIcon className="size-5 text-primary" />
                            Безпека
                        </CardTitle>
                        <CardDescription>
                            Пароль та двофакторна аутентифікація
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center gap-3">
                                <div className="flex size-9 items-center justify-center rounded-md bg-secondary">
                                    <KeyRoundIcon className="size-4 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Пароль</p>
                                    <p className="text-xs text-muted-foreground">
                                        Останнє оновлення: 3 місяці тому
                                    </p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm">
                                Змінити
                            </Button>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center gap-3">
                                <div className="flex size-9 items-center justify-center rounded-md bg-secondary">
                                    <ShieldCheckIcon className="size-4 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Двофакторна аутентифікація</p>
                                    <p className="text-xs text-muted-foreground">
                                        Додатковий захист аккаунту
                                    </p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm">
                                Увімкнути
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* ─── Danger zone ─── */}
            <motion.div variants={itemVariants}>
                <Card className="border-destructive/30">
                    <CardHeader>
                        <CardTitle className="text-lg text-destructive flex items-center gap-2">
                            <Trash2Icon className="size-5" />
                            Небезпечна зона
                        </CardTitle>
                        <CardDescription>
                            Ці дії не можна скасувати
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Видалити аккаунт</p>
                                <p className="text-xs text-muted-foreground">
                                    Усі дані будуть видалені назавжди
                                </p>
                            </div>
                            <Button variant="destructive" size="sm">
                                Видалити
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    )
}
