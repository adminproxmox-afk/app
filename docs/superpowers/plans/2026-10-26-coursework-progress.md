# Execution ledger — 2026-10-26 coursework infrastructure

- Approved scope: the user's five coursework items; proceed inline as requested.
- Workspace: managed worktree on `codex/finway-coursework-infra`; primary checkout untouched.
- Baseline: no existing backend tests in the Git checkout. Deployed source imported separately from live secrets/user data.
- Snapshot: `/root/codex-maintenance/coursework-20261026T154906Z` on las.
- Pre-flight: authentication config is shared by API, tests, readiness and deployment checks; preserve legacy production config loading while adding explicit environment overrides.
- Pre-flight: production PHP-FPM is chrooted at `/home/base`; release paths and private configuration must work inside that boundary.
- Pre-flight: deployment cannot change SQL schema automatically; rollback restores files only.

- Task 1: complete — deployed backend imported in 24d8ed6, schema/seed contain no user rows, private-config/dev setup documented.
- Task 2: complete — baseline four real failures, then 9/9 integration tests pass (34.831s); PHP lint passed. Isolated MySQL only.
- Task 3: implementation complete — four release tests RED→GREEN; PHP/JS lint passed; CI/manual workflows committed. Remote execution awaits GitHub write access (403 as danil1688).
- Task 4: Cloudflare www proxied=true, RemoteIPHeader CF-Connecting-IP trusted only for official CIDRs, separate ingress table enabled. Existing 22 server checks pass; final forged-header/canonical checks follow release.
- Task 5: recovery rehearsal passed, 17 tables imported into/dropped from isolated database. Restricted key/account installed. Production release exercise pending review fix.
- Final review: independent gpt-6-astra, read-only 2172350..3bba41c; no Critical, one Important, one Minor. Reviewer independently ran 4/4 release tests.
- Final: fixed sparse archive expansion bypass — test_sparse_files_are_rejected_before_expansion RED (accepted sparse entry)→GREEN; reject sparse metadata and bound cumulative logical member sizes before reading, release suite 5/5.
- Final: minor (deferred): GitHub workflow rollback depends on current CI; direct restricted SSH rollback is available even if CI fails.
- Final: Ruling: lesson-score/item-ownership/concurrent-balance rules remain assigned to application/database teammates — explicitly excluded from infrastructure scope — rewards still need their application-layer hardening.
- Final: Ruling: Google/Telegram OAuth completion remains separate feature work — baseline UI buttons are not server authentication — those buttons must not be represented as working social login.
- Final: Ruling: keep imported frontend design and synchronous requests — preserve deployed behavior — existing frontend responsiveness limitations remain.
- Final: Ruling: offsite backups/external monitoring deferred until destination and credentials are chosen — local backups and recovery verified — loss of the whole host still requires the separate copied snapshot.
- Final: Ruling: production outcomes must be verified by executor — reviewer was intentionally read-only/offline — no operational success inferred from review alone.
- Final: Ruling: installer targets verified production permissions, not arbitrary new-server layouts — ancestor ownership/modes documented and checked — a new server needs the same permission preflight.
