# Cart reference redesign

- `app/(tabs)/cart.tsx` retains the existing Header and native tab navigator; `CartView` owns vendor panels, responsive product rows and the pinned payment summary above mobile tabs.
- `src/services/cart.ts` groups by store identity (brand fallback), computes checkbox states and uses existing per-line PUT/DELETE contracts. Vendor updates run sequentially, selecting only available lines within stock. Selected unavailable lines can be cleared.
- Amount/selected quantity remain server supplied. Mutations await cart invalidation even on partial failure; pending/refetch/error/invalid selected stock block checkout. API errors use the existing global toast.
- Guest/empty/loading/error states preserved; broken images get a neutral package placeholder. No new dependencies or backend changes.
- Verified: 212 tests across 45 files, TypeScript; ESLint BOM warnings corrected. Browser synthetic fixture checked desktop, 390px and 320px: no horizontal overflow, payment above tabs, keyboard quantity update and vendor deselection correctly update fixture totals/checkout, no console warnings/errors. Temporary fixture route removed.
- Limits: browser interactions used local synthetic cart state; authenticated cart writes and checkout/purchases were not executed. Contract behavior covered by mocked API tests.
