# Affiliate withdrawal

## Scope
Redesign `/withdrawal` using reference: balance/withdrawable summary, amount, saved beneficiary selection/add form, request summary immediately above submit. Keep login/error/retry/success handling and history destination. Use measured/responsive layout; no invented bank accounts or logos.

## Contracts and rules
- Authenticated GET `/affiliate/withdrawal-settings`: flat VND fee, minimum/maximum withdrawal, configuration revision. Defaults: free, 50,000 minimum, 50,000,000 maximum per request (reference values). Admin/SuperAdmin GET/PUT `/admin/settings/affiliate-withdrawal`; validated amounts, optimistic revision check and audit. Configuration applies to future requests only.
- Amount is gross wallet debit; fee deducted from it; net = amount - fee > 0. Debt prevents withdrawal. Server is authoritative; client sends expected configuration revision to prevent a changed fee being silently accepted. Serializable transaction, existing wallet concurrency/idempotency behavior retained. Snapshot fee/net on withdrawal; refunds of rejected requests restore full gross amount. Historical records backfill zero fee/net equal to gross.
- Own saved bank accounts via GET/POST `/affiliate/bank-accounts`; encrypted account number/holder at rest using existing AES-GCM bank-data protection. Responses mask account number; server resolves the selected account ID and checks ownership when withdrawing. Existing direct bank-detail request remains compatible.
- UI never persists raw bank information in browser storage. User-scoped queries, account-change remount, at most 10 saved banks. Adding bank validates names/number. Submission has a synchronous duplicate guard, stable key for retries, and revision in payload. No automatic withdrawal or real transfer in tests.

## Plan
1. Shared bank encryption helper, settings/bank entities and services, fee snapshots and migration. Add admin/auth endpoints.
2. Integration regression: auth/ownership, configuration validation/stale revisions, fee/net snapshots, idempotency, gross debit/rejection and legacy behavior. Isolated test DBs only.
3. Frontend quote/form helpers, bank selector/add form, amount and summary; wire queries/actions and update withdrawal history amounts.
4. Frontend tests/typecheck/lint/export; backend affected tests; browser fixtures at 393px and desktop. Document API/migration and limitations.

## Boundaries
Preserve existing architecture, no dependencies or external bank integration. No commit/deployment or applying migrations to shared application DB during implementation. Public policy publication metadata remains separate; withdrawal form reads effective settings directly. Test fixtures override minimum for existing low-value finance scenarios.

Commands: `npm test`, `npm run typecheck`, `npx eslint <changed files> --no-cache`, `npm run build`; .NET 10 `dotnet ef migrations add ... --project BCOBCA.DAL --startup-project BCOBCA.API` and `dotnet test BCOBCA.Tests --filter ...`.
