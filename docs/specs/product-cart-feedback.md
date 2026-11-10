# Product-card cart feedback

Acceptance: Replace the cart icon with a spinner only while its add request is pending; disable duplicate taps; restore the cart icon after success/failure. Success slides down from the screen top, with no checkmark or inline card message. Errors also use top feedback so card geometry remains stable. Guest login, stock checks, variants, services and favorites stay intact.

Plan: Prove pending/success/error behavior in ProductCard tests; add an ephemeral toast store + root host using the existing TopToast animation; wire mutation callbacks and remove inline status. Invalidate the cart cache in the background after the POST succeeds. Test replacement/expiry races so an old toast cannot dismiss a newer message. Verify focused/full tests, TypeScript, ESLint and browser toast placement without modifying a real cart.

Scope: Shared ProductCard, TopToast, a dedicated store/host and root mounting. No backend changes, dependencies, persisted notifications or API contract changes.

Completed: pending spinner, restored cart icon, root-level success/error toast and no inline card feedback. 199 tests, TypeScript and ESLint passed; browser verification and live-request limitations are recorded in `docs/handoffs/product-cart-feedback.md`.
