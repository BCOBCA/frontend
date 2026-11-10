# Dealer operating provinces

- `/dealer-profile` is linked from Member → Cá nhân → Thiết lập hồ sơ đại lý. It lists owned dealers, including pending profiles, with nationwide or multi-province selection, search, validation, save feedback and cache invalidation.
- Province names come from GET `/dealers/regions`, not free text. Persist one string via PUT `/dealers/{id}/provinces`: `Toàn quốc` or names joined with `, `.
- Dealer cards render `dealer.provinces`, falling back to `Chưa thiết lập phạm vi`. Do not fall back to a branch address. Filters show names; requests retain the `provinceCode` query key.
- Area popup includes `Toàn quốc` immediately after all areas, sending `provinceCode=Toàn quốc` to request only nationwide dealers. Scroll indicators are hidden while the options remain scrollable. Updated backend filter must be deployed for this option.
- Existing customer signup is unchanged; no dealer registration workflow existed. Future dealer signup should reuse the same catalog/validation and store property.
- Native checked states plus explicit `aria-checked` support accessible choices on React Native Web.
- Verified: TypeScript, focused ESLint, 8 dealer service/card tests (`node node_modules/vitest/vitest.mjs run tests/dealers.test.ts tests/dealer-card.test.tsx --pool=threads --maxWorkers=1`), real local API/browser save of 3 provinces and reload, public card display, nationwide switch, responsive checks and clean page console.
- Local QA used frontend `http://localhost:18081` with process-only `EXPO_PUBLIC_API_BASE_URL=http://localhost:5000/api`. The checked-in/local `.env` was not changed; its configured online API needs backend deployment plus migration before using this feature online.
