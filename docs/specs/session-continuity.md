# Active session continuity

Problem: browser users report unexpected logout after a few minutes. Configured access lifetime is 15 minutes, refresh lifetime 30 days. Client ignores expiresAt and refreshes only after 401; foreground/online recovery currently runs only after startup restore errors. Backend immediately revokes the whole family for any reused refresh token, including a just-rotated token from another tab. Exact production trigger remains unconfirmed.

Plan and acceptance:
1. Reproduce recent-rotation replay and missing proactive refresh with focused tests.
2. Track server expiresAt in memory; refresh within 60 seconds of expiry before protected requests and from a visible/active lifecycle check every 30 seconds. Foreground/focus/online trigger the same check. Reuse one refresh promise and browser session lock. Never poll in hidden/background/offline state or refresh anonymous sessions.
3. Retain user/cache on offline, timeout, 409, 429 or server errors. Retry one rotation conflict, then back off transient failures (respect Retry-After). Only true 401 or identity change ends the session. Guard queued refreshes and old requests against logout/login races.
4. Server rejects a token rotated within five seconds with 409 if its family still has a valid token; it does not grant credentials or revoke that valid family. Older replay, explicit logout, revoked accounts and expired tokens still return 401 and enforce revocation. Preserve HttpOnly cookies/SecureStore and existing TTLs. No token storage in browser storage, no schema or CORS changes.
5. Verify with fake-clock/API/lifecycle tests, isolated PostgreSQL rotation/replay tests, cookie regression tests, frontend typecheck/lint/build and browser fixture. Do not read real browser credentials, sign in to a real account, apply live migrations, or submit real business data.

Frontend: src/services/api.ts, session lifecycle helper/hook, app/_layout.tsx and tests. Backend: AuthService and isolated auth flow tests. Keep unrelated changes intact. No deployment/commit implied.
