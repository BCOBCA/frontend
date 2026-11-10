# Registration by email or phone

## Scope and acceptance
- Registration fields: full name, email or phone, password, confirm password.
- Reject invalid identifiers, weak passwords and mismatched confirmation; never submit confirmation.
- Send existing API fields: email-only uses `email`, phone-only uses `phone`; the unused field is empty.
- Backend accepts either contact, rejects duplicate nonempty contacts, preserves existing clients and password policy.
- Unique email index must exclude empty email, matching the existing phone index. No synthetic email addresses.

## Plan
1. Add focused validation tests for email, phone, confirmation and backend registration rules.
2. Update form validation and request mapping, then backend validation and duplicate checks.
3. Add the email-index migration and verify frontend checks, backend tests and migration consistency.

## Verification
- Frontend: `npm run typecheck`, `node_modules/.bin/eslint .`, `node_modules/.bin/vitest run --pool=threads`.
- Backend: `dotnet test BCOBCA.Tests/BCOBCA.Tests.csproj` (.NET 10 SDK required).
- Keep existing form styling and session behavior. No new dependencies or OTP flow.

## Implementation and deployment
- Validation and request mapping: `src/components/auth/auth-form.ts`; form: `src/screens/AuthScreen.tsx`.
- Backend keeps the existing `RegisterRequest` contract, accepts empty email with a valid phone, normalizes contacts before validation and checks duplicates only for populated values.
- Apply `20261104093000_AllowPhoneOnlyRegistration` before enabling phone registration. It excludes empty email from the unique index; no existing accounts are rewritten.
- Email verification returns a validation error for accounts without email. Password recovery remains email-based; SMS recovery is outside this change.
- Reverting the migration requires resolving multiple empty-email accounts first; the restored unique index otherwise rejects rollback without deleting account data.
- Frontend validation tests and typecheck passed. Backend registration tests, phone registration/login and empty-email uniqueness passed in the subsequent full 91-test run using workspace SDK `../.tools/dotnet/dotnet.exe` (10.0.403) and a temporary local PostgreSQL database.
