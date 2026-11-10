# Dealer industry filter

- Replace verified/all-dealers dropdown with `Ngành nghề bán hàng`, default `Tất cả ngành nghề`. Options come from GET `/dealers/categories` (existing active product categories).
- URL/query uses `categoryId`; changing a filter resets page 1. Reset clears category as well as search/area. The new client ignores/removes legacy verifiedOnly and does not send it to the API. Region and popularity/newest/name sort controls remain.
- `/dealer-profile` includes DealerCategoryForm for per-dealer multi-selection, clearing and saving via PUT `/dealers/{id}/categories`. Success invalidates owned profile and public dealer caches. Explicit aria-checked supports web checkboxes.
- Backend migration `20261107023003_AddStoreCategories` and updated API are required before using the category filter online. Existing stores need explicit category assignments through owner setup; none are guessed from shared account ownership.
- Verification: TypeScript, focused ESLint, dealer service/card tests. Chrome DevTools could not attach because its configured browser profile was already in use; live browser verification of this change remains outstanding.
