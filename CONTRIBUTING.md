# Contributing to Univa

Thank you for your interest in contributing to **Univa**.

We welcome improvements, bug fixes, refactors, and new features that align with the project's architecture and goals.

---

## Project Stack

**Backend**

* Laravel (API-only)
* Laravel Sanctum
* PostgreSQL
* Redis
* Docker

**Frontend**

* React (SPA)
* TypeScript
* Vite
* TailwindCSS / shadcn UI

---

## Getting Started

### 1. Fork the Repository

Create a fork of the project and clone it locally.

### 2. Create a Branch

Always create a new branch for your changes:

```bash
git checkout -b feature/short-description
```

Branch naming conventions:

* `feature/...`
* `fix/...`
* `refactor/...`
* `hotfix/...`

---

## Development Guidelines

### General Principles

* Follow clean architecture principles
* Keep modules isolated
* Avoid unnecessary complexity
* Write readable and maintainable code

### Backend (Laravel API)

* Use Form Requests for validation
* Use API Resources for responses
* Keep controllers thin
* Move business logic into Services
* Follow RESTful conventions
* Use consistent API response structure

Authentication must use Laravel Sanctum.

### Frontend (React SPA)

* Use TypeScript (typed props and state)
* Keep components small and composable
* Separate UI from logic
* Avoid hardcoded URLs (use environment variables)
* Keep styling consistent

---

## Code Style

* Write meaningful variable and method names
* Avoid commented-out code
* Remove debug statements before committing
* Keep files organized and modular

---

## Commits

Use clear and descriptive commit messages.

Example:

```bash
feat: add deadline filtering to schedule module
```

Avoid:

```bash
fix stuff
```

---

## Pull Requests

Before submitting a PR:

* Ensure the project builds successfully
* Run migrations if applicable
* Test your changes locally
* Remove debugging code
* Provide a clear description of your changes

Your PR description should include:

* What problem it solves
* What changes were made
* Any breaking changes (if applicable)

---

## Security

* Validate all input on the backend
* Never trust frontend data
* Do not expose sensitive information
* Follow role-based access rules where applicable

---

## Reporting Issues

When reporting bugs, include:

* Clear description
* Steps to reproduce
* Expected behavior
* Actual behavior
* Screenshots or logs if relevant

---

## Questions

If you're unsure about an implementation detail or architectural decision, open a discussion before starting major changes.

---

Thank you for contributing to Univa.
