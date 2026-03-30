## 🧠 Context

Backend is a Laravel API built as a modular monolith.

Structure:
- Core logic → `App/Core/*`
- Business logic → `Modules/*`
- HTTP layer → inside each module

---

## ⚠️ Core rules (VERY IMPORTANT)

- Always follow existing module structure
- Do not move logic outside its module
- Do not introduce global helpers/services
- Prefer extending existing logic over creating new abstractions
- Keep changes minimal and localized

---

## 🧱 Architecture

### Modular monolith

- Each module = isolated business domain
- Modules must not depend on internal structure of other modules
- Communication between modules:
  - via UseCases
  - via Services
  - via Events

Do NOT:
- access чужі Support/Helpers напряму
- лізти в Models іншого модуля без потреби

---

## 🔁 Flow (expected)

Request
→ Controller
→ Policy
→ UseCase
→ Service / Model
→ ApiResponse


Controllers must stay thin.

---

## 📂 Core layer (App/Core)

Core is **global infrastructure**, not business logic.

### Use existing tools:

#### ApiResponse
- ALWAYS use `ApiResponse::*` for responses
- Do not return raw `response()->json()`

#### ResponseState
- Use enum instead of magic status codes

#### UnivaRequest
- All FormRequests must extend `UnivaRequest`
- Do not override validation response manually

#### UnivaHttpException
- Use for HTTP-level errors when needed

---

## ❗ API response rules

Response format is standardized:

```json
{
  "status": number,
  "message": string|null,
  "data": mixed,
  "errors": mixed,
  "meta": object
}
````

Rules:

* Do not change structure
* Do not rename fields
* Do not wrap responses differently

---

## 🧩 Modules

All business logic must live inside `Modules/*`

Each module:

* owns its domain
* contains its own:

    * Models
    * UseCases
    * Http
    * Policies
    * Exceptions
    * etc.

Do NOT:

* put domain logic in `App/*`
* create shared "god services"

---

## 🧠 UseCases

* Every business scenario = separate class
* Name must describe action:

GOOD:

* `CreateDeadline`
* `AttachFileToSubject`

BAD:

* `DeadlineService`
* `MainManager`

UseCases:

* orchestrate logic
* can call Services / Models / Events

---

## 🔄 Services

Use only when:

* logic is reused
* logic is not a full use case

Do NOT:

* turn Services into god-classes

---

## 🚨 Exceptions

* Domain errors → module Exceptions
* HTTP errors → `UnivaHttpException` (if needed)
* Validation → handled via `UnivaRequest`

Do NOT:

* throw generic `Exception` for business logic

---

## 🧾 Requests

* Always use FormRequest (extend `UnivaRequest`)
* Only validation + simple normalization
* No business logic

---

## 📤 Responses

* Use:

    * `ApiResponse::data()`
    * `ApiResponse::ok()`
    * `ApiResponse::created()`
    * `ApiResponse::error()`

* Resources (if used) handle formatting, not logic

---

## 🔐 Policies

* Access control must go through Policies
* Do not check permissions inside UseCases

---

## 🔗 Cross-module interaction

Allowed:

* UseCase call
* Contract / Service
* Event

Not allowed:

* direct access to internal helpers
* reliance on internal structure

---

## 🚫 What to avoid

* fat controllers
* god services
* shared utils for everything
* breaking module boundaries
* hidden business logic

---

## ✅ Expected behavior

* Write predictable, structured code
* Follow module boundaries strictly
* Use Core layer consistently
* Keep API stable
* Prefer clarity over cleverness


