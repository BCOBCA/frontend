# Shared product search

## Accepted behavior
- New `/search` page is the single product search destination for category clicks and the shared header search input/icon.
- Category grid remains category-only. Clicking a root category navigates with its ID; backend product category filtering already includes descendants. No banner or service results on search.
- Search URL owns search/categoryId/sort/page. Submit changes reset page; category selection/clear and sort preserve other applied filters. Refresh/back/deep links restore filters. Bound page, sort, keyword length and UUID inputs.
- Global header submits to `/search` on every page, including home/categories. On search page submit preserves the selected category. Typing drafts does not unexpectedly navigate on each keystroke.
- Results show actual count, root-category selector, keyword/category context, sort, existing ProductCard and pagination; loading/error/empty states support retry/reset. Keep home product/brand content.

## Plan / verification
1. Add failing filter/URL and category-click navigation tests.
2. Implement helper/route/SearchScreen, shared Header submit contract and category navigation.
3. Verify existing category/home tests plus search/header tests, TypeScript and focused ESLint. Read-only HTTP check existing product API. Attempt browser verification if available.
4. Update handoff. No backend/schema/data changes or commits/deploys in this task.
