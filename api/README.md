# FinWay API

Minimal PHP backend for the existing site.

## Endpoints

- `GET /api/health.php`
- `GET /api/ready.php` (200 with DB/release ready, otherwise 503)
- `GET /api/me.php`
- `POST /api/login.php`
- `POST /api/register.php`
- `POST /api/logout.php`
- `POST /api/change-password.php` (`currentPassword`, `newPassword`)
- `POST /api/sync-state.php`, `/api/complete-lesson.php`, `/api/daily-bonus.php`, `/api/purchase.php`
- `GET /api/check-public-tag.php`

## Auth

Uses an HttpOnly cookie named `lca_session` backed by `auth_sessions`.

Session tokens are stored as SHA-256 hashes; passwords use PHP password_hash/password_verify.
Protected requests reject revoked/expired sessions and blocked/deleted users.
On password change, every prior session is revoked and the caller receives a new cookie.
Login/password changes lock the same account row to prevent old-password login racing rotation.

Mutations requiring authentication use the `X-CSRF-Token` header matching the `lca_csrf` cookie.
Requests/responses are JSON. Errors include `ok:false` and a generic `error`; optional `code` is stable for existing frontend flows.
Responses use no-store and X-Request-ID. Use HTTPS in production (Secure + HttpOnly session cookie, SameSite=Lax).
401 means authentication rejected, 403 CSRF/access rejected, 422 invalid input, 429 rate limited.
Never send passwords/session tokens in URLs. See ../docs/operations.md for deployment and readiness.
