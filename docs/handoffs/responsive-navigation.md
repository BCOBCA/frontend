# Responsive navigation

## Requirements
- At widths >=1024px: full-width header, brand at the left (16px inset), search next, five tabs on the right; no bottom tab bar.
- Below 1024px: logo and search share one row, no brand text; existing bottom tabs remain.
- Keep back controls and detail-page titles. Every tab, including member, retains navigation.
- Search on other tabs submits to the catalog; catalog search continues filtering normally.

## Implementation plan
1. Share the desktop breakpoint and tab definitions; hide bottom tabs at that breakpoint.
2. Update the shared header and ensure member renders it. Preserve native layout and accessibility.
3. Connect submitted search to catalog parameters, then run typecheck, ESLint, tests and responsive browser checks.

## Boundaries
Expo 58 / React Native 0.88; existing tokens and routing. No new dependencies, backend or authentication changes.

## Verification
Commands: `npm run typecheck`, `node node_modules/eslint/bin/eslint.js .`, `npm test`.
Browser: desktop/mobile, active tabs, member navigation, search submission, resize around 1024px.

## Result
- Shared definitions: `src/navigation/tabs.ts`; header and bottom tabs use the same breakpoint.
- `Header` shows desktop navigation links with `aria-current`; member gets the shared header through `Page`.
- Catalog search uses route parameters as its source of truth, avoiding stale local state when resubmitting a previous query.
- Typecheck, ESLint and `npm run build` passed; 10 existing API tests passed. Headless Chrome screenshots confirmed desktop navigation, mobile footer, and the member header; a direct catalog search URL populated the input correctly.
- Browser connectors were unavailable. Interactive clicks, device-native rendering and backend-dependent results were not verified. Local API requests currently show connection errors.
