# Product Affiliate — 2026-11-04

## Behavior
- `/affiliate-ranks` now shows six real API metrics, rank progress, five rank policies, invitation copy/share/counts, referral history navigation, commission history and own product links. Desktop uses three metric columns and a commission table; mobile uses two columns and commission cards. Colors: #E53935 / white / #F4F5F7.
- Signup restores optional manual referral code and prefills `?ref=`. Existing email-or-phone and password confirmation remain. Product/ref/source parameters survive switching signup/login and return to the validated product route.
- Product detail can create/reuse an authenticated product Affiliate link and copy/share it. `?aff=` records the source with the backend. Invalid/self/expired sources never establish payout rights from frontend calculations.
- Web uses the API HttpOnly cookie. Native uses SecureStore for opaque source tokens. Serialized click tracking finishes before checkout; native source is frozen per checkout idempotency key, avoiding attribution changes during retry.
- Existing wallet, withdrawals, leaderboard and referral pages are retained. Guests can read public policies; private queries/metrics require login. Copy/share uses Expo Clipboard and the native/web share API with visible failure feedback.

## Files
- `app/affiliate-ranks.tsx`, `app/commissions.tsx`, `app/product/[id].tsx`, `app/checkout.tsx`.
- `src/screens/AuthScreen.tsx`, `src/components/auth/auth-form.ts`.
- `src/components/affiliate/ShareLinkActions.tsx`, `AffiliateCommissionHistory.tsx`, `affiliate-progress.ts`.
- `src/services/affiliate-source.ts`, `affiliate-storage.ts`, `affiliate-storage.web.ts`.
- `tests/auth-form.test.ts`, `affiliate-source.test.ts`, `affiliate-progress.test.ts`; package.json/lock add Expo-compatible `expo-clipboard`.
- Earlier member-card/level work remains documented in `membership-levels.md`; unrelated working-tree edits were preserved.

## Backend dependency
Apply `20261104120000_CompleteProductAffiliateTracking` and configure real `App__PublicUrl`/CORS origins before sharing. New rank defaults are 0/10/30/60/100 with 2/3/5/7/10%; public server configuration is authoritative. See sibling `backend/docs/handoffs/product-affiliate.md` for API contracts, migration command and attribution/finance rules.

## Verification
- 36 Vitest tests; TypeScript and ESLint passed. Exported web artifacts successfully.
- Tracking tests cover serialization/last-click, checkout waiting for pending tracking, web cookie-only response and retaining previous source after invalid tracking.
- Isolated Chrome layout/interaction checks passed at 320/390/768/1440px without horizontal overflow or runtime exceptions: rank progress, copy feedback, product tracking/link creation, signup prefill, member information navigation and guest privacy. Browser uses API fixtures; real finance is verified separately by backend PostgreSQL integration tests. Screenshots at 320px/1440px were visually inspected.
- Physical iOS/Android copy/share/SecureStore flows require device validation; no physical-device run was performed.
