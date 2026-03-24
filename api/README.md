# Univa Backend Architecture

> Backend: Laravel API + Sanctum  
> Frontend: React SPA  
> Architecture: Modular Monolith

Основна ідея

Ми організовуємо код **не навколо технічних шарів**, а навколо **доменів / модулів**.

Не так:

```text
app/
  Http/
  Services/
  Models/
  Policies/
  Jobs/
````

А так:

```text
Modules/
  Auth/
  Files/
  Schedule/
  Deadlines/
  Subjects/
  Dashboard/
  Settings/
  Ai/
```

Кожен модуль містить усе, що стосується його бізнес-зони.

Що таке модуль

**Модуль** — це ізольована бізнес-область системи.

Наприклад:

* `Files` — усе, що стосується файлів, папок, завантаження, зберігання, доступу;
* `Schedule` — заняття, повторення, винятки, побудова календаря;
* `Deadlines` — дедлайни, статуси, пріоритети, прив’язка до предметів;
* `Ai` — AI-сценарії, агенти, контекст, артефакти, обробка відповідей;
* `Settings` — користувацькі та системні налаштування;
* `Subjects` — предмети, викладачі, кольори, зв’язки з іншими модулями.

Модуль повинен мати:

* чітку відповідальність;
* власну структуру;
* зрозумілі точки входу;
* мінімальне знання про внутрішню реалізацію інших модулів.

---

# Загальна структура

Рекомендована структура бекенду:

```text
Modules/
    Ai/
    Auth/
    Dashboard/
    Deadlines/
    Files/
    Schedule/
    Settings/
    Subjects/
```

Всередині модулі мають однакову, прогнозовану структуру.

Приклад:

```text
Modules
    Ai
        Agents
        Context
        Contracts
        DTO
        Enums
        Events
        Exceptions
        Formatters
        Http
        Jobs
        Listeners
        Models
        Policies
        Prompts
        Support
        UseCases
```

Це не означає, що **кожен** модуль зобов’язаний мати **всі** ці папки.
Це означає, що модуль **може** мати ці папки, якщо вони йому потрібні.

# Принципи модульного моноліту

## 1. Один модуль — одна бізнес-зона

Модуль не повинен змішувати кілька різних доменів.

Добре:

* `Files` займається файлами;
* `Schedule` займається розкладом;
* `Ai` займається AI-сценаріями.

Погано:

* модуль, у якому одночасно живуть файли, чат, AI та нотифікації.

---

## 2. Модуль містить повний набір свого коду

Усе, що належить модулю, повинно лежати **всередині модуля**:

* HTTP
* моделі
* use cases
* jobs
* policies
* events
* exceptions
* support-класи

Не потрібно розкидати код одного домену по всьому проєкту.

---

## 3. Тонкий HTTP-шар

Контролери не повинні містити бізнес-логіку.
Їх роль:

* прийняти запит;
* авторизувати;
* отримати валідовані дані;
* викликати use case / action;
* повернути response / resource.

---

## 4. Явні сценарії

Кожен важливий бізнес-сценарій повинен бути виражений окремим класом.

Наприклад:

* `CreateDeadline`
* `UpdateSubject`
* `BuildScheduleRange`
* `SummarizeFile`
* `AttachFileToDeadline`

Сценарій повинен бути очевидним із назви.

---

## 5. Мінімальна зв’язаність між модулями

Один модуль не повинен знати занадто багато про внутрішню будову іншого.

Добре:

* виклик через публічний use case;
* виклик через service / contract;
* реакція через events.

Погано:

* прямий доступ до внутрішніх helper-класів іншого модуля;
* залежність від приватних деталей реалізації;
* пряме лазіння в чужу внутрішню структуру.

---

## 6. Моноліт, але готовий до росту

Ми не розбиваємо систему на мікросервіси завчасно.
Але модулі мають писатися так, щоб у майбутньому окремі частини можна було винести без повного переписування.

Це особливо важливо для:

* AI
* Notifications
* Files
* Bot / integrations

---

# Рекомендована структура модуля

Нижче — універсальна структура, яку можна брати за основу.

```text
Modules/
    ModuleName/
        Http/
            Controllers/
            Requests/
            Resources/
        Models/
        Policies/
        DTO/
        Enums/
        Exceptions/
        UseCases/
        Services/
        Events/
        Listeners/
        Jobs/
        Support/
        Contracts/
        Providers/
        Routes/
        Database/
            Migrations/
            Seeders/
            Factories/
        Tests/
            Feature/
            Unit/
