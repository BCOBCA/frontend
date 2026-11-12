# Affiliate wallet history

- `/wallet-transactions` now uses WalletHistoryScreen. Reference layout with ledger/withdrawal tabs, period/type-or-status filters, reference search, newest-first rows, page buttons and note sidebar. No quantity/range/total transaction count is shown.
- Below 760px, table becomes compact cards; notes stack below the list. Desktop >=1000px uses a 264px note sidebar. Uses the shared compact header/member footer.
- Query key includes user ID, tab, period, type/status, search and page. Tab resets kind/search/page; filters/search reset page, search debounces 300ms. Auth remount resets private state. Filtering and pagination occur server-side, not over the current page only.
- Preserves all ledger movements, including pending, debt, recovery, refunds and held withdrawal debits. Amount colors distinguish increased debt from credited cash. Pending/debt balance labels remain explicit. Commission status/code come from backend; missing withdrawal balance shows unknown. No invented event reward or processing SLA.
- Withdrawal tab shows bank/masked number, gross debit, snapshotted fee/net, original debit balance and actual request status. Date first, time second, both in Asia/Ho_Chi_Minh.
- Validation: all 425 frontend tests passed; TypeScript, changed-file ESLint and web export passed. Browser synthetic fixtures verified desktop table, next-page request, debounced reference search resetting page, tab reset, PAID status filter and 393px cards without horizontal overflow. Console clean after reload. No real financial mutations.
