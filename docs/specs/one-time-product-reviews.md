# One-time product reviews

## Objective and acceptance
- New reviews start at zero stars; sending requires selecting 1–5 stars and nonempty content.
- The multiline input grows and shrinks with content, with a 112px minimum. The dialog scrolls on small screens.
- Each purchased order item accepts one review. Existing reviews open read-only, including seller replies and images. API attempts to overwrite return 409.
- Order item DTOs add `hasReview` (default false). Order lists show “Xem đánh giá” when all items have reviews; mixed orders still allow choosing an unreviewed item and viewing reviewed ones. Detail buttons reflect each item.
- Refresh order list/detail caches after submission; preserve delivery and ownership checks. Existing unique index prevents duplicate rows; transaction conflicts become 409.

## Implementation plan
1. Add failing form/card and backend regression tests for initial stars, read-only reviews, refreshed caches and immutable submissions.
2. Enforce one-time saves and expose per-item state through existing order projections (no migration).
3. Update form, dialog, list and detail labels; verify focused tests, typecheck, lint and browser rendering.

## Commands and structure
- Frontend: `node node_modules/vitest/vitest.mjs run --pool=threads`; `npm run typecheck`; `node node_modules/eslint/bin/eslint.js .` in `frontend`.
- Backend: `dotnet test BCOBCA.Tests --filter FullyQualifiedName~PublishedReviewsTests` in `backend` (isolated PostgreSQL connection required).
- Keep existing TSX inline style and C# record conventions. Tests live in `frontend/tests` and `backend/BCOBCA.Tests`; handoff in `frontend/docs/handoffs`.

## Boundaries
Preserve unrelated work; no new dependencies, schema changes or review deletion. Seller replies remain editable. Scope is one review per order item, so a later purchase can receive its own review.
