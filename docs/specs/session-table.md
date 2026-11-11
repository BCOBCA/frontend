# Login sessions table

Redesign `/sessions` as a compact table using the current API's deviceName, createdAt and expiresAt. Columns: index, device, login time, expiration time, revoke action. No inferred IP, location, browser or current-session badge because the API does not provide these. Preserve existing authenticated GET/DELETE and login/loading/error/empty states; scope cache by account.

Use shared red/white theme, compact per-row buttons, accessible table roles and horizontally scrollable table within the viewport on small screens. No backend, auth-flow or dependency changes. Split table presentation from route fetching/mutation. Verify rendering/actions and route contracts with focused tests, TypeScript/lint, browser desktop/mobile layout and web build.
