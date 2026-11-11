# Order detail reference redesign

Objective: match the provided reference with shared header, local page title/back action, status-aware order banner and four-step progress, recipient details, seller-grouped product rows, summary/payment/action sidebar. Stack on phones and retain bottom navigation. Keep order history visible in full (all entries supplied by the API), dates/notes, shipments, review eligibility, cancellation and refund navigation.

Data: prices, quantities, discount/shipping/total, recipient and history remain server order snapshots. Add optional order item display metadata (store name/active slug, image and current variant name) and payment method to the authenticated order response. No schema/migrations or new dependencies. Legacy responses get neutral placeholders, never invented seller names/images. Cancel only PENDING+UNPAID; request refund only COMPLETED+PAID; reviews remain available for COMPLETED/REFUNDED.

Plan:
1. Add focused status/grouping/render/route regression tests, particularly history retention and cancelled/refunded banners.
2. Extend read-only backend DTO/query and isolated flow checks; build pure responsive OrderDetailView and wire current route.
3. Verify tests, TypeScript, lint, backend compile/integration, browser fixtures at desktop/mobile. No real order writes, deployments or commits. Record handoff.

Checks: `node node_modules/vitest/vitest.mjs run --maxWorkers 2`; `node node_modules/typescript/bin/tsc --noEmit`; `node node_modules/eslint/bin/eslint.js .`; isolated backend flow via local dotnet CLI.
