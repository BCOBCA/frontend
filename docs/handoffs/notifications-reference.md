# Notifications reference redesign

- Replaced the generic DataList route with a dedicated account-scoped inbox and NotificationsView. Matches the supplied sidebar/title-strip/status-pills/notification-row reference; mobile uses horizontal categories and compact rows. Retains the shared header and native push settings.
- Existing paginated GET /notifications is loaded at 100 rows per request until complete, deduplicating IDs. Category counts and combined category/read/sort filtering cover the loaded inbox; UI pages contain 10 rows. Classification uses target metadata, with unknown types under system. No backend changes or migration.
- Individual open marks unread notifications through the existing PUT endpoint, then opens supported Order targets. Mark-all covers all unread items in batches of five. Errors remain visible; onSettled refreshes account-scoped caches after partial failure. Guest sessions do not fetch; account switches remount state. Existing live invalidation still refreshes the inbox.
- Validation: all 448 frontend tests pass, typecheck/lint/diff checks pass. Browser fixture at desktop and 390px: no horizontal overflow, category/read filters, oldest sorting and mark-all verified; console has no warnings/errors. Browser checks used isolated synthetic data, never changed customer notifications.
- Limitation: client-side full-inbox loading prioritizes accurate counts with the existing API. If inbox history becomes large, add server-side category counts/filtering and an atomic mark-all endpoint.

Spec: ../specs/notifications-reference.md

Unread-count display: category badges count only unread notifications and hide at zero. `Chưa đọc` shows a positive count only; `Tất cả`/`Đã đọc` have no numeric counts. Read notifications remain available in history. Verified 13 focused tests, typecheck/lint and browser mixed/all-read states; seller uses the same display rule.

Compact layout follow-up: sidebar 228px, smaller title/action padding, 40px desktop row icon, 13px title/12px body, 10px row padding and 6px list gap. Desktop fixture rows measure 79px; wrapped mobile content grows naturally. Verified isolated fixture at 1440px and 390px without horizontal overflow; desktop console clean. All 16 focused notification tests pass using Vitest's threads pool (fork workers hit sandbox EPERM).
