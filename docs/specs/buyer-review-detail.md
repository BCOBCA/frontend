# Buyer review detail redesign

## Acceptance
- `/review/[id]` keeps the notification target and buyer-scoped review cache. Show a readable column capped at 760px with mobile padding.
- Present the real product (when still available), buyer review with five stars/date/photos, and a distinct shop reply with shop name/date. Preserve full text and one-time review restrictions.
- Use existing red/neutral theme and compact controls. Product loading/failure must not hide a review or reply; no fabricated product data.
- Keep first-review entry working when a purchased item has no review. Preserve login, loading, retry and error handling.

## Plan and verification
1. Test the review/reply presentation, absent reply and unavailable product, plus route query/auth behavior.
2. Add a pure `ReviewDetailView`; update the route to load review and optional product via existing endpoints and show the existing form only when review is null.
3. Run focused Vitest tests, typecheck and ESLint. Inspect mobile/desktop rendering using fixture data and record the handoff.

## Structure and boundaries
Source: `app/review/[id].tsx`, `src/components/orders/ReviewDetailView.tsx`. Tests: `tests/review-detail*.test.tsx`.
Commands in frontend: `node node_modules/vitest/vitest.mjs run --pool=threads`, `npm run typecheck`, `node node_modules/eslint/bin/eslint.js <changed files>`.
Follow existing TSX styling and React Query conventions. No dependencies, schema changes, API contract changes or shared popup redesign.
