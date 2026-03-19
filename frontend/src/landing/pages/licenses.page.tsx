import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import type {ReactNode} from "react"
import usePageTitle from "@/shared/hooks/usePageTitle.ts"
import { GOOGLE_FONTS_URL } from "@/app/config/app.config.ts"
import logoConfig from "@/app/config/logo.config.ts"
import { Button } from "@/shared/shadcn/ui/button.tsx"
import {
    ShieldCheckIcon, FileTextIcon, CookieIcon, ScaleIcon, CalendarIcon, MailIcon,
} from "lucide-react"
import { LandingFooter } from "@/landing/components"

const T = {
    bg: "#f5f4f0", card: "#fff", border: "#e4e2dc",
    text: "#0d0d12", muted: "#71717a", accent: "#6d28d9",
    accentSoft: "#ede9fe", dark: "#09090f",
}

// ─── Shared layout ────────────────────────────────────────────────────────────
function LegalLayout({
                         title, subtitle, icon: Icon, iconColor, updated, children,
                     }: {
    title: string; subtitle: string; icon: any; iconColor: string
    updated: string; children: ReactNode
}) {
    return (
        <div style={{ background: T.bg, minHeight: "100vh", color: T.text, fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`
                @import url('${GOOGLE_FONTS_URL}');
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700;9..40,800&family=DM+Serif+Display:ital@0;1&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                .serif { font-family: 'DM Serif Display', serif; }
                .legal-h2 { font-weight: 700; font-size: 18px; color: ${T.text}; margin: 40px 0 12px; letter-spacing: -0.02em; }
                .legal-h3 { font-weight: 600; font-size: 15px; color: ${T.text}; margin: 24px 0 8px; }
                .legal-p { font-size: 14px; line-height: 1.82; color: ${T.muted}; margin-bottom: 14px; }
                .legal-ul { padding-left: 20px; margin-bottom: 14px; }
                .legal-ul li { font-size: 14px; line-height: 1.82; color: ${T.muted}; margin-bottom: 6px; }
                .legal-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
                .legal-table th { text-align: left; padding: 10px 14px; background: ${T.accentSoft}; color: ${T.accent}; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; }
                .legal-table td { padding: 10px 14px; border-bottom: 1px solid ${T.border}; color: ${T.muted}; }
            `}</style>

            {/* Nav */}
            <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(9,9,15,0.96)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex h-16 items-center justify-between px-6" style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <Link to="/"><img src={logoConfig['full-logo-white-no-bg']} alt="Univa" style={{ height: 28 }} /></Link>
                        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)" }} />
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{title}</span>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="text-white/40 hover:text-white hover:bg-white/5">
                        <Link to="/">← Головна</Link>
                    </Button>
                </div>
            </nav>

            {/* Header */}
            <section style={{ padding: "64px 24px 52px", background: T.dark, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 680, margin: "0 auto" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: `${iconColor}18`, border: `1px solid ${iconColor}28`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Icon size={22} style={{ color: iconColor }} />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                            <CalendarIcon size={12} /> Оновлено: {updated}
                        </div>
                    </div>
                    <h1 className="serif" style={{ fontSize: "clamp(32px,4.5vw,52px)", fontWeight: 400, letterSpacing: "-0.02em", color: "#fff", marginBottom: 12 }}>{title}</h1>
                    <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>{subtitle}</p>
                </motion.div>
            </section>

            {/* Content */}
            <div style={{ maxWidth: 680, margin: "0 auto", padding: "56px 24px 100px" }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    {children}
                </motion.div>

                {/* Contact */}
                <div style={{ marginTop: 56, padding: "24px 28px", borderRadius: 16, border: `1px solid ${T.border}`, background: T.card, display: "flex", alignItems: "center", gap: 14 }}>
                    <MailIcon size={18} style={{ color: T.accent, flexShrink: 0 }} />
                    <div>
                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>Запитання щодо цього документу?</div>
                        <a href="mailto:legal@univa.app" style={{ fontSize: 13, color: T.accent, textDecoration: "none" }}>legal@univa.app</a>
                    </div>
                </div>
            </div>

            <LandingFooter />
        </div>
    )
}

// ─── Privacy Policy ───────────────────────────────────────────────────────────
export function PrivacyPage() {
    usePageTitle("Конфіденційність — Univa")
    return (
        <LegalLayout title="Політика конфіденційності" subtitle="Ми серйозно ставимося до захисту твоїх даних. Цей документ пояснює, яку інформацію ми збираємо, як використовуємо та як захищаємо." icon={ShieldCheckIcon} iconColor="#059669" updated="01 березня 2026">
            <h2 className="legal-h2">1. Які дані ми збираємо</h2>
            <p className="legal-p">При реєстрації та використанні Univa ми збираємо наступну інформацію:</p>
            <ul className="legal-ul">
                <li><strong>Дані акаунту:</strong> ім'я, email-адреса, університет, факультет та курс.</li>
                <li><strong>Навчальний контент:</strong> завантажені файли, нотатки, завдання, розклад.</li>
                <li><strong>Дані використання:</strong> дії в застосунку, частота використання функцій, технічні логи.</li>
                <li><strong>Дані пристрою:</strong> тип браузера, операційна система, IP-адреса (анонімізована).</li>
            </ul>

            <h2 className="legal-h2">2. Для чого ми використовуємо дані</h2>
            <p className="legal-p">Зібрані дані використовуються виключно для:</p>
            <ul className="legal-ul">
                <li>Надання та покращення сервісу Univa.</li>
                <li>Персоналізації AI-рекомендацій та нагадувань.</li>
                <li>Технічної підтримки та усунення помилок.</li>
                <li>Надсилання важливих сповіщень (безпека, зміни умов).</li>
            </ul>

            <h2 className="legal-h2">3. Зберігання та безпека</h2>
            <p className="legal-p">Усі дані зберігаються на серверах у Франкфурті (ЄС) з шифруванням AES-256 у стані спокою та TLS 1.3 під час передачі. Ми дотримуємося вимог GDPR.</p>

            <h2 className="legal-h2">4. Передача третім особам</h2>
            <p className="legal-p">Ми <strong>ніколи не продаємо</strong> твої дані. Ми використовуємо обмежений перелік довірених підрядників:</p>
            <ul className="legal-ul">
                <li><strong>Hetzner Cloud</strong> — хостинг серверів (ЄС).</li>
                <li><strong>Anthropic</strong> — обробка AI-запитів (без збереження контенту).</li>
                <li><strong>Postmark</strong> — відправка транзакційних листів.</li>
            </ul>

            <h2 className="legal-h2">5. Твої права (GDPR)</h2>
            <ul className="legal-ul">
                <li>Право на доступ до своїх даних.</li>
                <li>Право на виправлення неточних даних.</li>
                <li>Право на видалення («право на забуття»).</li>
                <li>Право на перенесення даних (експорт у JSON/CSV).</li>
                <li>Право на заперечення проти обробки.</li>
            </ul>
            <p className="legal-p">Для реалізації прав звернись на <a href="mailto:privacy@univa.app" style={{ color: "#6d28d9" }}>privacy@univa.app</a>.</p>

            <h2 className="legal-h2">6. Cookies</h2>
            <p className="legal-p">Ми використовуємо файли cookie для автентифікації та аналітики. Детальніше — у нашій <Link to="/cookies" style={{ color: "#6d28d9" }}>Політиці Cookies</Link>.</p>

            <h2 className="legal-h2">7. Зміни до політики</h2>
            <p className="legal-p">Про суттєві зміни ми повідомимо на email за 30 днів до набуття чинності.</p>
        </LegalLayout>
    )
}

// ─── Terms of Service ─────────────────────────────────────────────────────────
export function TermsPage() {
    usePageTitle("Умови використання — Univa")
    return (
        <LegalLayout title="Умови використання" subtitle="Ці умови регулюють використання платформи Univa. Будь ласка, уважно прочитай перед реєстрацією." icon={FileTextIcon} iconColor="#6d28d9" updated="01 березня 2026">
            <h2 className="legal-h2">1. Прийняття умов</h2>
            <p className="legal-p">Реєструючись або використовуючи Univa, ти погоджуєшся з цими умовами. Якщо ти не погоджуєшся — не використовуй сервіс.</p>

            <h2 className="legal-h2">2. Опис сервісу</h2>
            <p className="legal-p">Univa — цифрова платформа для студентів, що включає організацію навчання, файлове сховище, AI-помічника та групову комунікацію.</p>

            <h2 className="legal-h2">3. Реєстрація та акаунт</h2>
            <ul className="legal-ul">
                <li>Для реєстрації потрібно бути старше 14 років.</li>
                <li>Ти несеш відповідальність за конфіденційність пароля.</li>
                <li>Один акаунт — одна фізична особа. Автоматизована реєстрація заборонена.</li>
            </ul>

            <h2 className="legal-h2">4. Допустиме використання</h2>
            <p className="legal-p">Забороняється:</p>
            <ul className="legal-ul">
                <li>Завантаження контенту, що порушує авторські права.</li>
                <li>Розповсюдження шкідливого програмного забезпечення.</li>
                <li>Використання AI для генерації шкідливого або оманливого контенту.</li>
                <li>Спроби зламати або обійти системи безпеки.</li>
                <li>Комерційне перепродаж доступу до сервісу.</li>
            </ul>

            <h2 className="legal-h2">5. Інтелектуальна власність</h2>
            <p className="legal-p">Контент, який ти завантажуєш або створюєш, залишається твоєю власністю. Ти надаєш Univa обмежену ліцензію на обробку цього контенту для надання сервісу.</p>

            <h2 className="legal-h2">6. Плани та оплата</h2>
            <p className="legal-p">Базовий план безкоштовний. Платні плани (Pro, Team) оплачуються щомісячно або щорічно. Скасування можливе у будь-який момент з діє до кінця оплаченого періоду.</p>

            <h2 className="legal-h2">7. Обмеження відповідальності</h2>
            <p className="legal-p">Univa надається «як є». Ми не гарантуємо безперебійну роботу та не несемо відповідальності за непряму шкоду або втрату даних понад суму, сплачену за останні 3 місяці.</p>

            <h2 className="legal-h2">8. Припинення дії</h2>
            <p className="legal-p">Ми можемо призупинити або видалити акаунт у разі порушення умов. Ти можеш видалити акаунт у будь-який момент через налаштування.</p>
        </LegalLayout>
    )
}

// ─── Cookie Policy ────────────────────────────────────────────────────────────
export function CookiesPage() {
    usePageTitle("Політика Cookies — Univa")
    return (
        <LegalLayout title="Політика Cookies" subtitle="Що таке файли cookie, які ми використовуємо та як ними керувати." icon={CookieIcon} iconColor="#d97706" updated="01 березня 2026">
            <h2 className="legal-h2">1. Що таке cookies</h2>
            <p className="legal-p">Cookies — невеликі текстові файли, які зберігаються у твоєму браузері. Вони допомагають сайту запам'ятовувати твої налаштування та сеанс.</p>

            <h2 className="legal-h2">2. Які cookies ми використовуємо</h2>
            <table className="legal-table">
                <thead>
                <tr>
                    <th>Назва</th>
                    <th>Тип</th>
                    <th>Термін</th>
                    <th>Призначення</th>
                </tr>
                </thead>
                <tbody>
                <tr><td><code>univa_session</code></td><td>Необхідний</td><td>Сесія</td><td>Автентифікація користувача</td></tr>
                <tr><td><code>univa_refresh</code></td><td>Необхідний</td><td>30 днів</td><td>Оновлення токена сесії</td></tr>
                <tr><td><code>univa_prefs</code></td><td>Функціональний</td><td>1 рік</td><td>Мова, тема, налаштування</td></tr>
                <tr><td><code>_analytics</code></td><td>Аналітичний</td><td>90 днів</td><td>Анонімна аналітика (Plausible)</td></tr>
                </tbody>
            </table>

            <h2 className="legal-h2">3. Сторонні cookies</h2>
            <p className="legal-p">Ми використовуємо <strong>Plausible Analytics</strong> — GDPR-сумісний аналітичний інструмент, що не використовує cookies для відстеження між сайтами. Жодних cookie від рекламних мереж.</p>

            <h2 className="legal-h2">4. Управління cookies</h2>
            <p className="legal-p">Ти можеш контролювати cookies через налаштування браузера:</p>
            <ul className="legal-ul">
                <li><strong>Chrome:</strong> Налаштування → Конфіденційність → Cookies</li>
                <li><strong>Firefox:</strong> Налаштування → Конфіденційність і захист</li>
                <li><strong>Safari:</strong> Налаштування → Конфіденційність</li>
            </ul>
            <p className="legal-p">Вимкнення необхідних cookies може порушити роботу автентифікації.</p>

            <h2 className="legal-h2">5. Згода</h2>
            <p className="legal-p">При першому відвідуванні ти побачиш банер з вибором прийняти або відхилити аналітичні cookies. Необхідні cookies не потребують згоди.</p>
        </LegalLayout>
    )
}

// ─── Licenses ─────────────────────────────────────────────────────────────────
export function LicensesPage() {
    usePageTitle("Ліцензії — Univa")
    const libs = [
        { name: "React", version: "18.3", license: "MIT", author: "Meta Platforms" },
        { name: "Vite", version: "5.4", license: "MIT", author: "Evan You" },
        { name: "Framer Motion", version: "11.x", license: "MIT", author: "Framer" },
        { name: "Tailwind CSS", version: "3.4", license: "MIT", author: "Tailwind Labs" },
        { name: "Radix UI", version: "1.x", license: "MIT", author: "WorkOS" },
        { name: "Lucide React", version: "0.4", license: "ISC", author: "Lucide Contributors" },
        { name: "React Router", version: "6.x", license: "MIT", author: "Remix Software" },
        { name: "Zustand", version: "4.x", license: "MIT", author: "pmndrs" },
        { name: "TanStack Query", version: "5.x", license: "MIT", author: "TanStack" },
        { name: "Zod", version: "3.x", license: "MIT", author: "Colin McDonnell" },
        { name: "date-fns", version: "3.x", license: "MIT", author: "date-fns" },
        { name: "clsx", version: "2.x", license: "MIT", author: "Luke Edwards" },
    ]

    return (
        <LegalLayout title="Ліцензії" subtitle="Univa побудований на відкритому програмному забезпеченні. Ми вдячні спільноті open-source." icon={ScaleIcon} iconColor="#0284c7" updated="01 березня 2026">
            <h2 className="legal-h2">Ліцензія Univa</h2>
            <p className="legal-p">Платформа Univa та її вихідний код є власністю Univa Inc. та захищені авторським правом. Несанкціоноване копіювання, модифікація або розповсюдження заборонені.</p>

            <h2 className="legal-h2">Open Source залежності</h2>
            <p className="legal-p" style={{ marginBottom: 20 }}>Univa використовує наступні бібліотеки з відкритим кодом:</p>
            <table className="legal-table">
                <thead>
                <tr>
                    <th>Бібліотека</th>
                    <th>Версія</th>
                    <th>Ліцензія</th>
                    <th>Автор</th>
                </tr>
                </thead>
                <tbody>
                {libs.map(lib => (
                    <tr key={lib.name}>
                        <td><strong>{lib.name}</strong></td>
                        <td><code style={{ fontSize: 12 }}>{lib.version}</code></td>
                        <td><span style={{ padding: "2px 8px", borderRadius: 4, background: "#ede9fe", color: "#6d28d9", fontSize: 11, fontWeight: 600 }}>{lib.license}</span></td>
                        <td>{lib.author}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            <h2 className="legal-h2">MIT License (текст)</h2>
            <div style={{ padding: "16px 20px", borderRadius: 12, background: "#f4f4f5", border: "1px solid #e4e4e7", fontSize: 12, lineHeight: 1.75, color: T.muted, fontFamily: "monospace" }}>
                Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files, to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
            </div>
        </LegalLayout>
    )
}