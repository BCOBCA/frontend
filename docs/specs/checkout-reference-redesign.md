# Checkout reference redesign

Objective: match supplied checkout screenshot using existing components/colors: full-width recipient strip; white seller/product/options panel; right payment summary with red place-order action. On phones stack address, product/options and summary without overflow. Retain shared Header and mobile navigation.

Scope: frontend only; no new dependencies or payment/shipping integrations. COD is the only server-supported method. Keep manual voucher application and server preview calculations, including separate shipping discounts. Notes use the reference's 200-character limit. Display selected cart lines grouped by store, unit price and quantity; never invent prices, discounts or shipping choices.

Plan:
1. Regression tests for selected-line rendering, address changes, voucher/note controls, totals and order guards.
2. Pure responsive CheckoutView; keep order creation, affiliate token, idempotency and unknown-result recovery in existing route.
3. Verify focused/full tests, TypeScript, ESLint and browser screenshots at desktop/390/320 using synthetic fixtures. Remove fixture routes and record handoff.

Acceptance: address change opens a selectable address list; no address offers add; voucher entry applies/removes code through preview; payment details truthfully show COD; order disabled during cart/address/preview fetch or submission, failed fetch, empty selection, invalid stock or missing recipient. Never execute a real order during verification.

Commands: `node node_modules/vitest/vitest.mjs run --maxWorkers 2`; `node node_modules/typescript/bin/tsc --noEmit`; `node node_modules/eslint/bin/eslint.js .`.
