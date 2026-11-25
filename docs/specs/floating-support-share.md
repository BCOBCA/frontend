# Floating support and sharing

Objective: reproduce the two supplied mobile references with white circular headset/share buttons at the lower right, a six-item support popover, and a red/white sharing dialog with QR and copy/share actions.

Stack: existing Expo 58, React Native, Expo Router, Lucide, expo-clipboard, bwip-js, react-native-svg. No dependencies or backend changes.

Scope: `src/components/common/`, root session gate, `tests/`. Preserve existing edits and routing conventions. Example: `<Pressable accessibilityRole="button" accessibilityLabel="Chia sẻ" onPress={...}>`.

Acceptance: buttons clear mobile bottom navigation; only one popup opens; backdrop and Back/Escape dismiss; six support destinations work; QR encodes exactly the copied/shared URL; clipboard failures remain visible; small screens can scroll the dialog. Original URL is available without an account. Do not invent a short URL, hotline, or shop chat endpoint. Hotline/chat can be configured with public environment variables and otherwise route to existing feedback support.

Plan: (1) support popover and focused rendering/action tests; (2) sharing dialog and real URL/QR/action tests; (3) root integration, typecheck/lint/tests and browser verification where available.

Commands (frontend): `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`; dev `npm run web`.

Boundaries: local UI only; no secret access, unrelated refactors, auto-commits, new services, or fabricated referral links. Short-link tab disabled until a real short URL is supplied. Native share links use Expo Linking; web links use the current origin and route path without sensitive query parameters.

User clarification: implement interface first; hotline, shop chat and callback display an inline pending-configuration message. Do not add external contact integration yet.
