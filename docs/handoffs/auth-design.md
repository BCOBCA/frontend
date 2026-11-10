# Authentication screen refresh

## Scope and acceptance
- Match the supplied centered white form composition with the current logo.
- Use pale pink, peach and red flowing backgrounds, without building photography.
- Keep login/register validation, API payloads, session handling and redirects.
- Keep forgot-password and login/register links; add accessible password visibility controls.
- Preserve responsive header navigation and keyboard/scroll access on small screens.
- Do not add nonfunctional social login or session-persistence controls.

## Plan
1. Add a reusable SVG backdrop and auth input styling using existing dependencies.
2. Restyle the shared auth screen, leaving submit/validation logic intact.
3. Run typecheck, ESLint, existing auth/API tests, web build and desktop/mobile visual checks.

## Validation
- Typecheck, ESLint, 10 existing API/session tests and web export passed.
- Headless Chrome screenshots verified both forms at desktop sizes, login/register at a narrow viewport, and the full register card on a 1366x768 laptop.
- Independent review found no blocking issues; validation schema, API payloads and session handling remain unchanged.
- Interactive browser connections were unavailable. Password visibility, keyboard focus and device-native keyboard avoidance were reviewed in code; no real credentials or production accounts were used.

## Files
- `src/screens/AuthScreen.tsx`: shared responsive login/register composition.
- `src/components/auth/AuthField.tsx`: icons, validation messages, forwarded input refs and password visibility.
- `src/components/auth/AuthBackground.tsx`: code-native pale pink/peach SVG backdrop.
