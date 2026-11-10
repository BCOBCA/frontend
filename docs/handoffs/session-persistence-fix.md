# Session recovery

- API/store/root layout now preserve sessions on transient failures, deduplicate refresh and restore, retry expired access requests, and show retryable startup recovery instead of anonymous navigation on a failed connection.
- Refresh-token 401 cleanup runs once under the session lock; true expiry/account-switch protections remain in effect. Web refresh credentials stay in HttpOnly cookies; native storage stays in SecureStore.
- Verified 180 frontend tests, TypeScript, full ESLint, browser startup error/retry UI and 11 backend cookie tests.
- Backend cookie changes must be deployed to Render before reload/session-expiry behavior is fixed on the hosted API. Log in once after deployment. Live authenticated persistence was not exercised.
- Full details: [backend handoff](../../../backend/docs/handoffs/session-persistence-fix.md).
