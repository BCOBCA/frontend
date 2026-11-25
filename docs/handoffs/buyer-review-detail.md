# Buyer review detail

- Notification target remains `/review/[id]` with purchased order-item ID. The route now uses buyer-scoped `my-review` data and a dedicated read-only `ReviewDetailView` instead of stretching the form across the page.
- Page body caps at 760px. Separate buyer/reply sections show real dates, five rating stars, full selectable content, review photos, shop name and a link to buyer orders. Available product context includes thumbnail/name and product navigation.
- Updated to the supplied reference: product is a separate compact card; buyer review and pink shop reply share one card, with reply date in its header. No “Đã gửi” tag or submitted-status row. Verified badges are not fabricated from a reply that has no verification field. Mobile/desktop screenshots rechecked at 320/375/1440px; 7 focused tests, typecheck and ESLint pass.
- Optional product fetch uses the existing public product endpoint/cache and disables retries. A removed/unavailable product does not block the review/reply; a failed image falls back to the package icon.
- Login, review loading/retry and first-review form remain available. The form appears only after a successful null review response. Existing popup and public product reviews are unchanged.
- Validation: 496 tests across 98 frontend test files pass. Review view/route regression tests cover scoped queries, encoded item IDs, guest gating, null-vs-loading/error states, unavailable products, absent shop replies, escaped content and navigation callbacks. Typecheck and focused ESLint pass.
- Browser fixture uses actual view/theme/Lucide icons with SVG/image adapters. 320px, 375px and 1440px screenshots checked; no horizontal overflow; all five stars render. Fixture files/screenshots live under ignored `.cache/review-detail-preview`. Native devices and a live signed-in API session were not exercised.
- No backend or dependency changes.
