# Single account role compatibility

- Backend now derives Profile.roles and JWT claims only from Accounts.Role; Profile.roles remains a string array containing one value. Existing member/admin-voucher visibility logic and profile types remain compatible.
- Added API regression coverage for Customer/Seller/Admin/SuperAdmin login, followed by refresh to Customer. The refreshed profile replaces old permissions rather than merging roles.
- No UI or Expo API changes required. Access/refresh recovery continues using the existing session transport.
- Verification: 32 API/session-maintenance tests pass (`node node_modules/vitest/vitest.mjs run --pool=threads tests/api.test.ts tests/session-maintenance.test.ts`); TypeScript and ESLint pass. Direct Node invocation avoids Windows sandbox npm/worker spawn restrictions.
- Deploy the matching backend before removing AccountRoles from the shared database; sign in again after migration revokes legacy sessions.
