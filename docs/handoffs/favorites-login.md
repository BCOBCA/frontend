# Favorites guest presentation

- `app/favorites.tsx` now renders a dedicated guest notice inside the existing Page shell. Signed-in users retain the original DataList, prices, product navigation and pagination.
- `FavoritesLoginNotice` centers a pink vector shopping-bag/heart illustration, requested Vietnamese copy and red user-icon button linking to `/login`. Illustration uses existing react-native-svg; scales to available width. No new dependencies.
- Guest route does not mount DataList or request private favorites. Auth changes switch the presentation through the existing auth store.
- Verification: 61 tests, TypeScript and ESLint passed. Tests cover guest copy, login action, no guest query, and retained authenticated product list. Chrome visual QA unavailable due to existing DevTools browser-profile conflict; rendered desktop/mobile appearance remains unverified.
