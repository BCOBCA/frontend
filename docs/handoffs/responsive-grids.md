# Responsive grid rounding

- At iPhone 16 width (393px), browser scaling can yield 393.6 CSS pixels while React Native reports 394. Exact division then renders cards slightly wider than the available row and flex-wrap collapses into one left-aligned column.
- Shared `gridItemWidth` reserves 1px for the measurement rounding difference and floors each card width. Product and offer grids now measure their actual containers; brand/category grids reuse existing measurements with the same helper.
- Applied to home products, search, brand products, favorites, brand covers/directory, categories, offers and affiliate products. Existing column breakpoints and gaps preserved.
- Regression tests cover fractional containers, rounded layout measurements and rows fitting within their actual width. Brand listing test asserts row fit instead of an exact obsolete width.
- Validation: all 385 frontend tests passed, typecheck passed, targeted ESLint passed. Browser fixtures reproduce the original failure at 393px and confirm two-column product/brand/category/offer rows after the fix, two product columns at 375px, six desktop product columns and no document overflow. Offer page console clean.
