# Profile birthday input

Objective: Enter a birthday as DD/MM/YYYY or select it from a calendar on web and mobile. Keep the API date-only contract YYYY-MM-DD and existing 1900/today bounds. Empty input remains supported. Invalid input must not become a different valid birthday.

Plan:
1. Add and test date display/input conversion; preserve existing profile schema validation.
2. Add a focused birthday field with a calendar modal, month navigation and direct year entry. Integrate with ProfileEditor without changing other fields.
3. Run profile tests, TypeScript and ESLint; verify typing and selecting in the browser.

Files: src/components/profile/, tests/profile-birthday.test.ts, ProfileEditor.tsx. Follow existing React Native fields and theme tokens. No dependencies, backend changes or unrelated refactoring.

Commands: `node node_modules/vitest/vitest.mjs run tests/profile-birthday.test.ts tests/profile-data.test.ts`; `npm run typecheck`; `npm run lint`.

Acceptance: Existing birthday displays as DD/MM/YYYY, manual entry and calendar selection produce the same ISO value, invalid/leap/future dates follow existing validation, cancel preserves input, saving disables input and calendar, calendar closes when the profile loses focus.

Verified: 13 profile tests passed; TypeScript and ESLint passed. Browser checks confirmed typed 29/02/2000 becomes 2000-02-29, calendar selection updates the same field, and February 2001 excludes leap day. Calendar screenshots checked at desktop and 320px widths. Authenticated API save was not exercised; the existing API contract is preserved.
