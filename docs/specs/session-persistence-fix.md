# Session persistence and expiry recovery

Problem: The local web frontend calls the hosted API on another site, while the API refresh cookie is always SameSite=Strict. Reload/session restore and expiry refresh lose the cookie. Startup also treats connectivity failures as an anonymous session, and failed refreshes can clear valid sessions on 403.

Plan: Prove cookie/restore/refresh failures in focused backend and frontend tests. Permit the approved cross-site cookie flow using HttpOnly + Secure + SameSite=None and partitioned storage on HTTPS; retain Lax for plain-HTTP development and exact Origin checks. Keep cookie attributes consistent on deletion. Serialize/deduplicate refresh and restore, replay stale-token requests with the latest access token, preserve sessions on network/5xx/403 failures, and present retriable startup errors rather than a false logged-out screen. Retry recovery when connectivity returns.

Keep refresh rotation, family revocation and account-switch protection. Do not persist web credentials in localStorage, return refresh credentials to browser JavaScript, modify JWT lifetimes, broaden allowed origins or deploy production changes without explicit authorization.

Verification: frontend API/store regression tests, backend controller tests without a database, TypeScript, ESLint, browser startup error/retry inspection where possible. Document hosted API deployment requirement and live-login verification limits.

Completed: 180 frontend tests, 11 backend cookie tests, TypeScript and ESLint passed. Browser retry UI and the public localhost:8082 CORS preflight were verified. Backend deployment is still required; no live signed-in session was used. Details in `docs/handoffs/session-persistence-fix.md`.
