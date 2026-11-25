# Buyer specifications display

- `product-specifications.ts` marks API `free_text` string items for full-width plain-text rendering, preserving literal markup/newlines. Empty explicit text suppresses legacy description fallback; existing typed rows, zero/false, SKU/brand and variant overrides remain supported.
- `ProductSpecificationSection.tsx` renders text directly without a nested card or border. The full specifications tab omits repeated section/group headings. Preview clips long content to six lines with an action opening the full tab. Empty specifications hide the tab/section.
- `ProductDetailInfo.tsx` uses the shared renderer for preview and full view. Existing outer detail panel remains. No API changes or dependencies.
- Verification: 8 focused regression tests, TypeScript and lint for changed files pass. Web export passes. Chrome DevTools with synthetic data and real detail component verified 320/1440 px, preserved blank lines, literal markup, long-token wrapping, preview/full navigation, empty state and legacy typed table; no console warnings/errors. Fixture `.local/specifications-ui` stubs only reviews/sidebar dependencies; no real API writes.
- Full-project lint is blocked by an existing import-parser error at `src/components/orders/OrderDetailView.tsx:94`, reported through `app/order/[id].tsx`. This file is outside this change. No deployment or commit.
