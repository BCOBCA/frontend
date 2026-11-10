# Seven-day check-in

- Visual refinement: tighter padding/gaps, 44px desktop day circles and 44px CTA; reuse existing `MemberStar` for reference-matching gold stars, with a two-tone SVG `CheckInGift`. Reduced glow and shadow. Verified 50 tests, TypeScript, ESLint, desktop/mobile Chrome screenshots, no horizontal overflow at 320px and no console warnings/errors in inspected page.

- `CheckInPanel` matches the supplied seven-step reference, including connected stars, today's calendar, day-seven gift and red gradient CTA. Small screens keep all seven steps visible and stack reward labels.
- User explicitly requested existing reward amounts remain unchanged. All seven rewards come from public `GET /api/membership/check-in-program`; no day-seven bonus or financial rule change.
- Membership adds optional `checkInStreakDays`. Backend returns the stored streak for today/yesterday, otherwise zero; frontend wraps visual progress every seven days. Guests always start at day one and navigate to login when pressing the CTA.
- Public configuration contains reward and enabled state only. Existing authenticated check-in transactions, duplicate protection and ownership remain intact. Deploy backend together with frontend for the new metadata/endpoint.
- Verified: frontend tests, TypeScript, ESLint; PostgreSQL core flow with initial/completed/continuing/broken streak assertions; Chrome guest API data, login navigation, desktop/mobile screenshots and overflow checks. Signed-in UI covered by screen tests; no physical native device test.
