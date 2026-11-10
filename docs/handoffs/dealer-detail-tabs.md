# Dealer detail tabs

- DealerDetailTabs sits at the bottom of the dealer identity/cover card: Sản phẩm, Khuyến mãi, Đánh giá, Giới thiệu. Selected icon/text and underline use the existing primary red.
- The route `tab` parameter selects products/promotions/reviews/about; absent/unknown values default to products. Switching preserves the dealer slug. Tablist, selected states, panel association, and web arrow/Home/End navigation are included. Narrow screens scroll horizontally without a visible indicator.
- Current public branch and contact sections appear only in About. The previous branch province-code suffix and breadcrumb remain removed; introduction stays aligned with dealer name.
- Products/promotions/reviews currently show empty states: no store-scoped APIs or product/store relationship exist. Do not substitute brand/account-owned content (sample dealers share an owner) or fabricate review counts from the reference image. This is a UI change; no backend/schema changes.
- Verification: TypeScript, focused ESLint, and 14 dealer tests pass, including tab-specific rendering, selection semantics and unknown-tab fallback. Live DevTools verification was unavailable because the configured browser profile was already in use; it was not closed.
