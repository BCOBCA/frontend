# Guest check-in visibility

- Objective: keep the existing check-in panel visible to guests with zero points and an unclaimed check-in. Pressing check-in opens login; guests cannot earn points. Signed-in users see their actual balance and today's check-in status from the existing membership API.
- Scope: `app/(tabs)/promotions.tsx`; reuse the current Button, routing and query conventions, e.g. `router.push('/login')`. No dependency, API or schema changes.
- Plan: add a screen regression test; replace the login-only panel with the shared check-in content; run frontend tests, typecheck, lint and inspect the guest page in Chrome.
- Verify: `npm test`, `npm run typecheck`, `npm run lint` in `frontend`. Cover guest click, signed-in click, already checked in, and loading/error states.
- Boundaries: preserve other promotion behavior and unrelated working changes; do not show cached member points or check-in status to guests.