```

---

# Що означає кожна папка

## `Http/Controllers`

Тільки HTTP-рівень.

Тут не повинно бути бізнес-логіки.
Контролер:

* приймає request;
* викликає policy / authorize;
* викликає use case;
* повертає response/resource.

---

## `Http/Requests`

Валідація вхідних HTTP-даних.

Тут повинні бути:

* правила валідації;
* проста нормалізація;
* іноді базова підготовка даних.

Тут не повинно бути складної бізнес-логіки.

---

## `Http/Resources`

Форматування відповіді API.

Resource відповідає лише за те, **як дані віддаються назовні**.

---

## `Models`

Eloquent-моделі модуля.

Тут доречно тримати:

* relationships;
* casts;
* scopes;
* базову доменну поведінку, якщо вона справді належить моделі.

---

## `Policies`

Правила доступу до сутностей модуля.

---

## `DTO`

Data Transfer Objects для чіткої передачі даних між шарами.

Корисно, коли:

* сценарій має складний вхід;
* треба уникнути сирих масивів;
* треба зробити API між класами явним.

---

## `Enums`

Константи домену у вигляді enum-типів.

Приклади:

* статус дедлайну;
* тип предмета;
* тип AI-артефакта;
* режим AI-сесії.

---

## `Exceptions`

Доменні винятки модуля.

Приклади:

* `DeadlineAlreadyCompletedException`
* `ScheduleConflictException`
* `AiSessionNotAvailableException`

---

## `UseCases`

Головне місце для бізнес-сценаріїв.

Саме тут повинна жити основна прикладна логіка.

Приклади:

* `CreateSubject`
* `UpdateDeadline`
* `DeleteFile`
* `BuildCalendarRange`
* `SummarizeFile`

---

## `Services`

Повторно використовувана логіка всередині модуля.

Service потрібен, коли логіка:

* використовується в кількох сценаріях;
* не є окремим use case;
* допомагає інкапсулювати складну доменну операцію.

---

## `Events`

Події, які публікує модуль.

Приклади:

* `DeadlineCreated`
* `FileUploaded`
* `AiArtifactCreated`

---

## `Listeners`

Реакція на події.

Приклади:

* логування;
* запуск фонової обробки;
* побічні дії після події.

---

## `Jobs`

Черги / асинхронні задачі.

Приклади:

* генерація AI-конспекту;
* індексація файлу;
* масові оновлення;
* відкладені нотифікації.

---

## `Support`

Допоміжні класи модуля.

Сюди можна класти:

* builders;
* resolvers;
* factories;
* mappers;
* normalizers;
* calculators.

Але це не має ставати “смітником”.

---

## `Contracts`

Інтерфейси модуля.

Корисно для:

* заміни реалізацій;
* тестування;
* явних точок розширення;
* інтеграцій.

---

## `Providers`

Laravel service providers модуля, якщо потрібні.


# Що в модулі обов’язкове, а що опційне

## Майже завжди потрібно

```text
Http/
Models/
UseCases/
```

## Дуже часто потрібно

```text
Requests/
Resources/
Policies/
Enums/
Exceptions/
```

## Опційно, якщо модуль складніший

```text
DTO/
Services/
Events/
Listeners/
Jobs/
Support/
Contracts/
```

## Рідше, але нормально

```text
Agents/
Context/
Formatters/
Prompts/
```
---

# Як створювати новий модуль

## Крок 1. Визначити межу модуля

Спочатку треба відповісти:

* яку бізнес-задачу вирішує модуль;
* що входить у його відповідальність;
* що точно **не входить**;
* з якими модулями він взаємодіє.

### Приклад:

`Deadlines` відповідає за:

* створення дедлайнів;
* оновлення;
* статуси;
* пріоритети;
* прив’язку до предметів;
* календарне представлення дедлайнів.

Але не відповідає за:

* зберігання файлів;
* AI-генерацію конспектів;
* груповий чат.

---

## Крок 2. Описати сутності модуля

Потрібно визначити:

* основні моделі;
* enum-типи;
* зв’язки;
* ключові стани.

---

## Крок 3. Описати use cases

Потрібно виписати список бізнес-сценаріїв.

Для прикладу, у `Files` це може бути:

* `UploadFile`
* `DeleteFile`
* `MoveFile`
* `RenameFile`
* `AttachFileToSubject`
* `DetachFileFromDeadline`

---

## Крок 4. Визначити HTTP-входи

Потрібно зрозуміти:

* які endpoint-и потрібні;
* які request-класи потрібні;
* які resource-класи потрібні.

---

## Крок 5. Винести повторювану логіку в Services / Support

Якщо кілька сценаріїв використовують спільну логіку, її треба винести окремо.

---

## Крок 6. Додати events / jobs, якщо модуль має асинхронність або побічні ефекти

Наприклад:

* після upload файлу запустити індексацію;
* після створення AI-артефакта оновити статус;
* після дедлайну відправити нагадування.

---

## Крок 7. Додати тести модуля

Мінімум:

* feature tests для API;
* unit tests для критичної логіки;
* policy tests для доступів.

---

# Шаблон мінімального модуля

```text
Modules/
    Subjects/
        Http/
            Controllers/
                SubjectController.php
            Requests/
                StoreSubjectRequest.php
                UpdateSubjectRequest.php
            Resources/
                SubjectResource.php
        Models/
            Subject.php
        Policies/
            SubjectPolicy.php
        Enums/
            SubjectColor.php
        Exceptions/
            SubjectException.php
        UseCases/
            CreateSubject.php
            UpdateSubject.php
            DeleteSubject.php
            ListSubjects.php
