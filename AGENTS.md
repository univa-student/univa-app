## Project overview

Univa — student platform that combines schedule, deadlines, files, group collaboration and AI.

Tech stack:
- Laravel API (Sanctum Cookie-based auth)
- React SPA (TypeScript)

---

## Core rules (read first)

- Follow existing code patterns — do not invent new ones
- Do not rewrite working code without clear reason
- Do not modify unrelated parts of the system
- Prefer minimal, targeted changes
- Always keep behavior predictable

---

## API contract

- API response structure is considered stable
- Do NOT change response shape without explicit need
- Frontend depends on backend contracts

---

## Architecture

- Backend: modular monolith (`Modules/*`)
- Frontend: also modular monolith (`modules/*`)

- Respect module boundaries
- Do not mix responsibilities between layers

---

## Context awareness

Before writing code:
- check existing implementation
- reuse existing services/components
- avoid duplication

If something already exists → extend it, not recreate

---

## Documentation structure

Detailed rules are split into separate files:

- `/api/AGENTS.md` — backend rules
- `/frontend/AGENTS.md` — frontend rules
- `/docx/*` — domain concepts

Always check local AGENTS.md in the current directory first.

---

## Decision making

When unsure:
1. Prefer consistency over “better architecture”
2. Prefer existing solution over new abstraction
3. Prefer simple solution over complex one

---

## What to avoid

- Overengineering
- Creating new patterns without need
- Breaking existing flows
- Large refactors without request

---

## Expected behavior

- Make small, clear, safe changes
- Keep code readable and consistent
- Explain important decisions briefly