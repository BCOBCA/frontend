# Category tab correction

- `/categories` must load `/categories?pageSize=100` and render active database categories with their stored image/icon, selection and an All control. Home retains the brand covers/directory.
- Selecting a category resets product pagination and adds `categoryId` to the existing product API query. Services have no category association, so hide/disable their query while a category is selected; keep normal mixed browsing in All.
- Keep loading, error/retry and empty states. Mobile uses a compact two-column category grid, with more columns on tablet/desktop.
- Plan: screen regression tests for route data and home isolation; add category type/grid and wire catalog; verify tests, TypeScript, ESLint and real-browser category selection/network requests/responsive layout.

## Reference layout update

- Follow-up: remove the outer section card/background/padding, let DB images cover each entire category card, and reduce heading/category-label typography. Preserve responsive layout and filtering.

- Match the supplied reference with a white section, red grid icon, bold heading and compact landscape cards: five columns on desktop, four on tablet, two on phones.
- Use pastel card backgrounds, rounded corners and a translucent lower-left name label over the image area. Keep names and image URLs from the database; preserve category order, selection, All reset and product filtering.
- Scope: `src/components/categories/CategoryGrid.tsx`; no API, database or dependency changes. Follow existing inline React Native styles, e.g. `style={{ borderRadius: 14 }}`.
- Steps: update the presentation, run existing catalog regression tests plus typecheck/lint, then inspect desktop/mobile in the browser when available. This is a presentation-only change; no new business logic tests are needed.
- Commands: `npm test`, `npm run typecheck`, `npm run lint`, `npm run web`.
