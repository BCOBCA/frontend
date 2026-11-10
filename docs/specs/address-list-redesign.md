# Shipping address list

Match the supplied reference: location icon/title/subtitle and top-right add button; compact white address rows with recipient, phone and location; red-tinted default row with badge; default/edit/delete actions. Wrap rows and controls on phones without horizontal overflow.

Keep GET/DELETE endpoints and editor routes. Add default selection using the existing PUT address endpoint with explicit unchanged recipient/location fields and `isDefault: true`. Server already clears other defaults transactionally. Serialize user actions while a mutation runs, invalidate addresses after success, and expose loading/error/empty states.

Resolve stored codes using existing cached province/ward catalog keys. Catalog failures must not hide or block existing addresses; fall back to the stored values. No backend contract changes, new dependencies, credentials or unrelated redesigns.

Plan: Test default payload and card actions; implement card/list presentation and route wiring; run focused tests, TypeScript/ESLint, verify desktop/mobile in browser using synthetic addresses, then remove the temporary preview and record a handoff.

Completed: reference layout, default action, cached location labels and responsive controls implemented. Verification and limits are recorded in `docs/handoffs/address-list-redesign.md`.
