# Dealer detail tabs

- Add Products / Promotions / Reviews / About under the dealer identity block, using matching icons and a red selected underline.
- Selected tab is in the `tab` URL param. Default/unknown values select products. Keep slug and other route state when switching.
- About owns current public branch/contact content. Existing APIs do not link products, promotions or reviews to Stores, so these panels show honest empty states. No fabricated review count or unrelated brand/account data.
- Horizontal scrolling on narrow screens; hidden scroll indicator; tab/tabpanel roles, selection state and keyboard navigation on web.
- Verify tab-specific rendering via focused SSR tests, TypeScript and ESLint. Try DevTools; its profile may be occupied by an existing session.
