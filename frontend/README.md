# Univa: React-структура + Laravel API + WebSocket

Ціль: мати чисту, масштабовану архітектуру для React-клієнта, який працює з Laravel API (REST) і WebSocket (реалтайм для чатів/спейсів/нотіфікацій).

---

## 1) Дерево папок

```text
src/
├─ app/
│  ├─ index.tsx
│  ├─ router/
│  │  ├─ router.tsx
│  │  └─ loaders.ts
│  ├─ providers/
│  │  ├─ query-provider.tsx
│  │  ├─ auth-provider.tsx
│  │  ├─ ws-provider.tsx
│  │  └─ theme-provider.tsx
│  ├─ store/
│  │  └─ index.ts
│  └─ config/
│     ├─ env.ts
│     ├─ constants.ts
│     └─ feature-flags.ts
│
├─ pages/
│  ├─ auth/
│  ├─ dashboard/
│  ├─ schedule/
│  ├─ deadlines/
│  ├─ files/
│  ├─ spaces/
│  ├─ chat/
│  └─ settings/
│
├─ widgets/
│  ├─ app-shell/
│  ├─ week-overview/
│  ├─ files-browser/
│  ├─ chat-panel/
│  └─ notifications-center/
│
├─ features/
│  ├─ auth/
│  │  ├─ sign-in/
│  │  ├─ sign-out/
│  │  └─ session-refresh/
│  ├─ schedule/
│  │  ├─ create-lesson/
│  │  ├─ edit-lesson/
│  │  └─ import-schedule/
│  ├─ deadlines/
│  │  ├─ create-task/
│  │  ├─ prioritize-task/
│  │  └─ reminders/
│  ├─ files/
│  │  ├─ upload-file/
│  │  ├─ share-file/
│  │  ├─ preview-file/
│  │  └─ search-in-files/
│  ├─ spaces/
│  │  ├─ create-space/
│  │  ├─ join-space/
│  │  ├─ roles-and-permissions/
│  │  └─ pinned-messages/
│  └─ chat/
│     ├─ send-message/
│     ├─ switch-model/
│     ├─ attach-file-context/
│     └─ message-actions/
│
├─ entities/
│  ├─ user/
│  │  ├─ model/
│  │  ├─ api/
│  │  └─ ui/
│  ├─ lesson/
│  ├─ task/
│  ├─ file/
│  ├─ space/
│  ├─ message/
│  ├─ notification/
│  └─ llm-model/
│
├─ shared/
│  ├─ api/
│  │  ├─ http.ts                 # REST-клієнт
│  │  ├─ endpoints.ts            # /api/... routes
│  │  ├─ errors.ts               # мапінг помилок
│  │  ├─ query-client.ts         # TanStack Query
│  │  └─ dto/                    # спільні DTO (якщо треба)
│  ├─ realtime/
│  │  ├─ ws-client.ts            # WebSocket клієнт (ядро)
│  │  ├─ channels.ts             # назви каналів + helpers
│  │  └─ events.ts               # назви подій + type map
│  ├─ ui/
│  ├─ lib/
│  ├─ hooks/
│  ├─ types/
│  └─ styles/
│
├─ processes/
│  ├─ auth-guard/
│  ├─ ws-connection/             # 1 конекшн, reconnection, heartbeats
│  └─ sync/                      # синк даних/кешу при realtime подіях
│
└─ tests/
   ├─ unit/
   └─ e2e/
````

---

## 2) Де зв’язок з Laravel API (REST)

### 2.1 shared/api — “інфраструктура”

Тут все, що спільне для всіх REST-запитів:

* `shared/api/http.ts` — клієнт (fetch/axios), baseURL, токен, refresh, інтерцептори
* `shared/api/endpoints.ts` — константи маршрутів: `/api/auth/login`, `/api/files`, ...
* `shared/api/errors.ts` — уніфіковані помилки (422, 401, 403, 500)
* `shared/api/query-client.ts` — TanStack Query (кеш, retry, staleTime)

### 2.2 entities/*/api — “контракти сутностей”

Кожна сутність має свої запити й DTO:

* `entities/file/api/` — list/upload/delete/share/search
* `entities/task/api/` — list/create/update/prioritize
* `entities/message/api/` — load history, send message (якщо не через WS)
* `entities/space/api/` — list/join/members/roles

> Правило: якщо це CRUD/дані сутності — класти в `entities/<name>/api`.

### 2.3 features/*/api — “запити під флоу”

Якщо запит — це фіча, а не одна сутність (наприклад, “attach-file-context” для AI), тоді:

* `features/chat/attach-file-context/api/` — ендпоінт, який віддає “контекст для LLM”

---

## 3) Де WebSocket і як він прив’язаний до фіч

### 3.1 shared/realtime — “ядро реалтайму”

* `shared/realtime/ws-client.ts` — один клієнт, connect/disconnect, reconnection
* `shared/realtime/channels.ts` — формування назв каналів (по spaceId, userId, subjectId)
* `shared/realtime/events.ts` — перелік подій (`message.created`, `file.uploaded`, ...)

### 3.2 processes/ws-connection — “керування життєвим циклом”

Тут логіка:

* підключення після логіну
* перепідключення
* оновлення токена/підписів
* heartbeat/ping (якщо потрібно)

### 3.3 Як realtime оновлює UI

Потік такий:

1. приходить WS подія (наприклад `message.created`)
2. `ws-client` пробросив її в handler
3. handler оновлює кеш TanStack Query (або Zustand slice)
4. UI сам перерендерився

Це найчистіший спосіб: **realtime → оновлення кешу → UI**.

---

## 4) Рекомендовані канали/події для Univa

### Канали

* `private-user.{userId}` — нотифікації, персональні івенти
* `private-space.{spaceId}` — групові чати/події в спейсі
* `private-file.{fileId}` — прогрес обробки/індексації (опціонально)

### Події

* `message.created`
* `message.updated` (редагування)
* `message.deleted`
* `file.uploaded`
* `file.indexed` (після індексації для пошуку по тексту)
* `task.created`
* `task.updated`
* `schedule.updated`
* `notification.created`

---

## 5) Де тримати інтеграцію саме під Laravel

### 5.1 Auth (Sanctum/JWT)

* REST логін/рефреш: `features/auth/*`
* зберігання токена/сесії: `entities/user/model` або `app/store`
* підхват токена:

    * REST: `shared/api/http.ts`
    * WS: `shared/realtime/ws-client.ts` (передача токена в handshake/headers/params)

### 5.2 Помилки Laravel (422 validation)

* парсинг `errors` об’єкта — в `shared/api/errors.ts`
* показ у формах — у `features/*/ui`

---

## 6) Мінімальний “must-have” набір файлів під API + WS

* `shared/api/http.ts`
* `shared/api/query-client.ts`
* `shared/api/errors.ts`
* `shared/realtime/ws-client.ts`
* `app/providers/ws-provider.tsx`
* `processes/ws-connection/*`
* `entities/message/api/*`
* `entities/space/api/*`

---

## 7) Правила імпортів (коротко)

* `shared` → всюди
* `entities` → можна в `features/widgets/pages`
* `features` → можна в `widgets/pages`
* `widgets` → можна в `pages`
* `pages` → нікого “нижче” не імпортують (тільки збирають)
