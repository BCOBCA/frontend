# Buyer cancellation reasons

- Order list/detail now require a selected reason before POST `/orders/{id}/cancel` with `{ reason }`. Only PENDING + UNPAID orders show cancellation; form hides if refreshed status becomes ineligible. Success refreshes order, list, vouchers, membership and notifications.
- `src/services/order-cancellation.ts` mirrors the backend buyer allowlist. The form opens in a centered Modal with dimmed backdrop, close button, scrolling content and keyboard avoidance. Backdrop and content are siblings to avoid nested buttons. Close/Escape/back/keep-order actions are blocked during submission. Server still enforces ownership/state/reason.
- Notifications expand legacy order body `Đã xác nhận` into a full confirmation sentence. Existing ambiguous cancellation records retain their text; new notifications include actor and reason from backend.
- 467 tests, typecheck/lint pass; focused route tests rerun after final eligibility guard. Browser fixture verified selection/submission and 390px layout; removed after QA.
- API contract and backend verification: ../../../backend/docs/handoffs/order-cancellation-reasons.md

Popup follow-up: applies to cancellation from both order list and detail without changing their API callbacks. 470 frontend tests, typecheck/lint pass. Desktop/390px browser fixture verified centered popup, reason submission/close, no overflow or nested buttons. Fixture removed after QA.
