# My offers

Objective: add “Ưu đãi của tôi” immediately after “Đơn hàng của tôi” in the member menu, linking to `/my-offers`. Show the signed-in user's collected and point-redeemed vouchers, including used/expired history.

Contract: authenticated `GET /api/vouchers/mine?page=1&pageSize=20&status=...`, using the existing response envelope and pagination. User identity comes from the authenticated account, never a request user ID. Filters: omitted (all), AVAILABLE, COLLECTED, REDEEMED, USED, EXPIRED. Return claim ID, voucher ID, discount terms, dates, point cost and computed status. Used takes precedence over expired; inactive/not-started offers are distinguishable and not presented as usable. No migration or changes to redemption/checkout rules.

UI: existing Page/back/member footer; six filter chips; responsive voucher cards with discount, code, collection source, dates, conditions and status. Copy code with visible success/failure. Available vouchers offer a shopping link. Guests see login; loading, retry, empty state and load-more are explicit. Account-keyed cache, refetch after collection, no stale vouchers from another account.

Plan: (1) backend query/DTO/authenticated endpoint + integration assertions; (2) frontend route/view + member menu + route/action tests; (3) typecheck/lint, frontend tests and backend tests; document handoff.

Commands: frontend `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`; backend `dotnet test BCOBCA.Tests --filter FullyQualifiedName~VoucherRedemptionFlowTests` and `dotnet build --no-restore`.

Boundaries: reuse existing dependencies, DTO conventions, database entities and shared UI. Preserve unrelated edits, do not commit. No new redemption logic, migrations, external services, or fabricated vouchers. Browser verification when available.

## Revision: compact wallet

Use the existing OfferCard in both discovery and wallet. Wallet cards use the compact pink ticket design, including point-redeemed vouchers; tapping the card/action opens an owned-offer conditions popup with code/copy, dates and terms. Remove wallet filter chips and query only AVAILABLE vouchers. Keep defensive frontend filtering for used/expired data. Discovery requests UNCLAIMED vouchers and hides owned ones immediately after collection. Apply discovery filtering before server pagination so totals and load-more remain correct. Preserve the existing all/history API contract for other consumers. No auto-commit.
