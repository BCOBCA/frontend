# Cart reference redesign

Objective: Match the supplied reference: standard header, red cart/title with line count, white vendor-group panels, vendor/line checkboxes, image/name/variant/red unit price, compact quantity stepper and delete action at right. Keep a white total/checkout bar pinned below scrolling content; on phones it sits above the existing tab navigator.

Preserve guest/empty states, cart API contracts, quantity limits, stock checks, selection and checkout routing. Group by actual store identity with brand fallback for legacy records. Vendor checkbox selects eligible lines only and can clear selected unavailable lines. Refetch after successful or partially failed operations; block checkout until mutations/refetch finish. Amount and selected quantity come from GET /cart rather than local recalculation.

Plan:
1. Add focused grouping/selection/API operation tests and implementation.
2. Build checkbox, cart row, vendor group and pinned summary presentation; wire existing route and retain mobile tabs/desktop header.
3. Run cart regressions, full tests, TypeScript and ESLint. Check desktop/mobile screenshots and interactions using synthetic data, without changing a real cart. Record verification limits in a handoff.

Scope: frontend cart feature only. No dependencies, backend schema/endpoint changes or real purchases.
