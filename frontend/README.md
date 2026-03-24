# Frontend Architecture (Modular Approach)

Цей проєкт використовує **модульну (domain-driven) архітектуру**, яка оптимізована під швидку розробку, масштабування та читабельність коду.

## Структура проєкту

```text
src/
├─ app/          # глобальна ініціалізація
├─ modules/      # бізнес-домени (core логіка)
├─ pages/        # роутові сторінки
├─ shared/       # перевикористовувані ресурси
└─ tests/
```

---

## Опис шарів

### `app/`

Глобальна конфігурація та ініціалізація:

```text
app/
├─ index.tsx
├─ router.tsx
├─ providers/
├─ store/
└─ config/
```

Тут:

* роутинг
* провайдери (auth, query, websocket, theme)
* глобальний store
* env/config

---

### `modules/`

Основний шар — **вся бізнес-логіка тут**

```text
modules/
├─ auth/
├─ schedule/
├─ deadlines/
├─ files/
├─ spaces/
├─ chat/
└─ notifications/
```

---

### Приклад модуля

```text
modules/files/
├─ api/
│  ├─ files.api.ts
│  └─ files.queries.ts
├─ model/
│  ├─ types.ts
│  ├─ store.ts
│  └─ mappers.ts
├─ ui/
│  ├─ files-browser.tsx
│  ├─ file-card.tsx
│  └─ upload-dialog.tsx
├─ hooks/
│  ├─ use-files.ts
│  └─ use-upload-file.ts
├─ lib/
│  └─ format-file-size.ts
└─ index.ts
```

Важливо:

* весь код, пов’язаний з файлами — в одному місці
* мінімум “перекидувань” між шарами

---

### `pages/`

Роутові сторінки (тонкий шар)

```text
pages/
├─ dashboard/
├─ files/
├─ chat/
└─ settings/
```

Сторінка:

* збирає UI
* викликає модулі
* не містить бізнес-логіки

---

### `shared/`

Перевикористовуваний код

```text
shared/
├─ api/          # HTTP клієнт, query client
├─ ui/           # базові компоненти (Button, Input)
├─ lib/          # утиліти
├─ hooks/        # загальні хуки
├─ types/        # глобальні типи
├─ realtime/     # WebSocket ядро
└─ styles/
```

---

## ⚖Правила архітектури

### 1. Домен перш за все

Якщо код стосується конкретної фічі → він у `modules/<domain>`

Не:

```text
shared/ui/file-card
```

Так:

```text
modules/files/ui/file-card
```
---

### 2. Shared — тільки реально спільне

В `shared/` йде лише те, що:

* використовується в ≥2 модулях
* не має прив’язки до домену

---

### 3. Сторінки не містять логіку

Погано:

```tsx
// pages/files
useEffect(() => fetchFiles())
```

Добре:

```tsx
// modules/files/hooks/use-files.ts
```

---

## Робота з realtime

```text
shared/realtime/
```

* WebSocket клієнт
* канали
* події

А обробка:
в конкретних модулях (`modules/chat`, `modules/notifications`)

---

## Масштабування

Коли модуль росте:

```text
modules/chat/
├─ api/
├─ model/
├─ ui/
├─ message/
├─ attachments/
├─ realtime/
└─ model-switching/
```

масштабування відбувається **всередині домену**, а не через нові глобальні шари

---

## Антипатерни

розкид логіки по всьому проєкту
“куди це покласти?” кожен раз
дрібні мікро-фічі (`create-x`, `update-x`)
shared як “смітник”
