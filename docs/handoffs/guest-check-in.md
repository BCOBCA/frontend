# Guest check-in

- Promotions always renders the existing points/check-in controls. Guests see zero points and an unclaimed button; clicking opens `/login` without calling the check-in API.
- Signed-in balance/completion/loading/error states still use the user-specific membership query. Guest rendering ignores any cached member data.
- Verified: 47 frontend tests and TypeScript; ESLint. Chrome confirmed guest panel and login navigation with no horizontal overflow in the inspected viewport.
- Local backend was unavailable during browser verification, so live authenticated API behavior was not exercised; signed-in states are covered by screen regression tests.
