# API: Автентифікація

Для доступу до API Univa необхідно пройти автентифікацію. Підтримується два методи.

## Bearer Token

Передайте токен у заголовку `Authorization`:

```http
GET /api/v1/me
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

## OAuth 2.0

Для серверних інтеграцій рекомендуємо OAuth 2.0 Authorization Code Flow.

```javascript
// Крок 1 — перенаправити користувача
const authUrl = `https://univa.app/oauth/authorize
  ?client_id=${CLIENT_ID}
  &redirect_uri=${REDIRECT_URI}
  &response_type=code
  &scope=schedule:read files:read`;

// Крок 2 — обміняти code на токен
const { access_token } = await fetch("/oauth/token", {
  method: "POST",
  body: JSON.stringify({ code, client_secret: SECRET }),
}).then(r => r.json());
```

## Терміни дії токенів

| Тип токена    | TTL       |
|---------------|-----------|
| Access token  | 1 година  |
| Refresh token | 30 днів   |
| API Key       | Безстроково |