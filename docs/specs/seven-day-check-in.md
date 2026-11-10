# Seven-day check-in panel

- Visual refinement: reduce panel padding, step sizes and CTA height; reuse `MemberStar` (gold star on a base) for heading/steps and use a restrained two-tone SVG gift. Preserve all check-in behavior. Verify frontend checks and desktop/mobile rendering.

- Match the supplied reference: white rounded panel on red, gold star heading, helper copy, seven connected reward steps, calendar for today's step, gift on day seven, wide red pill action.
- Guests start on day one and open login on press. Members use server streak/completion; missing a day resets the visual cycle; every seventh day completes a cycle. Never reuse another account's mutation success.
- Add optional streak metadata to membership and a public check-in program endpoint; preserve existing fields. User confirmed existing reward amounts must remain unchanged, including day seven; the gift is decorative.
- Plan: tests for progress/cycle boundaries; implement presentation and additive server metadata; wire promotions; verify tests, TypeScript, ESLint, backend build and browser screenshots.
- Commands: frontend `npm test`, `npm run typecheck`, `npm run lint`; backend `dotnet test BCOBCA.sln`. Preserve unrelated work and existing daily uniqueness/transactions. No new dependencies or schema changes.