```

Цього вже достатньо для нормального простого модуля.

---

# Шаблон складнішого модуля

```text
Modules/
    Ai/
        Agents/
        Context/
        Contracts/
        DTO/
        Enums/
        Events/
        Exceptions/
        Formatters/
        Http/
            Controllers/
            Requests/
            Resources/
        Jobs/
        Listeners/
        Models/
        Policies/
        Prompts/
        Support/
        UseCases/
```

Такий модуль доречний, коли є:

* кілька сценаріїв;
* складна внутрішня логіка;
* асинхронність;
* контекст;
* різні формати результату;
* інтеграція з AI SDK;
* події та артефакти.

---

# Правила іменування

## UseCase

Назва повинна бути дією:

* `CreateDeadline`
* `UpdateScheduleLesson`
* `SummarizeFile`
* `BuildSubjectCalendar`

Не треба:

* `DeadlineService`
* `MainManager`
* `UniversalProcessor`

---

## Controller

Назва за сутністю:

* `DeadlineController`
* `FileController`
* `SubjectController`

---

## Request

Назва за сценарієм:

* `StoreDeadlineRequest`
* `UpdateFileRequest`

---

## Resource

Назва за сутністю:

* `DeadlineResource`
* `FileResource`

---

## Event

Назва у past tense:

* `DeadlineCreated`
* `FileUploaded`
* `AiRunCompleted`

---

## Policy

Назва за моделлю:

* `DeadlinePolicy`
* `FilePolicy`

---

# Як модулі мають взаємодіяти

Міжмодульна взаємодія повинна бути контрольованою.

Рекомендований порядок:

## Добре

* через use case;
* через contract;
* через event;
* через явний public service.

## Погано

* напряму лізти в чужі внутрішні класи;
* використовувати чужі support/helper-класи напряму;
* покладатися на структуру чужого модуля.

### Приклад

Модуль `Deadlines` може знати, що існує `Files`, але не повинен залежати від внутрішньої реалізації його storage-адаптерів.

---

# Що не можна робити

## Не можна робити “god modules”

Один модуль не повинен містити все підряд.

## Не можна робити “god services”

Класи типу:

* `AppService`
* `MainService`
* `CommonManager`

— це майже завжди поганий знак.

## Не можна змішувати HTTP і домен

Контролер не повинен будувати бізнес-процес.

## Не можна ховати критичну логіку у випадкові helper-и

Важливий сценарій має бути явним класом.

## Не можна розкидати код одного модуля по всьому проєкту

Уся доменна логіка повинна жити у своєму модулі.

---

# Приклад потоку виконання

```text
Request
  -> Controller
  -> Policy / authorize
  -> DTO / validated payload
  -> UseCase
  -> Service / Model / Event / Job
  -> Resource / Response
```
Це базовий і бажаний flow для більшості сценаріїв.

---

# Приклад модуля Ai

```text
Modules/
    Ai/
        Agents/
            FileSummaryAgent.php
        Context/
            FileSummaryContextBuilder.php
        Contracts/
            AiResponseExtractorInterface.php
        DTO/
            FileSummaryData.php
        Enums/
            AiArtifactType.php
            AiProvider.php
            AiRunStatus.php
        Events/
            AiRunRequested.php
            AiRunCompleted.php
            AiRunFailed.php
            AiArtifactCreated.php
        Exceptions/
            AiException.php
        Formatters/
            AiResultFormatter.php
        Http/
            Controllers/
                AiSummaryController.php
            Requests/
                SummarizeFileRequest.php
            Resources/
                AiArtifactResource.php
        Jobs/
            RunFileSummaryJob.php
        Listeners/
            UpdateAiRunStatus.php
            LogAiUsage.php
        Models/
            AiRun.php
            AiArtifact.php
            AiContextSession.php
        Policies/
            AiArtifactPolicy.php
        Prompts/
            OutputRulesPrompt.php
            SystemPrompt.php
        Support/
            AiModelResolver.php
            AiAttachmentFactory.php
            AiRunRecorder.php
        UseCases/
            SummarizeFile.php
```

Це хороший приклад модуля, де структура виправдана складністю.

---

# Приклад простого модуля Schedule

```text
Modules/
    Schedule/
        Http/
            Controllers/
                ScheduleLessonController.php
            Requests/
                StoreScheduleLessonRequest.php
                UpdateScheduleLessonRequest.php
            Resources/
                ScheduleLessonResource.php
        Models/
            ScheduleLesson.php
            RecurrenceRule.php
            ScheduleLessonException.php
        Policies/
            ScheduleLessonPolicy.php
        Enums/
            LessonType.php
        Exceptions/
            ScheduleException.php
        Services/
            ScheduleBuilder.php
        UseCases/
            CreateScheduleLesson.php
            UpdateScheduleLesson.php
            DeleteScheduleLesson.php
            BuildScheduleRange.php
```

---

# Коли модуль можна вважати нормальним

Модуль зроблений добре, якщо:

* зрозуміло, за що він відповідає;
* його код не розкиданий по всьому проєкту;
* сценарії виражені окремими класами;
* контролери тонкі;
* доступи проходять через policy;
* помилки виражені явно;
* є базові тести;
* інші модулі не залежать від його внутрішнього “сміття”.

