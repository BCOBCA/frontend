# Notifications reference redesign

Match the supplied reference inside the shared red header: compact 228px category sidebar, white title/action strip, status pills, sorting and notification rows. Use 10px vertical row padding, 6px list gaps and 40px desktop icons; allow rows to grow for wrapped text. Unread rows use a pale pink surface, red dot/icon and status badge; read rows use neutral styling. Keep the existing typography and Lucide icons. At widths below 900px show horizontal category controls; below 600px stack the title/action and simplify row spacing.

Use existing authenticated GET /notifications pagination and PUT /notifications/{id}/read. Load all pages (100 per request) to calculate accurate category/status counts and apply combined category/status/sort filters; display 10 rows per UI page. Do not infer categories from message text: use targetType/type; unknown types belong to system. Scope React Query cache to account ID and retain live invalidation of ['notifications']. Preserve native push settings and guest/error/loading/empty states.

Opening an unread row marks it read, then opens a supported target (Order → /order/[id]); unknown targets only mark read. Mark-all covers all loaded unread notifications with at most 5 simultaneous requests. Always refresh after mutations, including partial bulk failure, and show errors. Disable conflicting mutations while busy. No synthetic notifications or counts in production.

Implementation: (1) helpers and behavioral tests, (2) presentational view, (3) route integration, (4) focused tests/typecheck/lint and desktop/mobile browser checks. Commands: npm test -- --run tests/notifications.test.ts tests/notifications-view.test.tsx tests/notifications-route.test.tsx; npm run typecheck; npm run lint.
