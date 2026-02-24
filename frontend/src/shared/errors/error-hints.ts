export type ErrorHint = {
    id: string;
    title: string;
    description: string;
    tags?: string[];
};

export type HintRule = {
    id: string;
    when: (ctx: {
        title: string;
        message: string;
        status?: number | null;
        kind: "route" | "runtime" | "unknown";
        topFile?: string;
    }) => boolean;
    hint: ErrorHint;
};

export const HINT_RULES: HintRule[] = [
    {
        id: "not-defined",
        when: ({ message }) => /is not defined/i.test(message),
        hint: {
            id: "not-defined",
            title: "Змінна або компонент не імпортовані",
            description:
                "Знайди назву з помилки у файлі та додай правильний імпорт. Для іконок зазвичай використовують lucide-react.",
            tags: ["imports", "runtime"],
        },
    },
    {
        id: "cannot-read-props",
        when: ({ message }) => /cannot read propert/i.test(message),
        hint: {
            id: "cannot-read-props",
            title: "Доступ до властивості undefined/null",
            description:
                "Використай optional chaining: `obj?.field` або перевір, що дані завантажились перед рендером. Часто причина — відсутній fallback у loader.",
            tags: ["runtime", "nullish"],
        },
    },
    {
        id: "objects-not-valid",
        when: ({ message }) => /objects are not valid as a react child/i.test(message),
        hint: {
            id: "objects-not-valid",
            title: "Об'єкт переданий напряму в JSX",
            description:
                "Не можна рендерити `{object}` — потрібно `{object.field}` або `{JSON.stringify(object)}`. Перевір що саме передається в дочірні елементи.",
            tags: ["runtime", "jsx"],
        },
    },
    {
        id: "module-not-found",
        when: ({ message }) => /cannot find module|failed to resolve import/i.test(message),
        hint: {
            id: "module-not-found",
            title: "Не знаходить модуль або імпорт",
            description:
                "Перевір alias @ (tsconfig + vite.config) і шляхи. Переконайся що файл реально існує та має правильний експорт.",
            tags: ["imports", "alias"],
        },
    },
    {
        id: "laravel-422",
        when: ({ status }) => status === 422,
        hint: {
            id: "laravel-422",
            title: "Laravel валідація (422)",
            description:
                "Подивись у вкладці Laravel → errors. Виведи помилки у форму по полях і не ховай body відповіді.",
            tags: ["laravel", "validation"],
        },
    },
    {
        id: "laravel-401",
        when: ({ status }) => status === 401,
        hint: {
            id: "laravel-401",
            title: "401 Unauthorized",
            description:
                "Перевір токен/сесію: Authorization header у shared/api/http.ts, логіку root loader та refresh токена.",
            tags: ["laravel", "auth"],
        },
    },
    {
        id: "laravel-403",
        when: ({ status }) => status === 403,
        hint: {
            id: "laravel-403",
            title: "403 Forbidden",
            description:
                "Користувач авторизований, але немає доступу. Перевір Policy/Gate у Laravel або роль користувача.",
            tags: ["laravel", "auth"],
        },
    },
    {
        id: "laravel-500",
        when: ({ status }) => status === 500,
        hint: {
            id: "laravel-500",
            title: "Laravel серверна помилка (500)",
            description:
                "Відкрий вкладку Laravel — там буде exception, file і trace. Також перевір storage/logs/laravel.log на сервері.",
            tags: ["laravel", "server"],
        },
    },
    {
        id: "route-loader",
        when: ({ kind, status }) => kind === "route" && !status,
        hint: {
            id: "route-loader",
            title: "Помилка в loader або action маршруту",
            description:
                "Перевір запити до API в loader/action: редіректи, обробку помилок, та що loader повертає валідні дані.",
            tags: ["router", "loader"],
        },
    },
];

export function pickHints(ctx: Parameters<HintRule["when"]>[0], limit = 3) {
    const matched = HINT_RULES.filter((r) => r.when(ctx)).map((r) => r.hint);
    if (matched.length === 0) {
        return [
            {
                id: "generic",
                title: "Почни з top-frame у вкладці Код",
                description:
                    "Відкрий файл/рядок з секції «Код», перевір імпорти, props і доступ до undefined. Далі — Network та Console у DevTools.",
                tags: ["generic"],
            },
        ];
    }
    return matched.slice(0, limit);
}