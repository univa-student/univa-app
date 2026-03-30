## Context

Frontend is a React SPA with modular domain-driven structure.

Main stack:
- React
- TypeScript
- React Router
- TailwindCSS
- shadcn/ui

Main directories:
- `src/app` — app bootstrap, router, providers, config
- `src/modules` — domain logic
- `src/pages` — route pages
- `src/shared` — reusable non-domain code
- `src/landing` — landing-specific UI and pages

---

##  Core rules (VERY IMPORTANT)

- Follow existing project structure
- Prefer extending existing modules over creating new patterns
- Keep changes minimal and local
- Do not move domain logic into global layers
- Do not duplicate logic that already exists

---

## Architecture

### Domain-first structure

If code belongs to a business feature/domain, place it in:

```text
src/modules/<domain>
````

Do NOT place domain code in:

* `shared/*`
* `pages/*`
* `app/*`

---

## Layer responsibilities

### `src/app`

Only global application setup:

* providers
* router
* config
* app bootstrap
* global context/store

Do NOT put domain feature logic here.

### `src/modules`

Main business/domain layer.

This is where feature code belongs:

* api
* model
* hooks
* ui
* lib
* mappers
* feature-specific realtime handling

### `src/pages`

Route composition layer only.

Pages:

* compose screen from modules/shared parts
* connect route-level layout
* may call loaders/hooks from modules
* must stay thin

Do NOT place business logic here.

### `src/shared`

Only truly reusable code.

Allowed here:

* base UI primitives
* generic hooks
* generic utils
* api client
* common config
* shared types
* realtime core
* global styles

Do NOT put domain-specific components or logic here.

### `src/landing`

Landing-only code.
Do not mix landing code with app modules unless it is truly shared.

---

## Placement rules

### Put code into `modules/<domain>` if it:

* belongs to one business domain
* knows domain entities
* renders domain-specific UI
* calls domain endpoints
* contains domain-specific hooks or state

### Put code into `shared/*` only if it:

* is used by multiple domains
* has no business/domain coupling
* is generic enough to be reused safely

Rule:
If a component is named by domain meaning, it probably belongs in a module, not shared.

---

## Expected module structure

A typical module may contain:

```text
modules/<domain>/
  api/
  model/
  ui/
  hooks/
  lib/
  index.ts
```

Possible growth inside domain is allowed.
Scale inside the module, not by inventing new global layers.

---

## Pages rules

Pages must be thin.

Good page responsibilities:

* route entry
* layout composition
* using module components
* wiring route params / loaders

Bad page responsibilities:

* fetching and transforming domain data inline
* large business rules
* reusable domain components
* domain-specific state management

If page logic grows, move it into the related module.

---

## Data and API rules

* Domain API calls belong in module `api/`
* Shared API client belongs in `shared/api`
* Domain query logic belongs in the related module
* Do not scatter endpoint calls across pages/components

---

## Hooks rules

* Domain hooks → `modules/<domain>/hooks`
* Generic hooks → `shared/hooks`

Do not place domain hooks in shared.

---

## UI rules

* Reuse existing UI primitives and patterns
* Prefer existing shared/ui and shadcn/ui before creating new base components
* Domain-specific UI belongs inside the module
* Do not move feature components into shared too early

---

## 🔌 Realtime rules

Realtime core belongs in:

```text
shared/realtime
```

Domain-specific realtime behavior belongs in the related module:

* chat handling → `modules/chat`
* notifications handling → `modules/notifications`

---

## Decision rules

When unsure:

1. Prefer consistency over abstraction
2. Prefer module-local placement over global placement
3. Prefer simple structure over clever structure
4. Prefer reuse over duplication

---

## What to avoid

* business logic in pages
* domain UI in shared
* shared used as a dump folder
* creating new architecture without need
* scattering one feature across many unrelated folders
* micro-feature fragmentation without clear value

---

## Expected behavior

* Keep pages thin
* Keep domains isolated
* Keep shared clean
* Write predictable TypeScript code
* Reuse existing patterns before introducing new ones

