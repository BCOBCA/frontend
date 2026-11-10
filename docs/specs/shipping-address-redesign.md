# Shipping address editor

Objective: Match the supplied reference with a white split card, a red map-pin illustration and delivery benefits at left, labeled recipient/location fields at right, a default-address switch and cancel/save actions. Stack the form on phones and keep touch targets at least 44px.

Keep the existing POST/PUT address contract and edit hydration. Province and ward remain codes; location choices load from Province Open API v2 without authentication data. User confirmed the current two-level catalog: province/city → ward/commune, with no district field. Never invent district options.

Plan:
1. Add the illustration and reusable labeled input/select controls using React Native, SVG and existing theme tokens.
2. Add typed location loading, focused data/validation tests and cascading selections. Wire the design to existing form and save logic.
3. Verify TypeScript, ESLint, relevant tests, desktop/mobile screenshots and form interactions. Write a handoff.

Acceptance: Prefilled recipient, editable required fields with Vietnamese errors, searchable location choices, dependent values cleared when parent changes, explicit loading/retry/empty states, existing-address values preserved on load, default toggle and cancel/save continue working. Duplicate submissions are disabled while saving.

Commands: `node node_modules/vitest/vitest.mjs run tests/address-data.test.ts tests/address-locations.test.ts`; `node node_modules/typescript/bin/tsc --noEmit`; `node node_modules/eslint/bin/eslint.js .`.

Boundaries: No database or backend contract changes, dependencies, commits or deployment. Put presentation in src/components/addresses, services in src/services and keep routes focused on data and navigation.

Completed: desktop/mobile layout, current province/ward selection, no-accent search, dependent reset, default toggle and Vietnamese field validation verified in browser. Eight focused tests, TypeScript and ESLint passed. See `docs/handoffs/shipping-address-redesign.md` for verification limits.
