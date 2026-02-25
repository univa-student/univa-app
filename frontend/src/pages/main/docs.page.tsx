import { useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import usePageTitle from "@/shared/hooks/usePageTitle"
import { GOOGLE_FONTS_URL } from "@/app/config/app.config.ts"
import logoConfig from "@/app/config/logo.config"
import { Button } from "@/shared/shadcn/ui/button"
import {
    CodeIcon,
    RocketIcon,
    PlugIcon,
    HelpCircleIcon,
    SearchIcon,
    ChevronRightIcon,
} from "lucide-react"

const T = {
    bg: "#fafbfc",
    card: "#ffffff",
    text: "#111827",
    muted: "#6b7280",
    border: "#e5e7eb",
    accent: "#7c3aed",
    accentLight: "#ede9fe",
    gradient: "linear-gradient(135deg,#7c3aed,#6366f1,#3b82f6)",
    dark: "#0a0a0f",
    darkCard: "#141419",
    darkBorder: "#1f1f2e",
    darkMuted: "#71717a",
}

const sidebarSections = [
    {
        title: "Початок роботи",
        icon: RocketIcon,
        items: [
            { id: "quickstart", label: "Швидкий старт" },
            { id: "installation", label: "Встановлення" },
            { id: "first-steps", label: "Перші кроки" },
        ],
    },
    {
        title: "API",
        icon: CodeIcon,
        items: [
            { id: "api-auth", label: "Автентифікація" },
            { id: "api-users", label: "Користувачі" },
            { id: "api-projects", label: "Проєкти" },
            { id: "api-files", label: "Файли" },
        ],
    },
    {
        title: "Інтеграції",
        icon: PlugIcon,
        items: [
            { id: "google-calendar", label: "Google Calendar" },
            { id: "telegram", label: "Telegram Bot" },
            { id: "webhooks", label: "Webhooks" },
        ],
    },
    {
        title: "FAQ",
        icon: HelpCircleIcon,
        items: [
            { id: "faq-general", label: "Загальне" },
            { id: "faq-billing", label: "Оплата" },
            { id: "faq-security", label: "Безпека" },
        ],
    },
]

const docsContent: Record<string, { title: string; content: string; code?: string }> = {
    quickstart: {
        title: "Швидкий старт",
        content: `Ласкаво просимо до Univa! Цей розділ допоможе вам почати роботу за кілька хвилин.

Univa — це єдина платформа для студентів, що об'єднує розклад, файли, чати та AI-помічника. Щоб почати:

1. **Створіть аккаунт** — зареєструйтесь через email або Google
2. **Оберіть університет** — знайдіть свій навчальний заклад у списку
3. **Імпортуйте розклад** — автоматично або вручну додайте свої пари
4. **Запросіть одногрупників** — створіть спільний простір для групи

Після реєстрації ви отримаєте доступ до всіх базових функцій безкоштовно.`,
        code: `// Приклад підключення до API
const univa = new UnivaSDK({
  apiKey: "your-api-key",
  university: "knu-shevchenko"
});

// Отримати розклад
const schedule = await univa.schedule.get({
  week: "current"
});

console.log(schedule.lessons);`,
    },
    installation: {
        title: "Встановлення",
        content: `Univa доступний як веб-додаток та мобільний додаток. Ви можете використовувати його у будь-якому браузері.

### Веб-додаток
Просто відкрийте [univa.app](/) у браузері. Підтримуються Chrome, Firefox, Safari та Edge.

### Мобільний додаток
Мобільний додаток доступний для iOS та Android. Завантажте з App Store або Google Play.

### Desktop додаток
Для Windows, macOS та Linux доступний desktop-клієнт на базі Electron.`,
    },
    "first-steps": {
        title: "Перші кроки",
        content: `Після реєстрації рекомендуємо виконати ці кроки:

### 1. Налаштуйте профіль
Вкажіть ваш факультет, курс та спеціальність. Це допоможе AI-помічнику краще розуміти ваш контекст.

### 2. Додайте розклад
Імпортуйте розклад з файлу або створіть вручну. Система автоматично створить нагадування.

### 3. Завантажте матеріали
Завантажте конспекти, підручники та презентації. Вони автоматично категоризуються по предметах.

### 4. Створіть групу
Запросіть одногрупників для спільної роботи та обміну матеріалами.`,
    },
    "api-auth": {
        title: "API: Автентифікація",
        content: `Для доступу до API Univa необхідно пройти автентифікацію. Ми підтримуємо два методи:

### Bearer Token
Використовуйте токен доступу в заголовку Authorization.

### OAuth 2.0
Для інтеграцій рекомендуємо використовувати OAuth 2.0 flow.`,
        code: `// Автентифікація з Bearer Token
const response = await fetch("/api/v1/me", {
  headers: {
    "Authorization": "Bearer YOUR_ACCESS_TOKEN",
    "Content-Type": "application/json"
  }
});

// OAuth 2.0
const authUrl = \`https://univa.app/oauth/authorize?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=YOUR_REDIRECT_URI&
  response_type=code\`;`,
    },
    "api-users": {
        title: "API: Користувачі",
        content: `Ендпоінти для роботи з користувачами.

### GET /api/v1/users/me
Повертає інформацію про поточного користувача.

### PATCH /api/v1/users/me
Оновлює профіль поточного користувача.

### GET /api/v1/users/:id
Повертає публічну інформацію про користувача за ID.`,
        code: `// Отримати поточного користувача
const me = await univa.users.me();

// Оновити профіль
await univa.users.update({
  displayName: "Олена",
  faculty: "Кібернетика"
});`,
    },
    "api-projects": {
        title: "API: Проєкти",
        content: `Проєкти — це основна одиниця організації у Univa. Кожен проєкт може містити файли, завдання та учасників.

### GET /api/v1/projects
Список проєктів користувача.

### POST /api/v1/projects
Створити новий проєкт.

### GET /api/v1/projects/:id
Деталі проєкту.`,
    },
    "api-files": {
        title: "API: Файли",
        content: `Управління файлами в Univa. Підтримуються PDF, DOCX, PPTX, зображення та інші формати.

### POST /api/v1/files/upload
Завантажити файл.

### GET /api/v1/files
Список файлів з фільтрацією.

### DELETE /api/v1/files/:id
Видалити файл.`,
    },
    "google-calendar": {
        title: "Google Calendar",
        content: `Інтеграція з Google Calendar дозволяє синхронізувати ваш розклад з календарем Google.

### Налаштування
1. Перейдіть в Налаштування → Інтеграції
2. Натисніть "Підключити Google Calendar"
3. Дозвольте доступ до вашого календаря
4. Оберіть календар для синхронізації

Після підключення всі пари та дедлайни з'являться у вашому Google Calendar автоматично.`,
    },
    telegram: {
        title: "Telegram Bot",
        content: `Telegram-бот Univa дозволяє отримувати нагадування та швидко переглядати розклад прямо в месенджері.

### Команди бота
- \`/schedule\` — розклад на сьогодні
- \`/deadlines\` — найближчі дедлайни
- \`/remind\` — створити нагадування
- \`/files\` — останні файли`,
    },
    webhooks: {
        title: "Webhooks",
        content: `Webhooks дозволяють вашим додаткам отримувати повідомлення про події в Univa у реальному часі.

### Підтримувані події
- \`schedule.updated\` — оновлення розкладу
- \`deadline.approaching\` — наближення дедлайну
- \`file.uploaded\` — новий файл завантажено
- \`message.received\` — нове повідомлення`,
        code: `// Webhook payload
{
  "event": "deadline.approaching",
  "data": {
    "subject": "Математичний аналіз",
    "title": "Контрольна робота №3",
    "deadline": "2026-03-01T10:00:00Z",
    "remainingHours": 24
  }
}`,
    },
    "faq-general": {
        title: "FAQ: Загальне",
        content: `### Що таке Univa?
Univa — це єдина платформа для студентів, що об'єднує розклад, файли, конспекти, чати та AI-помічника.

### Чи безкоштовний Univa?
Так, базовий план безкоштовний і включає всі основні функції. Для додаткових можливостей є Pro та Team плани.

### Які університети підтримуються?
Наразі ми підтримуємо 50+ університетів України. Список постійно розширюється.

### Чи можу я використовувати Univa на мобільному?
Так, Univa доступний як мобільний додаток для iOS та Android, а також працює як PWA у мобільному браузері.`,
    },
    "faq-billing": {
        title: "FAQ: Оплата",
        content: `### Які способи оплати підтримуються?
Ми підтримуємо оплату карткою Visa/Mastercard, Apple Pay, Google Pay.

### Чи є знижки для студентів?
Звичайно! Усі верифіковані студенти отримують 50% знижку на Pro план.

### Як скасувати підписку?
Перейдіть в Налаштування → Підписка → Скасувати. Ваш план залишиться активним до кінця оплаченого періоду.`,
    },
    "faq-security": {
        title: "FAQ: Безпека",
        content: `### Де зберігаються мої дані?
Всі дані зберігаються в дата-центрах ЄС з повним дотриманням GDPR.

### Чи шифруються мої файли?
Так, ми використовуємо наскрізне шифрування AES-256 для всіх файлів.

### Хто має доступ до моїх даних?
Тільки ви та люди, яким ви надали доступ. Команда Univa не має доступу до ваших персональних даних та файлів.`,
    },
}

export function DocsPage() {
    usePageTitle("Документація — Univa")
    const [activeDoc, setActiveDoc] = useState("quickstart")
    const [search, setSearch] = useState("")

    const doc = docsContent[activeDoc]

    const filteredSections = sidebarSections.map(section => ({
        ...section,
        items: section.items.filter(item =>
            item.label.toLowerCase().includes(search.toLowerCase()) ||
            docsContent[item.id]?.title.toLowerCase().includes(search.toLowerCase())
        ),
    })).filter(section => section.items.length > 0)

    return (
        <div style={{ background: T.bg, minHeight: "100vh", color: T.text }}>
            <style>{`@import url('${GOOGLE_FONTS_URL}');`}</style>

            {/* Header */}
            <nav style={{
                position: "sticky", top: 0, zIndex: 50,
                background: "rgba(10, 10, 15, 0.92)",
                backdropFilter: "blur(24px)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
                <div className="flex h-16 items-center justify-between px-6 max-w-[1600px] mx-auto">
                    <div className="flex items-center gap-6">
                        <Link to="/" style={{ textDecoration: "none" }}>
                            <img src={logoConfig["full-logo-black-no-bg"]} alt="Univa" style={{ height: 32 }} />
                        </Link>
                        <div style={{
                            width: 1, height: 24, background: "rgba(255,255,255,0.1)",
                        }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>
                            Документація
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" asChild className="text-white/60 hover:text-white hover:bg-white/5">
                            <Link to="/">← На головну</Link>
                        </Button>
                    </div>
                </div>
            </nav>

            <div className="flex max-w-[1600px] mx-auto" style={{ minHeight: "calc(100vh - 64px)" }}>
                {/* Sidebar */}
                <aside style={{
                    width: 280, flexShrink: 0, borderRight: `1px solid ${T.border}`,
                    padding: "24px 0", overflowY: "auto",
                    position: "sticky", top: 64, height: "calc(100vh - 64px)",
                }} className="hidden md:block">
                    {/* Search */}
                    <div style={{ padding: "0 20px", marginBottom: 24 }}>
                        <div style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "8px 12px", borderRadius: 10,
                            border: `1px solid ${T.border}`,
                            background: T.card,
                        }}>
                            <SearchIcon size={14} style={{ color: T.muted }} />
                            <input
                                type="text"
                                placeholder="Пошук..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{
                                    border: "none", outline: "none", background: "transparent",
                                    fontSize: 13, color: T.text, width: "100%",
                                }}
                            />
                        </div>
                    </div>

                    {filteredSections.map(section => (
                        <div key={section.title} style={{ marginBottom: 24 }}>
                            <div style={{
                                display: "flex", alignItems: "center", gap: 8,
                                padding: "0 20px", marginBottom: 8,
                                fontSize: 11, fontWeight: 700, color: T.muted,
                                letterSpacing: "0.06em", textTransform: "uppercase",
                            }}>
                                <section.icon size={13} />
                                {section.title}
                            </div>
                            {section.items.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveDoc(item.id)}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 6,
                                        width: "100%", padding: "7px 20px 7px 36px",
                                        fontSize: 13, cursor: "pointer",
                                        fontWeight: activeDoc === item.id ? 600 : 400,
                                        color: activeDoc === item.id ? T.accent : T.muted,
                                        background: activeDoc === item.id ? T.accentLight : "transparent",
                                        border: "none", borderRadius: 0, textAlign: "left",
                                        transition: "all 0.15s",
                                        borderLeft: activeDoc === item.id ? `2px solid ${T.accent}` : "2px solid transparent",
                                    }}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    ))}
                </aside>

                {/* Content */}
                <main style={{ flex: 1, padding: "48px 56px", maxWidth: 800 }}>
                    <motion.div
                        key={activeDoc}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Breadcrumb */}
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 24, fontSize: 12, color: T.muted }}>
                            <Link to="/docs" style={{ color: T.muted, textDecoration: "none" }}>Docs</Link>
                            <ChevronRightIcon size={12} />
                            <span style={{ color: T.text }}>{doc?.title}</span>
                        </div>

                        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 24 }}>
                            {doc?.title}
                        </h1>

                        <div style={{
                            fontSize: 15, lineHeight: 1.8, color: T.muted,
                            whiteSpace: "pre-line",
                        }}>
                            {doc?.content.split("\n").map((line, i) => {
                                if (line.startsWith("### ")) {
                                    return <h3 key={i} style={{ fontWeight: 700, fontSize: 18, color: T.text, marginTop: 28, marginBottom: 8 }}>{line.replace("### ", "")}</h3>
                                }
                                if (line.startsWith("## ")) {
                                    return <h2 key={i} style={{ fontWeight: 800, fontSize: 22, color: T.text, marginTop: 32, marginBottom: 12 }}>{line.replace("## ", "")}</h2>
                                }
                                if (line.startsWith("- ")) {
                                    return <div key={i} style={{ paddingLeft: 16, position: "relative" }}>
                                        <span style={{ position: "absolute", left: 0 }}>•</span>
                                        {line.replace("- ", "")}
                                    </div>
                                }
                                if (line.match(/^\d+\. /)) {
                                    return <div key={i} style={{ paddingLeft: 4 }}>{line}</div>
                                }
                                return <p key={i} style={{ marginBottom: 8 }}>{line}</p>
                            })}
                        </div>

                        {doc?.code && (
                            <div style={{
                                marginTop: 28, borderRadius: 14,
                                background: T.dark,
                                border: `1px solid ${T.darkBorder}`,
                                overflow: "hidden",
                            }}>
                                <div style={{
                                    padding: "10px 16px",
                                    borderBottom: `1px solid ${T.darkBorder}`,
                                    display: "flex", alignItems: "center", gap: 6,
                                    background: "rgba(255,255,255,0.02)",
                                }}>
                                    <div style={{ width: 8, height: 8, borderRadius: 4, background: "#ef4444" }} />
                                    <div style={{ width: 8, height: 8, borderRadius: 4, background: "#f59e0b" }} />
                                    <div style={{ width: 8, height: 8, borderRadius: 4, background: "#22c55e" }} />
                                    <span style={{ marginLeft: 8, fontSize: 11, color: T.darkMuted }}>JavaScript</span>
                                </div>
                                <pre style={{
                                    padding: "20px 24px", margin: 0,
                                    fontSize: 13, lineHeight: 1.65, color: "#e2e8f0",
                                    overflowX: "auto", fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                }}>
                                    {doc.code}
                                </pre>
                            </div>
                        )}
                    </motion.div>
                </main>
            </div>
        </div>
    )
}
