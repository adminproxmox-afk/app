# Execution ledger — 2026-10-26 coursework infrastructure

- Approved scope: the user's five coursework items; proceed inline as requested.
- Workspace: managed worktree on `codex/finway-coursework-infra`; primary checkout untouched.
- Baseline: no existing backend tests in the Git checkout. Deployed source imported separately from live secrets/user data.
- Snapshot: `/root/codex-maintenance/coursework-20261026T154906Z` on las.
- Pre-flight: authentication config is shared by API, tests, readiness and deployment checks; preserve legacy production config loading while adding explicit environment overrides.
- Pre-flight: production PHP-FPM is chrooted at `/home/base`; release paths and private configuration must work inside that boundary.
- Pre-flight: deployment cannot change SQL schema automatically; rollback restores files only.
