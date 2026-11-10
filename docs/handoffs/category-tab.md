# Category tab

## Reference card layout

- Follow-up: outer white card removed; DB images now fill cards with `cover`, no unselected border, smaller section heading and category labels. Label padding reduced accordingly.

- Updated `CategoryGrid` to a white section with a larger red grid icon/heading and landscape pastel cards. Stored category images sit on the right with `contain`; names overlay a translucent lower-left label. No replacement imagery or DB/API edits.
- Column count follows measured content width (5 desktop, 4 tablet, 2 phone); selection/checkmark, All reset and product filtering remain available.
- Verification: 59 tests, TypeScript and direct ESLint (`node node_modules/eslint/bin/eslint.js .`) passed. The Expo lint wrapper stalled. Chrome visual QA blocked by DevTools profile conflict (`browser is already running`); desktop/mobile appearance remains unverified in a browser for this update.

- Follow-up: `Categories.IconUrl` was removed from DB/API and frontend; category cards now use the retained image and name. See backend `docs/handoffs/remove-category-icon-url.md` for migration/backup details.

- Fixed shared `CatalogScreen` rendering brand discovery in `/categories`. Brand cover/directory queries and UI are now home-only; `/brands` remains a standalone brand directory.
- Category tab loads `GET /categories?pageSize=100` and renders stored images/icons, selected state and All control through `CategoryGrid`. Layout: five columns desktop, four tablet, two phone.
- Selecting a category resets pagination and adds `categoryId` to product queries. Services have no category association, so their query, cached results, errors and page count are excluded while filtering a category. Clearing the selection restores All browsing.
- Added Category API type and screen regression tests for category data, home isolation and empty state. No backend/schema/data changes.
- Verified 59 frontend tests, TypeScript, ESLint. Real Chrome: 10 DB categories, no brand directory on category tab, category selection generated a successful product request with categoryId and no unrelated service request, desktop/mobile screenshots, no horizontal overflow at 390px and no console warnings/errors.
