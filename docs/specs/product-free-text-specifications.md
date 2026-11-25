# Buyer free-text specifications

- Render API specification items with key `free_text` and string values as full-width plain text in the existing product specifications section. Preserve newlines and literal markup; never parse HTML or guess key/value fields.
- Preserve existing typed/legacy tables and selected variant attributes. Empty explicit free text suppresses stale legacy specifications. Hide empty sections/tabs when no metadata remains.
- Long text previews use six lines and an explicit action opening the full specifications tab. Full view has no truncation; wrap long tokens on small screens.
- On the specifications tab, show content immediately without repeating the tab title or group titles. No nested card/border around specifications. Keep the existing outer detail panel and typed row formatting.
- Implementation: first add projection/preview regression tests, then a reusable section renderer, wire existing detail tabs, verify typecheck/lint/tests/web rendering at 320 and 1440 px. No dependencies, endpoint changes, production writes or deployment.
- Commands in `frontend`: `npm test -- --run tests/product-specifications.test.ts`, `npm run typecheck`, `npm run lint`, `npm run build`.
