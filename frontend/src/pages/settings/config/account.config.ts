import type { SectionConfig } from "../settings.types"
import { UserIcon, GraduationCapIcon } from "lucide-react"

export const profileSection: SectionConfig = {
    title: "Особисті дані",
    icon: UserIcon,
}

export const educationSection: SectionConfig = {
    title: "Навчання",
    icon: GraduationCapIcon,
}

export const profileFields = [
    { id: "name", label: "Ім'я", placeholder: "Олександр" },
    { id: "surname", label: "Прізвище", placeholder: "Шевченко" },
    { id: "email", label: "Email", placeholder: "student@university.edu", type: "email" as const },
]

export const educationFields = [
    { id: "university", label: "Університет", placeholder: "Національний університет..." },
    { id: "faculty", label: "Факультет", placeholder: "Факультет інформатики" },
    { id: "course", label: "Курс", placeholder: "3", type: "number" as const },
]
