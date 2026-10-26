# FinWay coursework infrastructure implementation plan

> **For agentic workers:** Use superpowers:executing-plans. The user approved the five-item coursework scope and requested implementation in this chat.

**Goal:** Deliver a reproducible PHP/MySQL application with tested session security, trusted ingress, controlled deploy/rollback and an operations runbook.

**Architecture:** Keep the deployed flat PHP API and frontend integration. Configure secrets outside the web root, test against isolated `finway_test_*` databases, and deploy allowlisted public files through a restricted SSH command with automatic rollback.

**Tech Stack:** PHP 8.3+, MySQL 8.0+, Python 3 standard library, Apache/PHP-FPM, nftables, Cloudflare, GitHub Actions.

**Spec:** The user's approved five coursework deliverables in this chat: current sources in Git; trusted proxies/origin access; session revocation; checked deploy/rollback; operational checks and recovery documentation.

## Global constraints
- Preserve current production users, passwords, learning data and game rules.
- Never commit live configuration, session data, database dumps or private keys.
- Production schema changes are not part of deployment; the SQL export is schema-only for reproducible development.
- Existing assets/games stay available. The imported frontend is the version currently deployed on the server.
- Use a separate test database and synthetic accounts for security tests.

## Review focus
- A changed password must invalidate every old session while the caller receives a new session.
- A blocked, deleted, expired or revoked account/session cannot access a protected route.
- Request headers from an untrusted direct client cannot supply its effective IP.
- A failing release health check must restore the prior working website without touching its database.
- An archive cannot escape the configured document root or install links/private repository files.

## Tasks
- [ ] 1. Capture deployed sources, schema-only DDL and seed; add portable private configuration, development router and reproducible setup.
- [ ] 2. Add integration tests; observe blocked-session/password-revocation failures, then implement session checks and atomic password change/login. Test own-data boundaries, CSRF, expiry, rate limiting and database readiness.
- [ ] 3. Package allowlisted public files; implement and test bounded archive extraction, successful release and failed-release rollback. Add PHP/JS syntax and integration CI plus manual deploy/rollback workflows.
- [ ] 4. Snapshot Cloudflare/server configuration; configure www proxy/canonical name, Cloudflare-only trusted headers, and origin ingress. Verify forged headers are ignored, LAN/Cloudflare/ACME remain functional and SSH remains reachable.
- [ ] 5. Install the restricted deployment account/helper, exercise deploy and rollback, write API/operations/security evidence and push a reviewable branch/PR. Run the complete checks and request one independent final review.

## Commands/evidence
- PHP lint: `find api scripts -name '*.php' -exec php -l {} \;`.
- Integration: `MYSQL_USER=... MYSQL_PWD=... python3 tests/integration.py`; test runner creates/drops only a generated `finway_test_*` database.
- Deployment boundaries: `python3 -m unittest discover -s tests -p 'test_release.py' -v`.
- Production: `/usr/local/sbin/application-server-check`, direct-origin trusted-header check, public canonical/ready checks and certbot renewal dry run.
- Backups: preserve `/root/codex-maintenance/coursework-*` and test recovery on a separate database; no production-data rollback.
