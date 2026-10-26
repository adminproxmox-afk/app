# Life Capital API

Minimal PHP backend for the existing site.

## Endpoints

- `GET /api/health.php`
- `GET /api/me.php`
- `POST /api/login.php`
- `POST /api/register.php`
- `POST /api/logout.php`

## Auth

Uses an HttpOnly cookie named `lca_session` backed by `auth_sessions`.
