# Root navigation during session recovery

- Reported symptom: Expo Router logs an unhandled `ROUTE_NAMES_CHANGED` action. Root layout previously removed the entire `Stack` during initial session restoration, guest recovery retries and recovery failures.
- `app/_layout.tsx` now always renders the same root `Stack`. A `SessionGate` inside `screenLayout` blocks route contents until session recovery completes and preserves the existing retry UI. Signed-in background recovery continues showing routes. Authentication rules and API handling are unchanged.
- `tests/root-layout.test.tsx`: seven cases covering initial/loading/error/retry, guests, signed-in users and background recovery. Four cases fail against the original conditional root navigator. All 455 frontend tests, typecheck and lint pass.
- Browser: isolated real Expo Router fixture, initial loading → guest → navigate to `/other` → recovery error → loading → guest. Root key and `/other` preserved; no console warnings/errors. Fixture files removed.
- Exact screenshot error was not reproduced on the live app in this session. Live session restoration was blocked by backend CORS from localhost; lifecycle browser checks used a stubbed auth store without real accounts. If the error persists after a full reload, capture the full action/target and trigger for further investigation.
- Reference: https://docs.expo.dev/router/advanced/authentication-rewrites/#navigating-without-navigation (root navigator must exist before navigation events).
